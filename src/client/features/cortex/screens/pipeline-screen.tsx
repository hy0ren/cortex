"use client";

import type { PipelineRun } from "@/data/contracts";
import { ArrowRight } from "../components/icons";
import { AgentCard, PipelineConnector as Connector, type AgentVariant } from "../components/pipeline-stage";
import { Button } from "@/client/components/ui/button";

type PipelineScreenProps = {
  run: PipelineRun | null;
  busy: boolean;
  onTogglePause: () => Promise<void>;
  onGoReport: () => void;
  onStart: () => Promise<void>;
};

export function PipelineScreen({ run, busy, onTogglePause, onGoReport, onStart }: PipelineScreenProps) {
  const progress = run?.progress ?? 0;
  const completeCount = Math.floor(progress / 20);
  const paused = run?.phase === "paused";
  const complete = run?.phase === "complete";
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
        <AgentCard
          step="01"
          name="Wernicke"
          role="Comprehension"
          status={status(0)}
          variant={stage(0)}
          summary="Parsed 42:18 of dictation and 11 score sheets. Extracted chief complaint, 8‑month memory decline, preserved ADLs."
          footer="1,840 tokens · 6s"
        />
        <Connector />
        <AgentCard
          step="02"
          name="Norm"
          role="Normative interpretation"
          status={status(1)}
          variant={stage(1)}
          summary="Indexed 11 measures against age‑corrected norms. 4 fall ≥1 SD below expectation, concentrated in delayed memory."
          footer="11 measures · 13s"
        />
        <Connector />
        <AgentCard
          step="03"
          name="Engram"
          role="Evidence retrieval"
          status={status(2)}
          variant={stage(2)}
          summary="Retrieved 6 references — amnestic MCI criteria, WMS‑IV bands, AAN guideline — and aligned them to the score pattern."
          footer="6 sources · 15s"
        />
        <Connector animated />
        <AgentCard
          step="04"
          name="Broca"
          role="Drafting"
          status={status(3)}
          variant={stage(3)}
          summary={
            <>
              Composing the report. 4 of 6 sections complete; writing{" "}
              <b style={{ color: "var(--cortex-blue)", fontWeight: 600 }}>Interpretation</b> now.
            </>
          }
          footer="4 / 6 sections · 7s"
        />
        <Connector done={false} />
        <AgentCard
          step="05"
          name="Glia"
          role="Quality assurance"
          status={status(4)}
          variant={stage(4)}
          summary="Waiting for the draft. Will verify consistency, completeness, and normative alignment, then surface anything uncertain."
          footer="queued"
        />
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
              {complete ? "Pipeline complete" : `${run?.currentAgent ?? "Band"} is working`}
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
            Overall intellectual functioning falls within the Average range and is consistent with estimated premorbid ability. Against
            this backdrop, performance is selectively reduced in episodic memory: delayed verbal recall fell in the Borderline range,
            with limited benefit from recognition cueing — a pattern that points toward an encoding‑type amnestic process
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
          </div>
          <div style={{ padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--cortex-border-soft)", background: "var(--cortex-surface-muted)" }}>
            <div
              className="font-mono"
              style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-mono-wide)", color: "var(--cortex-fg-ghost)", marginBottom: "var(--space-2)" }}
            >
              GROUNDED ON — VIA ENGRAM
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {["Petersen — amnestic MCI criteria (2018)", "AAN dementia practice guideline", "WMS‑IV interpretive bands", "DSM‑5‑TR Mild NCD"].map(
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
            {[
              { time: "00:00", text: "Session received — 42:18 audio, 11 score sheets", color: "var(--cortex-fg-muted)" },
              {
                time: "00:06",
                text: (
                  <>
                    <b style={{ color: "var(--cortex-teal-dark)", fontWeight: 600 }}>Wernicke ✓</b> comprehension complete
                  </>
                ),
                color: "var(--cortex-fg-muted)",
              },
              {
                time: "00:19",
                text: (
                  <>
                    <b style={{ color: "var(--cortex-teal-dark)", fontWeight: 600 }}>Norm ✓</b> 11 measures normed
                  </>
                ),
                color: "var(--cortex-fg-muted)",
              },
              {
                time: "00:34",
                text: (
                  <>
                    <b style={{ color: "var(--cortex-teal-dark)", fontWeight: 600 }}>Engram ✓</b> 6 references retrieved
                  </>
                ),
                color: "var(--cortex-fg-muted)",
              },
              {
                time: "00:41",
                text: (
                  <>
                    <b style={{ color: "var(--cortex-blue)", fontWeight: 600 }}>Broca ▶</b> drafting (4 / 6 sections)
                  </>
                ),
                color: "var(--cortex-ink-3)",
              },
              { time: "—", text: "Glia queued — QA pending", color: "var(--cortex-fg-disabled)", last: true },
            ].map((row) => (
              <div
                key={row.time}
                className="flex gap-[11px]"
                style={{
                  padding: "var(--space-2) 0",
                  borderBottom: row.last ? "none" : "1px solid var(--cortex-border-soft)",
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: "var(--text-xs)",
                    color: row.time === "00:41" ? "var(--cortex-blue)" : row.time === "—" ? "var(--cortex-fg-disabled)" : "var(--cortex-fg-disabled)",
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
