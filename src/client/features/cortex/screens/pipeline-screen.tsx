"use client";

import type { GliaFlag, PipelineRun, ReportDraft } from "@/data/contracts";
import { ArrowRight } from "../components/icons";
import { AgentCard, PipelineConnector as Connector, type AgentVariant } from "../components/pipeline-stage";
import { Button } from "@/client/components/ui/button";
import {
  activityTimeline,
  agentCardFooter,
  agentCardSummary,
  completedAgentCount,
  groundedTags,
  liveDraftPreview,
  pipelineStatusLabel,
} from "../model/pipeline-view";

type PipelineScreenProps = {
  run: PipelineRun | null;
  draft: ReportDraft | null;
  flags: GliaFlag[];
  busy: boolean;
  onTogglePause: () => Promise<void>;
  onGoReport: () => void;
  onStart: () => Promise<void>;
};

const AGENTS = [
  { step: "01", id: "wernicke" as const, name: "Wernicke", role: "Comprehension", fallbackSummary: "Waiting to ingest transcript and patient record.", fallbackFooter: "queued" },
  { step: "02", id: "norm" as const, name: "Norm", role: "Normative interpretation", fallbackSummary: "Waiting to interpret test battery against normative references.", fallbackFooter: "queued" },
  { step: "03", id: "engram" as const, name: "Engram", role: "Evidence retrieval", fallbackSummary: "Waiting to retrieve same-patient history chunks.", fallbackFooter: "queued" },
  { step: "04", id: "broca" as const, name: "Broca", role: "Drafting", fallbackSummary: "Waiting for upstream context before drafting sections.", fallbackFooter: "queued" },
  { step: "05", id: "glia" as const, name: "Glia", role: "Quality assurance", fallbackSummary: "Waiting to QA the draft for consistency and uncertainty.", fallbackFooter: "queued" },
];

export function PipelineScreen({ run, draft, flags, busy, onTogglePause, onGoReport, onStart }: PipelineScreenProps) {
  const progress = run?.progress ?? 0;
  const completeCount = completedAgentCount(run);
  const paused = run?.phase === "paused";
  const complete = run?.phase === "complete";
  const running = run?.phase === "running";
  const tags = groundedTags(draft);
  const timeline = activityTimeline(run);
  const stage = (index: number): AgentVariant => {
    if (completeCount > index || complete) return "done";
    if (completeCount === index && run && !paused) return "running";
    return "queued";
  };
  const status = (index: number) => {
    const value = stage(index);
    return value === "done" ? "Done" : value === "running" ? "Running" : "Queued";
  };

  return (
    <div className="sa" style={{ flex: 1, overflowY: "auto", padding: "32px 36px 44px" }}>
      <div className="flex items-end gap-[18px]" style={{ marginBottom: "var(--space-2)" }}>
        <div>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: "var(--text-xs)",
              letterSpacing: "var(--tracking-mono-wide)",
              color: "var(--cortex-teal-dark)",
              marginBottom: "var(--space-2)",
            }}
          >
            ● {run ? (complete ? "Run complete" : paused ? "Run paused" : "Run in progress") : "Ready to run"}
          </div>
          <h1 style={{ margin: 0, fontSize: "var(--text-3xl)", fontWeight: 700, letterSpacing: "-.02em", color: "var(--cortex-ink)" }}>
            Report pipeline
          </h1>
          <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-md)", color: "var(--cortex-fg-subtle)", maxWidth: 580 }}>
            Five agents read the visit, interpret the data against norms, retrieve supporting evidence, draft the report, and check it — you can watch each hand off its work.
          </p>
        </div>
        <div className="flex items-center gap-2.5" style={{ marginLeft: "auto" }}>
          <div style={{ textAlign: "right", marginRight: 4 }}>
            <div className="font-mono" style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--cortex-fg-subtle)", letterSpacing: "-.01em" }}>
              {run
                ? `${String(Math.floor((Date.now() - new Date(run.startedAt).getTime()) / 60000)).padStart(2, "0")}:${String(
                    Math.floor((Date.now() - new Date(run.startedAt).getTime()) / 1000) % 60
                  ).padStart(2, "0")}`
                : "00:00"}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)" }}>elapsed · est. 00:18 left</div>
          </div>
          <Button
            type="button"
            variant="cortex-secondary"
            size="lg"
            onClick={() => void (run ? onTogglePause() : onStart())}
            disabled={busy || complete}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 5v14M16 5v14" />
            </svg>
            {run ? (paused ? "Resume" : complete ? "Complete" : "Pause") : "Start"}
          </Button>
          <Button type="button" variant="cortex-primary" size="lg" onClick={onGoReport}>
            View draft
            <ArrowRight />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3.5" style={{ margin: "var(--space-5) 0 var(--space-6)" }}>
        <div
          style={{
            flex: 1,
            height: 8,
            borderRadius: "var(--radius-xs)",
            background: "var(--cortex-border)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              background: "linear-gradient(90deg,var(--cortex-teal),var(--cortex-blue))",
              borderRadius: "var(--radius-xs)",
            }}
          />
        </div>
        <span className="font-mono" style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-subtle)" }}>
          {completeCount} of 5 complete · {run?.currentAgent ?? "waiting"}
        </span>
      </div>

      <div className="flex items-stretch gap-0" style={{ marginBottom: "var(--space-7)" }}>
        {AGENTS.flatMap((agent, index) => [
          <AgentCard
            key={agent.id}
            step={agent.step}
            name={agent.name}
            role={agent.role}
            status={status(index)}
            variant={stage(index)}
            summary={agentCardSummary(run, agent.id, agent.fallbackSummary)}
            footer={agentCardFooter(run, agent.id, agent.fallbackFooter)}
          />,
          ...(index < AGENTS.length - 1
            ? [
                <Connector
                  key={`${agent.id}-connector`}
                  animated={index === 2 && stage(index) === "done"}
                  done={index === 4 ? false : stage(index) === "done"}
                />,
              ]
            : []),
        ])}
      </div>

      <div className="flex items-stretch gap-[18px]">
        <div
          style={{
            flex: 1.5,
            background: "var(--cortex-surface)",
            border: "1px solid var(--cortex-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <div className="flex items-center gap-[9px]" style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--cortex-border-soft)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cortex-blue)", animation: "pulse-dot 1.3s infinite" }} />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--cortex-ink-2)" }}>
              {pipelineStatusLabel(run, complete, paused)}
            </span>
            <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-ghost)" }}>
              · {paused ? "Paused" : complete ? "Review ready" : "Live orchestration"}
            </span>
            <span
              className="font-mono"
              style={{
                marginLeft: "auto",
                fontSize: "var(--text-xs)",
                letterSpacing: "var(--tracking-mono-tight)",
                color: "var(--cortex-blue)",
                background: "var(--cortex-blue-tint)",
                padding: "3px 8px",
                borderRadius: "var(--radius-xs)",
              }}
            >
              LIVE
            </span>
          </div>
          <div
            className="font-serif"
            style={{
              padding: "var(--space-5) var(--space-6)",
              fontSize: "var(--text-md)",
              lineHeight: 1.75,
              color: "var(--cortex-ink-3)",
              flex: 1,
            }}
          >
            {liveDraftPreview(draft, running && !complete)}
            {running && !complete ? (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 16,
                  background: "var(--cortex-blue)",
                  marginLeft: 2,
                  verticalAlign: -3,
                  animation: "blink 1s step-end infinite",
                }}
              />
            ) : null}
          </div>
          <div style={{ padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--cortex-border-soft)", background: "var(--cortex-surface-muted)" }}>
            <div
              className="font-mono"
              style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-mono-wide)", color: "var(--cortex-fg-ghost)", marginBottom: "var(--space-2)" }}
            >
              GROUNDED ON — NORM + ENGRAM
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {(tags.length > 0 ? tags : ["Normative and history retrieval will appear here"]).map(
                (tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--cortex-ink-4)",
                      background: "var(--cortex-surface)",
                      border: "1px solid var(--cortex-border)",
                      padding: "4px 9px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
            {complete && flags.length > 0 ? (
              <div style={{ marginTop: 10, fontSize: "var(--text-xs)", color: "var(--cortex-warn)" }}>
                Glia surfaced {flags.length} review {flags.length === 1 ? "flag" : "flags"}.
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: "var(--cortex-surface)",
            border: "1px solid var(--cortex-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--cortex-border-soft)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--cortex-ink-2)" }}>
            Run activity
          </div>
          <div style={{ padding: "var(--space-1) var(--space-5) var(--space-4)" }}>
            {timeline.map((row, index) => (
              <div
                key={`${row.time}-${index}`}
                className="flex gap-[11px]"
                style={{
                  padding: "var(--space-2) 0",
                  borderBottom: index === timeline.length - 1 ? "none" : "1px solid var(--cortex-border-soft)",
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--cortex-fg-disabled)",
                    width: 38,
                    flex: "none",
                  }}
                >
                  {row.time}
                </span>
                <span style={{ fontSize: "var(--text-sm)", color: row.color }}>{row.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
