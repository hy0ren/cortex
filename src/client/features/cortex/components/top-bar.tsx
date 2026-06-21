"use client";

import type { AuthUser } from "@/data/contracts";
import { Button } from "@/client/components/ui/button";

type TopBarProps = {
  listening: boolean;
  voiceSupported: boolean;
  onToggleListen: () => void;
  onExport: () => void;
  onSignOut: () => Promise<void>;
  user: AuthUser;
};

export function TopBar({ listening, voiceSupported, onToggleListen, onExport, onSignOut, user }: TopBarProps) {
  return (
    <>
      <header
        style={{
          height: 58,
          flex: "none",
          background: "rgba(245,246,248,0.86)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--cortex-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 var(--space-6)",
          gap: "var(--space-4)",
        }}
      >
        <div className="flex items-center gap-2.5" style={{ minWidth: 0 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--cortex-teal-tint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--cortex-teal-dark)",
              flex: "none",
            }}
          >
            EH
          </div>
          <div style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--cortex-ink-2)" }}>Eleanor M. Hayes</div>
          <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)" }}>
            ·
          </span>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-subtle)" }}>Comprehensive Neuropsychological Evaluation</span>
          <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-disabled)", marginLeft: 2 }}>
            18 Jun 2026
          </span>
        </div>
        <div className="flex items-center gap-2.5" style={{ marginLeft: "auto" }}>
          <div
            role="button"
            tabIndex={voiceSupported ? 0 : -1}
            aria-disabled={!voiceSupported}
            onClick={voiceSupported ? onToggleListen : undefined}
            onKeyDown={(e) => voiceSupported && e.key === "Enter" && onToggleListen()}
            title={voiceSupported ? "Toggle voice commands" : "Voice commands aren't supported in this browser"}
            className="flex items-center gap-2"
            style={{
              height: 34,
              padding: "0 13px",
              borderRadius: "var(--radius-md)",
              cursor: voiceSupported ? "pointer" : "not-allowed",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              border: "1px solid var(--cortex-border-strong)",
              background: listening ? "var(--cortex-teal)" : "var(--cortex-surface)",
              color: listening ? "#04251f" : voiceSupported ? "var(--cortex-fg-subtle)" : "var(--cortex-fg-disabled)",
              opacity: voiceSupported ? 1 : 0.6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
            Hands‑free
          </div>
          <div
            className="flex items-center gap-1.5"
            style={{
              height: 34,
              padding: "0 var(--space-3)",
              borderRadius: "var(--radius-md)",
              background: "var(--cortex-surface)",
              border: "1px solid var(--cortex-border)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--cortex-teal-dark)",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cortex-teal)" }} />
            Synthetic data mode
          </div>
          <Button type="button" variant="cortex-secondary" size="icon" onClick={onExport} aria-label="Export report">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          </Button>
          <Button type="button" variant="cortex-secondary" size="sm" onClick={() => void onSignOut()} title={`Sign out ${user.email}`}>
            Sign out
          </Button>
        </div>
      </header>

      {listening && (
        <div
          style={{
            flex: "none",
            background: "#062e29",
            color: "#9fe3d7",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "9px var(--space-6)",
            fontSize: "var(--text-sm)",
          }}
        >
          <span style={{ display: "inline-flex", gap: 3 }}>
            {[0, 0.2, 0.4].map((delay) => (
              <span
                key={delay}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#43c9b4",
                  animation: "dots 1s infinite",
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </span>
          <span style={{ fontWeight: 600, color: "#cff3ec" }}>Listening…</span>
          <span style={{ color: "#6fbfb1" }}>
            try &ldquo;open test results&rdquo;, &ldquo;read summary to patient&rdquo;, or &ldquo;go to pipeline&rdquo;
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={onToggleListen}
            onKeyDown={(e) => e.key === "Enter" && onToggleListen()}
            style={{
              marginLeft: "auto",
              cursor: "pointer",
              fontWeight: 600,
              color: "#9fe3d7",
              border: "1px solid rgba(159,227,215,.3)",
              padding: "3px 10px",
              borderRadius: "var(--radius-xs)",
            }}
          >
            Stop
          </span>
        </div>
      )}
    </>
  );
}
