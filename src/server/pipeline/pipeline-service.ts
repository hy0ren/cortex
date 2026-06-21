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

const AGENT_SEQUENCE = ["wernicke", "norm", "engram", "broca", "glia"] as const;

function log(agent: AgentStatus["agent"], phase: AgentStatus["phase"], message: string): AgentStatus {
  return { agent, phase, message, timestamp: new Date().toISOString() };
}

export async function createPipelineRun(input: {
  patientId: string;
  draftId: string;
}): Promise<PipelineRun> {
  const now = new Date().toISOString();
  const run: PipelineRun = {
    id: randomUUID(),
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
      log(agent === "engram" ? "band" : agent, "done", `${agent} completed`),
    ],
  };
  getMemoryStore().pipelines.set(id, next);

  if (complete) await completeDraft(next);
  return next;
}

async function completeDraft(run: PipelineRun) {
  const draft = await getReportDraft(run.draftId);
  const patient = await findPatient(run.patientId);
  if (!draft || !patient) return;

  let sections = draft.sections;
  if (getRuntimeCapabilities().anthropic === "configured") {
    try {
      const output = await completeWithClaude({
        system: BROCA_SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildBrocaUserMessage({
          clinicalContext: patient.visitTranscript,
          normativeInterpretation: patient.testBattery
            .map((score) => `${score.test} ${score.subtest ?? ""}: ${score.classification}`)
            .join("\n"),
          patientName: patient.demographics.name,
          referralReason: patient.demographics.referralReason,
        }) }],
      });
      sections = { ...sections, generatedDraft: output };
    } catch (error) {
      console.warn("[cortex-pipeline] Claude generation failed; retaining deterministic draft", error);
    }
  }

  const completed: ReportDraft = { ...draft, sections, status: "review" };
  await saveDraft(completed);
}
