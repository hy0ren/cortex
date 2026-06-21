import "server-only";
import { randomUUID } from "crypto";
import type { AgentStatus, PipelineRun, ReportDraft } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getMemoryStore } from "@/server/persistence/memory-store";
import { findPatient } from "@/server/persistence/patient-repository";
import { getReportDraft } from "@/server/persistence/drafts";
import { saveDraft } from "@/server/reports/report-service";
import { completeWithClaude } from "@/server/ai/anthropic";
import { BROCA_SYSTEM_PROMPT, buildBrocaUserMessage } from "@/server/ai/agents/broca";
import {
  recordGeneration,
  withAgentSpan,
} from "@/server/observability/arize";
import { searchPatientHistory } from "@/server/persistence/redis";

const AGENT_SEQUENCE = ["wernicke", "norm", "engram", "broca", "glia"] as const;

function applyBrocaOutput(
  current: Record<string, string>,
  output: string
): Record<string, string> {
  try {
    const normalized = output
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    const parsed = JSON.parse(normalized) as {
      sections?: Record<string, string>;
      draftNotes?: string[];
    };
    const sections = parsed.sections;
    if (!sections) return { ...current, generatedDraft: output };

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
  } catch {
    return { ...current, generatedDraft: output };
  }
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
      if (
        agent === "engram" &&
        getRuntimeCapabilities().redis === "configured"
      ) {
        const patient = await findPatient(next.patientId);
        const draft = await getReportDraft(next.draftId);
        if (patient && draft) {
          const evidence = await searchPatientHistory(
            `${patient.demographics.referralReason}\n${patient.visitTranscript}`,
            5
          );
          await saveDraft({
            ...draft,
            agentNotes: {
              ...draft.agentNotes,
              engramEvidence: JSON.stringify(evidence),
            },
          });
          span.setAttribute("engram.result_count", evidence.length);
        }
      }
      if (complete) await completeDraft(next);
      return next;
    }
  );
}

async function completeDraft(run: PipelineRun) {
  const draft = await getReportDraft(run.draftId);
  const patient = await findPatient(run.patientId);
  if (!draft || !patient) return;

  let sections = draft.sections;
  if (getRuntimeCapabilities().anthropic === "configured") {
    try {
      const input = buildBrocaUserMessage({
          clinicalContext: patient.visitTranscript,
          normativeInterpretation: patient.testBattery
            .map((score) => `${score.test} ${score.subtest ?? ""}: ${score.classification}`)
            .join("\n"),
          patientName: patient.demographics.name,
          referralReason: patient.demographics.referralReason,
      });
      const output = await withAgentSpan(
        "cortex.agent.broca.generate",
        {
          agent: "broca",
          sessionId: run.id,
          patientId: run.patientId,
        },
        async () => {
          const generated = await completeWithClaude({
            system: BROCA_SYSTEM_PROMPT,
            messages: [{ role: "user", content: input }],
          });
          recordGeneration(input, generated);
          return generated;
        }
      );
      sections = applyBrocaOutput(sections, output);
    } catch (error) {
      console.warn("[cortex-pipeline] Claude generation failed; retaining deterministic draft", error);
    }
  }

  await withAgentSpan(
    "cortex.agent.glia.review",
    {
      agent: "glia",
      sessionId: run.id,
      patientId: run.patientId,
    },
    async (span) => {
      let unresolvedFlags = 0;
      try {
        const flags = JSON.parse(draft.agentNotes.flags ?? "[]") as unknown;
        unresolvedFlags = Array.isArray(flags) ? flags.length : 0;
      } catch {
        unresolvedFlags = 0;
      }
      span.setAttribute("glia.unresolved_flags", unresolvedFlags);
      const completed: ReportDraft = { ...draft, sections, status: "review" };
      await saveDraft(completed);
    }
  );
}
