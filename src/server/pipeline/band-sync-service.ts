import "server-only";
import type { AgentId, AgentStatus, GliaFlag, PipelineRun } from "@/data/contracts";
import { postBandHandoff } from "@/server/band/room-client";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getReportDraft } from "@/server/persistence/drafts";
import { findPatient } from "@/server/persistence/patient-repository";
import { getEncounter } from "@/server/persistence/redis/encounter-store";
import { storePipelineRun } from "@/server/persistence/redis/pipeline-store";
import { saveDraft } from "@/server/reports/report-service";
import {
  applyBrocaOutput,
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
import type { NormOutput, WernickeOutput } from "@/server/ai/agents";
import { buildGliaUserMessage } from "@/server/ai/agents/glia";
import {
  getPipelineRun,
} from "@/server/pipeline/pipeline-service";
import {
  recordGeneration,
  withAgentSpan,
} from "@/server/observability/arize";
import { captureAgentError } from "@/server/observability/sentry";

const AGENT_PROGRESS: Record<AgentId, number> = {
  band: 0,
  wernicke: 20,
  norm: 40,
  engram: 60,
  broca: 80,
  glia: 100,
};

const NEXT_AGENT: Record<string, AgentId | "complete"> = {
  wernicke: "norm",
  norm: "engram",
  engram: "broca",
  broca: "glia",
  glia: "complete",
};

function log(
  agent: AgentStatus["agent"],
  phase: AgentStatus["phase"],
  message: string,
  extra?: Pick<AgentStatus, "detail" | "metrics">
): AgentStatus {
  return { agent, phase, message, timestamp: new Date().toISOString(), ...extra };
}

async function persistRun(run: PipelineRun): Promise<PipelineRun> {
  await storePipelineRun(run);
  return run;
}

export async function executePipelineAgent(
  runId: string,
  agent: AgentId
): Promise<PipelineRun> {
  const run = await getPipelineRun(runId);
  if (!run) throw new Error("Pipeline run not found");
  if (!["wernicke", "norm", "engram", "broca", "glia"].includes(agent)) {
    throw new Error(`Invalid agent: ${agent}`);
  }

  let working = await persistRun({
    ...run,
    currentAgent: agent,
    agentLog: [...run.agentLog, log(agent, "thinking", `${agent} started`)],
    updatedAt: new Date().toISOString(),
  });

  return withAgentSpan(
    `cortex.agent.${agent}`,
    { agent, sessionId: run.id, patientId: run.patientId },
    async (span) => {
      span.setAttributes({
        "eval.variant": run.evalVariant ?? "glia-on",
        "pipeline.mode": "band",
      });

      const anthropicReady = getRuntimeCapabilities().anthropic === "configured";
      const patient = await findPatient(run.patientId);
      const encounter = await getEncounter(run.encounterId);
      const draft = await getReportDraft(run.draftId);
      if (!patient || !encounter || !draft) throw new Error("Missing patient, encounter, or draft");

      try {
        if (agent === "wernicke" && anthropicReady) {
          const { output } = await runWernickeStep(patient, encounter);
          if (output) {
            await saveDraft({
              ...draft,
              agentNotes: { ...draft.agentNotes, wernicke: JSON.stringify(output) },
            });
            working = await persistRun({
              ...working,
              agentLog: [
                ...working.agentLog,
                log(agent, "done", "Wernicke completed", {
                  detail: summarizeWernicke(output),
                  metrics: { redFlags: output.redFlags.length },
                }),
              ],
            });
          }
        }

        if (agent === "norm" && anthropicReady) {
          const wernickeNote = parseAgentJson<WernickeOutput>(draft.agentNotes.wernicke ?? "");
          const { output, normEvidence } = await runNormStep(patient, encounter, wernickeNote?.clinicalContext);
          if (output) {
            await saveDraft({
              ...draft,
              agentNotes: {
                ...draft.agentNotes,
                norm: JSON.stringify(output),
                normEvidence: JSON.stringify(normEvidence),
              },
            });
            working = await persistRun({
              ...working,
              agentLog: [
                ...working.agentLog,
                log(agent, "done", "Norm completed", {
                  detail: summarizeNorm(output),
                  metrics: { evidence: normEvidence.length },
                }),
              ],
            });
          }
        }

        if (agent === "engram") {
          const evidence = await runEngramStep(patient, encounter);
          await saveDraft({
            ...draft,
            agentNotes: { ...draft.agentNotes, engramEvidence: JSON.stringify(evidence) },
          });
          working = await persistRun({
            ...working,
            agentLog: [
              ...working.agentLog,
              log(agent, "done", "Engram completed", {
                detail: summarizeEngram(evidence),
                metrics: { references: evidence.length },
              }),
            ],
          });
        }

        if (agent === "broca" && anthropicReady) {
          const latestDraft = (await getReportDraft(run.draftId)) ?? draft;
          const wernickeNote = parseAgentJson<WernickeOutput>(latestDraft.agentNotes.wernicke ?? "");
          const normNote = parseAgentJson<NormOutput>(latestDraft.agentNotes.norm ?? "");
          const engramEvidence = JSON.parse(latestDraft.agentNotes.engramEvidence ?? "[]");
          const gliaInput = {
            patient,
            clinicalContext: wernickeNote?.clinicalContext ?? encounter.transcript,
            normativeInterpretation:
              normNote?.overallProfile ??
              encounter.testBattery
                .map((score) => `${score.test} ${score.subtest ?? ""}: ${score.classification}`)
                .join("\n"),
            engramEvidence,
          };
          const { raw, output } = await runBrocaStep(gliaInput);
          recordGeneration(JSON.stringify(gliaInput), raw);
          const sections = output
            ? applyBrocaOutput(latestDraft.sections, output)
            : latestDraft.sections;
          await saveDraft({ ...latestDraft, sections, status: "generating" });
          if (output) {
            working = await persistRun({
              ...working,
              agentLog: [
                ...working.agentLog,
                log(agent, "done", "Broca completed", {
                  detail: summarizeBroca(output),
                  metrics: { sections: Object.keys(output.sections).length },
                }),
              ],
            });
          }
        }

        if (agent === "glia") {
          const latestDraft = (await getReportDraft(run.draftId)) ?? draft;
          let flags: GliaFlag[] = [];
          span.setAttribute("glia.enabled", isGliaEnabled());

          if (isGliaEnabled() && anthropicReady) {
            const wernickeNote = parseAgentJson<WernickeOutput>(latestDraft.agentNotes.wernicke ?? "");
            const normNote = parseAgentJson<NormOutput>(latestDraft.agentNotes.norm ?? "");
            const engramEvidence = JSON.parse(
              latestDraft.agentNotes.engramEvidence ?? "[]"
            ) as Array<{ snippet: string; source: string }>;
            const reviewInput = {
              draftSections: latestDraft.sections,
              clinicalContext: wernickeNote?.clinicalContext ?? encounter.transcript,
              normativeInterpretation: normNote?.overallProfile ?? "",
              sourceTranscript: encounter.transcript,
              retrievedEvidence: engramEvidence.map((item) => ({
                snippet: item.snippet,
                source: item.source,
              })),
            };
            const { raw, output } = await runGliaStep(reviewInput);
            recordGeneration(buildGliaUserMessage(reviewInput), raw);
            if (output) {
              flags = gliaFlagsFromOutput(output);
              span.setAttribute("glia.completeness_score", output.completenessScore);
              span.setAttribute("glia.consistency_score", output.consistencyScore);
              working = await persistRun({
                ...working,
                agentLog: [
                  ...working.agentLog,
                  log(agent, "done", "Glia completed", {
                    detail: summarizeGlia(output),
                    metrics: { flags: flags.length },
                  }),
                ],
              });
            }
          } else {
            working = await persistRun({
              ...working,
              agentLog: [
                ...working.agentLog,
                log(agent, "done", "Glia skipped", { detail: "QA disabled for eval baseline" }),
              ],
            });
          }

          await saveDraft({
            ...latestDraft,
            status: "review",
            agentNotes: { ...latestDraft.agentNotes, flags: JSON.stringify(flags) },
          });
        }
      } catch (error) {
        captureAgentError(error, { agent, sessionId: run.id, patientId: run.patientId });
        working = await persistRun({
          ...working,
          phase: "error",
          agentLog: [...working.agentLog, log(agent, "error", `${agent} failed`)],
        });
        throw error;
      }

      const next = NEXT_AGENT[agent] ?? "complete";
      const progress = AGENT_PROGRESS[agent] ?? working.progress;
      const lastLog = working.agentLog.at(-1);
      const finished = await persistRun({
        ...working,
        progress,
        currentAgent: next,
        phase: next === "complete" ? "complete" : "running",
        updatedAt: new Date().toISOString(),
      });

      if (finished.bandRoomId && getRuntimeCapabilities().band === "configured") {
        await postBandHandoff({
          roomId: finished.bandRoomId,
          fromAgent: agent,
          toAgent: next,
          summary: lastLog?.detail ?? `${agent} step complete`,
        }).catch((error) => {
          console.warn("[cortex-band] handoff post failed", error);
        });
      }

      return finished;
    }
  );
}

export function verifyBandSyncSecret(request: Request): boolean {
  const secret = process.env.BAND_SYNC_SECRET;
  if (!secret || secret.includes("your-")) return false;
  return request.headers.get("x-band-sync-secret") === secret;
}
