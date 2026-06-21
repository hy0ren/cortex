"use client";

import { ArrowRight } from "../components/icons";
import { AgentCard, PipelineConnector as Connector } from "../components/pipeline-stage";

type PipelineScreenProps = {
  onGoReport: () => void;
};

export function PipelineScreen({ onGoReport }: PipelineScreenProps) {
  return (
    <div className="sa" style={{ flex: 1, overflowY: "auto", padding: "28px 32px 40px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 6 }}>
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: ".1em",
              color: "#0B7E70",
              textTransform: "uppercase",
              marginBottom: 7,
            }}
          >
            ● Run in progress
          </div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.02em", color: "#101a27" }}>
            Report pipeline
          </h1>
          <p style={{ margin: "7px 0 0", fontSize: 13.5, color: "#647082", maxWidth: 560 }}>
            Five agents read the visit, interpret the data against norms, retrieve supporting evidence, draft the report, and check it — you can watch each hand off its work.
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right", marginRight: 4 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 500, color: "#1b2735", letterSpacing: "-.01em" }}>
              00:41
            </div>
            <div style={{ fontSize: 11, color: "#8A95A3" }}>elapsed · est. 00:18 left</div>
          </div>
          <button
            type="button"
            className="cortex-btn-hover"
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 9,
              border: "1px solid #DCE0E7",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#5A6675",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 5v14M16 5v14" />
            </svg>
            Pause
          </button>
          <button
            type="button"
            onClick={onGoReport}
            className="cortex-teal-btn"
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 9,
              border: "none",
              background: "#0E9C89",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 1px 2px rgba(11,126,112,.3)",
            }}
          >
            View draft
            <ArrowRight />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0 22px" }}>
        <div style={{ flex: 1, height: 6, borderRadius: 4, background: "#E5E8ED", overflow: "hidden", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "72%",
              background: "linear-gradient(90deg,#0E9C89,#2F5BD0)",
              borderRadius: 4,
            }}
          />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#647082" }}>3 of 5 complete · Broca drafting</span>
      </div>

      <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 26 }}>
        <AgentCard
          step="01"
          name="Wernicke"
          role="Comprehension"
          status="Done"
          summary="Parsed 42:18 of dictation and 11 score sheets. Extracted chief complaint, 8‑month memory decline, preserved ADLs."
          footer="1,840 tokens · 6s"
        />
        <Connector />
        <AgentCard
          step="02"
          name="Norm"
          role="Normative interpretation"
          status="Done"
          summary="Indexed 11 measures against age‑corrected norms. 4 fall ≥1 SD below expectation, concentrated in delayed memory."
          footer="11 measures · 13s"
        />
        <Connector />
        <AgentCard
          step="03"
          name="Engram"
          role="Evidence retrieval"
          status="Done"
          summary="Retrieved 6 references — amnestic MCI criteria, WMS‑IV bands, AAN guideline — and aligned them to the score pattern."
          footer="6 sources · 15s"
        />
        <Connector animated />
        <AgentCard
          step="04"
          name="Broca"
          role="Drafting"
          status="Running"
          variant="running"
          summary={
            <>
              Composing the report. 4 of 6 sections complete; writing{" "}
              <b style={{ color: "#2F5BD0", fontWeight: 600 }}>Interpretation</b> now.
            </>
          }
          footer="4 / 6 sections · 7s"
        />
        <Connector done={false} />
        <AgentCard
          step="05"
          name="Glia"
          role="Quality assurance"
          status="Queued"
          variant="queued"
          summary="Waiting for the draft. Will verify consistency, completeness, and normative alignment, then surface anything uncertain."
          footer="queued"
        />
      </div>

      <div style={{ display: "flex", gap: 18, alignItems: "stretch" }}>
        <div
          style={{
            flex: 1.5,
            background: "#fff",
            border: "1px solid #E5E8ED",
            borderRadius: 13,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 1px 2px rgba(16,26,39,.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "14px 18px", borderBottom: "1px solid #EEF0F3" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2F5BD0", animation: "pulse-dot 1.3s infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1b2735" }}>Broca is writing</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#93A0B0" }}>· Interpretation</span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: ".08em",
                color: "#2F5BD0",
                background: "#E9EEFB",
                padding: "3px 8px",
                borderRadius: 5,
              }}
            >
              LIVE
            </span>
          </div>
          <div
            style={{
              padding: "18px 22px",
              fontFamily: "var(--font-serif)",
              fontSize: 14.5,
              lineHeight: 1.72,
              color: "#2b3542",
              flex: 1,
            }}
          >
            Overall intellectual functioning falls within the Average range and is consistent with estimated premorbid ability. Against this backdrop, performance is selectively reduced in episodic memory: delayed verbal recall fell in the Borderline range, with limited benefit from recognition cueing — a pattern that points toward an encoding‑type amnestic process
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 16,
                background: "#2F5BD0",
                marginLeft: 2,
                verticalAlign: -3,
                animation: "blink 1s step-end infinite",
              }}
            />
          </div>
          <div style={{ padding: "13px 18px", borderTop: "1px solid #EEF0F3", background: "#FBFCFD" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".07em", color: "#93A0B0", marginBottom: 8 }}>
              GROUNDED ON — VIA ENGRAM
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {["Petersen — amnestic MCI criteria (2018)", "AAN dementia practice guideline", "WMS‑IV interpretive bands", "DSM‑5‑TR Mild NCD"].map(
                (tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      color: "#3a4654",
                      background: "#fff",
                      border: "1px solid #E0E4EA",
                      padding: "4px 9px",
                      borderRadius: 6,
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
            background: "#fff",
            border: "1px solid #E5E8ED",
            borderRadius: 13,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(16,26,39,.03)",
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #EEF0F3", fontSize: 13, fontWeight: 600, color: "#1b2735" }}>
            Run activity
          </div>
          <div style={{ padding: "6px 18px 16px" }}>
            {[
              { time: "00:00", text: "Session received — 42:18 audio, 11 score sheets", color: "#56616F" },
              { time: "00:06", text: <><b style={{ color: "#0B7E70", fontWeight: 600 }}>Wernicke ✓</b> comprehension complete</>, color: "#56616F" },
              { time: "00:19", text: <><b style={{ color: "#0B7E70", fontWeight: 600 }}>Norm ✓</b> 11 measures normed</>, color: "#56616F" },
              { time: "00:34", text: <><b style={{ color: "#0B7E70", fontWeight: 600 }}>Engram ✓</b> 6 references retrieved</>, color: "#56616F" },
              { time: "00:41", text: <><b style={{ color: "#2F5BD0", fontWeight: 600 }}>Broca ▶</b> drafting (4 / 6 sections)</>, color: "#2b3542" },
              { time: "—", text: "Glia queued — QA pending", color: "#A6B0BD", last: true },
            ].map((row) => (
              <div
                key={row.time}
                style={{
                  display: "flex",
                  gap: 11,
                  padding: "10px 0",
                  borderBottom: row.last ? "none" : "1px solid #F2F4F6",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: row.time === "00:41" ? "#2F5BD0" : row.time === "—" ? "#C2C9D4" : "#A6B0BD",
                    width: 38,
                    flex: "none",
                  }}
                >
                  {row.time}
                </span>
                <span style={{ fontSize: 12.5, color: row.color }}>{row.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
