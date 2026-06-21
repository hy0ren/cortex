import type { AgentId, AgentStatus, GliaFlag, ReportDraft, PipelineRun } from "@/data/contracts";

const AGENT_ORDER: AgentId[] = ["wernicke", "norm", "engram", "broca", "glia"];

export function latestAgentLog(
  run: PipelineRun | null,
  agent: AgentId
): AgentStatus | null {
  if (!run) return null;
  return [...run.agentLog].reverse().find((entry) => entry.agent === agent) ?? null;
}

export function agentCardSummary(run: PipelineRun | null, agent: AgentId, fallback: string): string {
  const entry = latestAgentLog(run, agent);
  if (entry?.detail) return entry.detail;
  if (entry?.phase === "thinking") return `${agent} is working…`;
  if (entry?.phase === "done") return entry.message;
  return fallback;
}

export function agentCardFooter(run: PipelineRun | null, agent: AgentId, fallback: string): string {
  const entry = latestAgentLog(run, agent);
  if (!entry?.metrics) return fallback;
  const parts = Object.entries(entry.metrics).map(([key, value]) => `${key}: ${value}`);
  return parts.join(" · ") || fallback;
}

export function formatRelativeTime(timestamp: string, startedAt: string): string {
  const deltaMs = new Date(timestamp).getTime() - new Date(startedAt).getTime();
  const totalSeconds = Math.max(0, Math.floor(deltaMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function activityTimeline(run: PipelineRun | null): Array<{
  time: string;
  text: string;
  color: string;
}> {
  if (!run) {
    return [{ time: "00:00", text: "Waiting to start pipeline", color: "var(--cortex-fg-muted)" }];
  }

  return run.agentLog.map((entry) => ({
    time: formatRelativeTime(entry.timestamp, run.startedAt),
    text: entry.detail ? `${entry.message} — ${entry.detail}` : entry.message,
    color:
      entry.phase === "error"
        ? "var(--cortex-verify)"
        : entry.phase === "done"
          ? "var(--cortex-teal-dark)"
          : "var(--cortex-fg-muted)",
  }));
}

export function liveDraftPreview(draft: ReportDraft | null, running: boolean): string {
  if (!draft) {
    return running
      ? "Draft sections will appear here as Broca completes."
      : "Start the pipeline to generate a live draft preview.";
  }

  const section =
    draft.sections.interpretation ||
    draft.sections.summary ||
    draft.sections.history ||
    draft.sections.reasonForReferral ||
    Object.values(draft.sections).find(Boolean) ||
    "";

  return section || (running ? "Broca is composing the report…" : "No draft content yet.");
}

export function groundedTags(draft: ReportDraft | null): string[] {
  if (!draft) return [];
  const tags: string[] = [];

  try {
    const normEvidence = JSON.parse(draft.agentNotes.normEvidence ?? "[]") as Array<{
      source?: string;
    }>;
    for (const item of normEvidence.slice(0, 4)) {
      if (item.source) tags.push(item.source);
    }
  } catch {
    /* ignore */
  }

  try {
    const engramEvidence = JSON.parse(draft.agentNotes.engramEvidence ?? "[]") as Array<{
      snippet?: string;
    }>;
    for (const item of engramEvidence.slice(0, 2)) {
      if (item.snippet) tags.push(item.snippet.slice(0, 72));
    }
  } catch {
    /* ignore */
  }

  return [...new Set(tags)].slice(0, 6);
}

export function completedAgentCount(run: PipelineRun | null): number {
  if (!run) return 0;
  return AGENT_ORDER.filter((agent) => {
    const entry = latestAgentLog(run, agent);
    return entry?.phase === "done";
  }).length;
}

export function pipelineStatusLabel(run: PipelineRun | null, complete: boolean, paused: boolean): string {
  if (!run) return "Band";
  if (complete) return "Pipeline complete";
  if (paused) return `${run.currentAgent} paused`;
  return `${run.currentAgent} is working`;
}

export function flagCount(flags: GliaFlag[]): number {
  return flags.length;
}
