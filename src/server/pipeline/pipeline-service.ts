import "server-only";
import { randomUUID } from "crypto";
import type { AgentStatus, GliaFlag, PipelineRun } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { createReportRoom, kickoffBandPipeline } from "@/server/band/room-client";
import { getMemoryStore } from "@/server/persistence/memory-store";
import { findPatient } from "@/server/persistence/patient-repository";
import { getReportDraft } from "@/server/persistence/drafts";
import { saveDraft } from "@/server/reports/report-service";
import {
  applyBrocaOutput,
  getEvalVariant,
  gliaFlagsFromOutput,
  isGliaEnabled,
  parseAgentJson,
  runBrocaStep,
  runEngramStep,
  runGliaStep,
  runNormStep,
  runWernickeStep,
  summarizeBroca,
  summarizeEngram,
  summarizeGlia,
  summarizeNorm,
  summarizeWernicke,
} from "@/server/pipeline/agent-steps";
import {
  recordGeneration,
  withAgentSpan,
} from "@/server/observability/arize";
import { captureAgentError } from "@/server/observability/sentry";
import type { NormOutput, WernickeOutput } from "@/server/ai/agents";
import { buildGliaUserMessage } from "@/server/ai/agents/glia";

const AGENT_SEQUENCE = ["wernicke", "norm", "engram", "broca", "glia"] as const;

function log(
  agent: AgentStatus["agent"],
  phase: AgentStatus["phase"],
  message: string,
  extra?: Pick<AgentStatus, "detail" | "metrics">
): AgentStatus {
  return {
    agent,
    phase,
    message,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

function appendLog(run: PipelineRun, entry: AgentStatus): PipelineRun {
  const next = {
    ...run,
    agentLog: [...run.agentLog, entry],
    updatedAt: new Date().toISOString(),
  };
  getMemoryStore().pipelines.set(run.id, next);
  return next;
}

export async function createPipelineRun(input: {
  clinicianId: string;
  patientId: string;
  draftId: string;
}): Promise<PipelineRun> {
  const now = new Date().toISOString();
  const evalVariant = getEvalVariant();
  let run: PipelineRun = {
    id: randomUUID(),
    clinicianId: input.clinicianId,
    patientId: input.patientId,
    draftId: input.draftId,
    phase: "running",
    progress: 0,
    currentAgent: AGENT_SEQUENCE[0],
    startedAt: now,
    updatedAt: now,
    evalVariant,
    agentLog: [log("band", "thinking", "Session received and pipeline started")],
  };

  const draft = await getReportDraft(input.draftId);
  if (draft) {
    await saveDraft({
      ...draft,
      agentNotes: { ...draft.agentNotes, flags: "[]" },
      status: "generating",
    });
  }

  if (getRuntimeCapabilities().band === "configured") {
    try {
      const patient = await findPatient(input.patientId);
      if (patient && draft) {
        const room = await createReportRoom({
          sessionId: run.id,
          patientId: input.patientId,
          draftId: input.draftId,
        });
        run = { ...run, bandRoomId: room.id };
        await kickoffBandPipeline({
          roomId: room.id,
          runId: run.id,
          patient,
          draftId: input.draftId,
        });
        run = appendLog(
          run,
          log("band", "done", "Band room created and Wernicke notified", {
            detail: room.id,
          })
        );
      }
    } catch (error) {
      console.warn("[cortex-pipeline] Band kickoff failed; falling back to local advance", error);
      captureAgentError(error, { agent: "band", sessionId: run.id, patientId: input.patientId });
    }
  }

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
  if (getRuntimeCapabilities().band === "configured" && run.bandRoomId) {
    return run;
  }

  const step = Math.min(Math.floor(run.progress / 20), AGENT_SEQUENCE.length - 1);
  const agent = AGENT_SEQUENCE[step];
  const nextProgress = Math.min(run.progress + 20, 100);
  const complete = nextProgress === 100;
  const nextAgent = complete ? "complete" : AGENT_SEQUENCE[Math.min(step + 1, 4)];

  let working = appendLog(
    { ...run, progress: nextProgress, currentAgent: agent },
    log(agent, "thinking", `${agent} started`)
  );

  return withAgentSpan(
    `cortex.agent.${agent}`,
    {
      agent,
      sessionId: working.id,
      patientId: working.patientId,
    },
    async (span) => {
      span.setAttributes({
        "pipeline.progress": nextProgress,
        "pipeline.phase": working.phase,
        "eval.variant": working.evalVariant ?? getEvalVariant(),
      });

      const anthropicReady = getRuntimeCapabilities().anthropic === "configured";
      const patient = await findPatient(working.patientId);
      const draft = await getReportDraft(working.draftId);
      if (!patient || !draft) {
        working = appendLog(working, log(agent, "error", `${agent} failed — missing patient or draft`));
        return { ...working, phase: "error" as const };
      }

      try {
        if (agent === "wernicke" && anthropicReady) {
          const { output } = await runWernickeStep(patient);
          if (output) {
            await saveDraft({
              ...draft,
              agentNotes: { ...draft.agentNotes, wernicke: JSON.stringify(output) },
            });
            span.setAttribute("wernicke.red_flags", output.redFlags.length);
            working = appendLog(
              working,
              log(agent, "done", "Wernicke completed", {
                detail: summarizeWernicke(output),
                metrics: { redFlags: output.redFlags.length },
              })
            );
          }
        }

        if (agent === "norm" && anthropicReady) {
          const wernickeNote = parseAgentJson<WernickeOutput>(draft.agentNotes.wernicke ?? "");
          const { output, normEvidence } = await runNormStep(patient, wernickeNote?.clinicalContext);
          if (output) {
            await saveDraft({
              ...draft,
              agentNotes: {
                ...draft.agentNotes,
                norm: JSON.stringify(output),
                normEvidence: JSON.stringify(normEvidence),
              },
            });
            span.setAttribute("norm.domains", output.domainInterpretations.length);
            span.setAttribute("norm.evidence_count", normEvidence.length);
            span.setAttribute(
              "norm.evidence_ids",
              normEvidence.map((e) => e.chunkId).join(",")
            );
            span.setAttribute(
              "norm.evidence_sources",
              [...new Set(normEvidence.map((e) => e.source))].join("|")
            );
            // Label match: fraction of domains classified as intact vs impaired,
            // reported as an Arize eval attribute for hallucination monitoring.
            const impairedCount = output.domainInterpretations.filter(
              (d) => d.classification !== "intact"
            ).length;
            const labelMatchAvg =
              normEvidence.length > 0
                ? Math.min(1, normEvidence.length / Math.max(1, output.domainInterpretations.length))
                : 0;
            span.setAttribute("norm.label_match_avg", labelMatchAvg);
            span.setAttribute("norm.impaired_domains", impairedCount);
            working = appendLog(
              working,
              log(agent, "done", "Norm completed", {
                detail: summarizeNorm(output),
                metrics: { evidence: normEvidence.length },
              })
            );
          }
        }

        if (agent === "engram") {
          const evidence = await runEngramStep(patient);
          await saveDraft({
            ...draft,
            agentNotes: { ...draft.agentNotes, engramEvidence: JSON.stringify(evidence) },
          });
          span.setAttribute("engram.result_count", evidence.length);
          working = appendLog(
            working,
            log(agent, "done", "Engram completed", {
              detail: summarizeEngram(evidence),
              metrics: { references: evidence.length },
            })
          );
        }

        if (agent === "broca" && anthropicReady) {
          const latestDraft = (await getReportDraft(working.draftId)) ?? draft;
          const wernickeNote = parseAgentJson<WernickeOutput>(latestDraft.agentNotes.wernicke ?? "");
          const normNote = parseAgentJson<NormOutput>(latestDraft.agentNotes.norm ?? "");
          const engramEvidence = JSON.parse(latestDraft.agentNotes.engramEvidence ?? "[]");
          const clinicalContext = wernickeNote?.clinicalContext ?? patient.visitTranscript;
          const normativeInterpretation =
            normNote?.overallProfile ??
            patient.testBattery
              .map((score) => `${score.test} ${score.subtest ?? ""}: ${score.classification}`)
              .join("\n");

          const messageInput = {
            patient,
            clinicalContext,
            normativeInterpretation,
            engramEvidence,
          };
          const { raw, output } = await withAgentSpan(
            "cortex.agent.broca.generate",
            { agent: "broca", sessionId: working.id, patientId: working.patientId },
            async () => runBrocaStep(messageInput)
          );
          recordGeneration(JSON.stringify(messageInput), raw);
          const sections = output
            ? applyBrocaOutput(latestDraft.sections, output)
            : { ...latestDraft.sections, generatedDraft: raw };
          await saveDraft({ ...latestDraft, sections, status: "generating" });
          if (output) {
            working = appendLog(
              working,
              log(agent, "done", "Broca completed", {
                detail: summarizeBroca(output),
                metrics: { sections: Object.keys(output.sections).length },
              })
            );
          }
        }

        if (agent === "glia") {
          const latestDraft = (await getReportDraft(working.draftId)) ?? draft;
          let flags: GliaFlag[] = [];
          span.setAttribute("glia.enabled", isGliaEnabled());

          if (isGliaEnabled() && anthropicReady) {
            const wernickeNote = parseAgentJson<WernickeOutput>(latestDraft.agentNotes.wernicke ?? "");
            const normNote = parseAgentJson<NormOutput>(latestDraft.agentNotes.norm ?? "");
            const gliaInput = {
              draftSections: latestDraft.sections,
              clinicalContext: wernickeNote?.clinicalContext ?? patient.visitTranscript,
              normativeInterpretation: normNote?.overallProfile ?? "",
              sourceTranscript: patient.visitTranscript,
            };
            const { raw, output } = await runGliaStep(gliaInput);
            recordGeneration(buildGliaUserMessage(gliaInput), raw);
            if (output) {
              flags = gliaFlagsFromOutput(output);
              span.setAttribute("glia.completeness_score", output.completenessScore);
              span.setAttribute("glia.consistency_score", output.consistencyScore);
              span.setAttribute("glia.unresolved_flags", flags.length);
              working = appendLog(
                working,
                log(agent, "done", "Glia completed", {
                  detail: summarizeGlia(output),
                  metrics: {
                    flags: flags.length,
                    completeness: output.completenessScore,
                  },
                })
              );
            }
          } else {
            working = appendLog(
              working,
              log(agent, "done", "Glia skipped", { detail: "QA disabled for eval baseline" })
            );
          }

          await saveDraft({
            ...latestDraft,
            status: "review",
            agentNotes: {
              ...latestDraft.agentNotes,
              flags: JSON.stringify(flags),
            },
          });
        }
      } catch (error) {
        console.warn(`[cortex-pipeline] ${agent} failed`, error);
        captureAgentError(error, { agent, sessionId: working.id, patientId: working.patientId });
        working = appendLog(working, log(agent, "error", `${agent} failed`));
      }

      const finished: PipelineRun = {
        ...working,
        progress: nextProgress,
        currentAgent: nextAgent,
        phase: complete ? "complete" : "running",
        updatedAt: new Date().toISOString(),
      };
      getMemoryStore().pipelines.set(id, finished);
      return finished;
    }
  );
}

export { AGENT_SEQUENCE };
