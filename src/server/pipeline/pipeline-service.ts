import "server-only";
import { randomUUID } from "crypto";
import type { AgentStatus, GliaFlag, PipelineRun } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getMemoryStore } from "@/server/persistence/memory-store";
import { findPatient } from "@/server/persistence/patient-repository";
import { getReportDraft } from "@/server/persistence/drafts";
import { saveDraft } from "@/server/reports/report-service";
import { completeWithClaude } from "@/server/ai/anthropic";
import {
  BROCA_SYSTEM_PROMPT,
  buildBrocaUserMessage,
  type BrocaOutput,
  GLIA_SYSTEM_PROMPT,
  buildGliaUserMessage,
  type GliaOutput,
  NORM_SYSTEM_PROMPT,
  buildNormUserMessage,
  type NormOutput,
  WERNICKE_SYSTEM_PROMPT,
  buildWernickeUserMessage,
  type WernickeOutput,
} from "@/server/ai/agents";
import {
  recordGeneration,
  withAgentSpan,
} from "@/server/observability/arize";
import { captureAgentError } from "@/server/observability/sentry";
import { searchPatientHistory } from "@/server/persistence/redis";
import type { PatientRecord } from "@/data/contracts";

const AGENT_SEQUENCE = ["wernicke", "norm", "engram", "broca", "glia"] as const;

/**
 * Glia is given draftSections keyed by the report screen's own section keys
 * (reasonForReferral, history, behavioralObservations, interpretation, summary)
 * but sometimes echoes back Broca's original canonical section names instead —
 * map both forms to the report screen's display section keys.
 */
const SECTION_KEY_MAP: Record<string, string> = {
  "REASON FOR REFERRAL": "Reason for Referral",
  REASONFORREFERRAL: "Reason for Referral",
  "BACKGROUND AND HISTORY": "History",
  HISTORY: "History",
  "BEHAVIORAL OBSERVATIONS": "Behavioral Observations",
  BEHAVIORALOBSERVATIONS: "Behavioral Observations",
  "TEST RESULTS AND INTERPRETATION": "Interpretation",
  INTERPRETATION: "Interpretation",
  "SUMMARY AND IMPRESSIONS": "Summary",
  SUMMARY: "Summary",
  RECOMMENDATIONS: "Summary",
};

function mapToReportSectionKey(section: string): string {
  const exact = SECTION_KEY_MAP[section.toUpperCase()];
  if (exact) return exact;
  const match = Object.entries(SECTION_KEY_MAP).find(([key]) =>
    section.toUpperCase().includes(key) || key.includes(section.toUpperCase())
  );
  return match?.[1] ?? section;
}

function parseAgentJson<T>(raw: string): T | null {
  try {
    const normalized = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    return JSON.parse(normalized) as T;
  } catch {
    return null;
  }
}

function applyBrocaOutput(
  current: Record<string, string>,
  output: BrocaOutput
): Record<string, string> {
  const sections = output.sections;
  const summary = sections["SUMMARY AND IMPRESSIONS"];
  const recommendations = sections.RECOMMENDATIONS;
  return {
    ...current,
    ...(sections["REASON FOR REFERRAL"] && {
      reasonForReferral: sections["REASON FOR REFERRAL"],
    }),
    ...(sections["BACKGROUND AND HISTORY"] && {
      history: sections["BACKGROUND AND HISTORY"],
    }),
    ...(sections["BEHAVIORAL OBSERVATIONS"] && {
      behavioralObservations: sections["BEHAVIORAL OBSERVATIONS"],
    }),
    ...(sections["TEST RESULTS AND INTERPRETATION"] && {
      interpretation: sections["TEST RESULTS AND INTERPRETATION"],
    }),
    ...((summary || recommendations) && {
      summary: [summary, recommendations].filter(Boolean).join("\n\n"),
    }),
  };
}

function log(agent: AgentStatus["agent"], phase: AgentStatus["phase"], message: string): AgentStatus {
  return { agent, phase, message, timestamp: new Date().toISOString() };
}

export async function createPipelineRun(input: {
  clinicianId: string;
  patientId: string;
  draftId: string;
}): Promise<PipelineRun> {
  const now = new Date().toISOString();
  const run: PipelineRun = {
    id: randomUUID(),
    clinicianId: input.clinicianId,
    patientId: input.patientId,
    draftId: input.draftId,
    phase: "running",
    progress: 0,
    currentAgent: AGENT_SEQUENCE[0],
    startedAt: now,
    updatedAt: now,
    agentLog: [log("band", "thinking", "Session received and pipeline started")],
  };
  getMemoryStore().pipelines.set(run.id, run);
  return run;
}

export function getPipelineRun(id: string): PipelineRun | null {
  return getMemoryStore().pipelines.get(id) ?? null;
}

export function setPipelinePhase(id: string, phase: "running" | "paused"): PipelineRun {
  const run = getPipelineRun(id);
  if (!run) throw new Error("Pipeline run not found");
  const next = { ...run, phase, updatedAt: new Date().toISOString() };
  getMemoryStore().pipelines.set(id, next);
  return next;
}

async function runWernicke(patient: PatientRecord): Promise<WernickeOutput | null> {
  const output = await completeWithClaude({
    system: WERNICKE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildWernickeUserMessage({ patient }) }],
  });
  return parseAgentJson<WernickeOutput>(output);
}

async function runNorm(patient: PatientRecord, clinicalContext?: string): Promise<NormOutput | null> {
  const output = await completeWithClaude({
    system: NORM_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildNormUserMessage({ patient, testBattery: patient.testBattery, clinicalContext }),
      },
    ],
  });
  return parseAgentJson<NormOutput>(output);
}

async function runGlia(input: {
  draftSections: Record<string, string>;
  clinicalContext: string;
  normativeInterpretation: string;
  sourceTranscript: string;
}): Promise<GliaOutput | null> {
  const output = await completeWithClaude({
    system: GLIA_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildGliaUserMessage(input) }],
  });
  return parseAgentJson<GliaOutput>(output);
}

function gliaFlagsFromOutput(output: GliaOutput): GliaFlag[] {
  return output.flags.map((flag, index) => ({
    id: `glia-${Date.now()}-${index}`,
    section: mapToReportSectionKey(flag.section),
    severity: flag.severity === "info" ? "note" : "verify",
    title: flag.message,
    detail: flag.suggestion ?? flag.message,
  }));
}

export async function advancePipeline(id: string): Promise<PipelineRun> {
  const run = getPipelineRun(id);
  if (!run) throw new Error("Pipeline run not found");
  if (run.phase === "paused" || run.phase === "complete") return run;

  const step = Math.min(Math.floor(run.progress / 20), AGENT_SEQUENCE.length - 1);
  const agent = AGENT_SEQUENCE[step];
  const nextProgress = Math.min(run.progress + 20, 100);
  const complete = nextProgress === 100;
  const nextAgent = complete ? "complete" : AGENT_SEQUENCE[Math.min(step + 1, 4)];
  const next: PipelineRun = {
    ...run,
    phase: complete ? "complete" : "running",
    progress: nextProgress,
    currentAgent: nextAgent,
    updatedAt: new Date().toISOString(),
    agentLog: [
      ...run.agentLog,
      log(agent, "done", `${agent} completed`),
    ],
  };
  getMemoryStore().pipelines.set(id, next);

  return withAgentSpan(
    `cortex.agent.${agent}`,
    {
      agent,
      sessionId: next.id,
      patientId: next.patientId,
    },
    async (span) => {
      span.setAttributes({
        "pipeline.progress": next.progress,
        "pipeline.phase": next.phase,
      });

      const anthropicReady = getRuntimeCapabilities().anthropic === "configured";
      const needsRecord = anthropicReady || agent === "engram" || agent === "glia";
      const patient = needsRecord ? await findPatient(next.patientId) : null;
      const draft = needsRecord ? await getReportDraft(next.draftId) : null;

      if (agent === "wernicke" && anthropicReady && patient && draft) {
        try {
          const output = await runWernicke(patient);
          if (output) {
            await saveDraft({
              ...draft,
              agentNotes: { ...draft.agentNotes, wernicke: JSON.stringify(output) },
            });
            span.setAttribute("wernicke.red_flags", output.redFlags.length);
          }
        } catch (error) {
          console.warn("[cortex-pipeline] Wernicke generation failed; retaining deterministic context", error);
          captureAgentError(error, { agent: "wernicke", sessionId: next.id, patientId: next.patientId });
        }
      }

      if (agent === "norm" && anthropicReady && patient && draft) {
        try {
          const wernickeNote = parseAgentJson<WernickeOutput>(draft.agentNotes.wernicke ?? "");
          const output = await runNorm(patient, wernickeNote?.clinicalContext);
          if (output) {
            await saveDraft({
              ...draft,
              agentNotes: { ...draft.agentNotes, norm: JSON.stringify(output) },
            });
            span.setAttribute("norm.domains", output.domainInterpretations.length);
          }
        } catch (error) {
          console.warn("[cortex-pipeline] Norm generation failed; retaining deterministic interpretation", error);
          captureAgentError(error, { agent: "norm", sessionId: next.id, patientId: next.patientId });
        }
      }

      if (agent === "engram" && getRuntimeCapabilities().redis === "configured" && patient && draft) {
        const evidence = await searchPatientHistory(
          `${patient.demographics.referralReason}\n${patient.visitTranscript}`,
          5
        );
        await saveDraft({
          ...draft,
          agentNotes: { ...draft.agentNotes, engramEvidence: JSON.stringify(evidence) },
        });
        span.setAttribute("engram.result_count", evidence.length);
      }

      if (agent === "broca" && anthropicReady && patient && draft) {
        try {
          const wernickeNote = parseAgentJson<WernickeOutput>(draft.agentNotes.wernicke ?? "");
          const normNote = parseAgentJson<NormOutput>(draft.agentNotes.norm ?? "");
          const clinicalContext = wernickeNote?.clinicalContext ?? patient.visitTranscript;
          const normativeInterpretation =
            normNote?.overallProfile ??
            patient.testBattery.map((score) => `${score.test} ${score.subtest ?? ""}: ${score.classification}`).join("\n");

          const input = buildBrocaUserMessage({
            clinicalContext,
            normativeInterpretation,
            patientName: patient.demographics.name,
            referralReason: patient.demographics.referralReason,
          });
          const generated = await withAgentSpan(
            "cortex.agent.broca.generate",
            { agent: "broca", sessionId: next.id, patientId: next.patientId },
            async () => {
              const raw = await completeWithClaude({ system: BROCA_SYSTEM_PROMPT, messages: [{ role: "user", content: input }] });
              recordGeneration(input, raw);
              return raw;
            }
          );
          const output = parseAgentJson<BrocaOutput>(generated);
          const sections = output ? applyBrocaOutput(draft.sections, output) : { ...draft.sections, generatedDraft: generated };
          await saveDraft({ ...draft, sections, status: "generating" });
        } catch (error) {
          console.warn("[cortex-pipeline] Claude generation failed; retaining deterministic draft", error);
          captureAgentError(error, { agent: "broca", sessionId: next.id, patientId: next.patientId });
        }
      }

      if (agent === "glia" && patient && draft) {
        const latestDraft = (await getReportDraft(next.draftId)) ?? draft;
        let flags: GliaFlag[] | null = null;
        if (anthropicReady) {
          try {
            const wernickeNote = parseAgentJson<WernickeOutput>(latestDraft.agentNotes.wernicke ?? "");
            const normNote = parseAgentJson<NormOutput>(latestDraft.agentNotes.norm ?? "");
            const output = await runGlia({
              draftSections: latestDraft.sections,
              clinicalContext: wernickeNote?.clinicalContext ?? patient.visitTranscript,
              normativeInterpretation: normNote?.overallProfile ?? "",
              sourceTranscript: patient.visitTranscript,
            });
            if (output) {
              flags = gliaFlagsFromOutput(output);
              span.setAttribute("glia.completeness_score", output.completenessScore);
              span.setAttribute("glia.consistency_score", output.consistencyScore);
            }
          } catch (error) {
            console.warn("[cortex-pipeline] Glia review failed; leaving prior flags in place", error);
            captureAgentError(error, { agent: "glia", sessionId: next.id, patientId: next.patientId });
          }
        }
        if (flags) span.setAttribute("glia.unresolved_flags", flags.length);
        await saveDraft({
          ...latestDraft,
          status: "review",
          agentNotes: flags ? { ...latestDraft.agentNotes, flags: JSON.stringify(flags) } : latestDraft.agentNotes,
        });
      }

      return next;
    }
  );
}
