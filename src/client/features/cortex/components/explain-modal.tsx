"use client";

import { useEffect, useState } from "react";
import { Button } from "@/client/components/ui/button";

type ExplainModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ExplainModal({ open, onClose }: ExplainModalProps) {
  const [playing, setPlaying] = useState(false);
  const patientExplanation = "Most parts of your thinking are working well. The main thing we noticed is memory for new information. This is not a final diagnosis on its own. The next step is follow-up with your neurologist and another check in about a year.";

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function togglePlayback() {
    if (!("speechSynthesis" in window)) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(patientExplanation);
    utterance.onend = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(11,18,32,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 560,
          maxWidth: "100%",
          background: "var(--cortex-surface)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "linear-gradient(140deg,var(--cortex-teal),var(--cortex-teal-dark))",
            padding: "var(--space-6) var(--space-6)",
            color: "#fff",
            position: "relative",
          }}
        >
          <div
            className="font-mono"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-mono-wide)", opacity: 0.85, marginBottom: "var(--space-2)" }}
          >
            PLAIN‑LANGUAGE · READ ALOUD
          </div>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, letterSpacing: "-.01em" }}>
            For Eleanor — what today&apos;s results mean
          </div>
          <div className="flex items-center gap-3.5" style={{ marginTop: "var(--space-5)" }}>
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={playing ? "Stop explanation" : "Read explanation aloud"}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flex: "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--cortex-teal-dark)">
                {playing ? <path d="M7 6h4v12H7zM13 6h4v12h-4z" /> : <path d="M7 5l12 7-12 7z" />}
              </svg>
            </button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, height: 30 }}>
              {[40, 75, 55, 90, 50, 70, 35, 60].map((h, i) => (
                <span
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: i === 3 ? "#fff" : "rgba(255,255,255,.6)",
                    borderRadius: 2,
                    animation: "wave 1s infinite",
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
            <span className="font-mono" style={{ fontSize: "var(--text-sm)", opacity: 0.9 }}>
              0:48
            </span>
          </div>
        </div>
        <div style={{ padding: "var(--space-6) var(--space-6)" }}>
          <p className="font-serif" style={{ fontSize: "var(--text-md)", lineHeight: 1.7, color: "var(--cortex-ink-3)", margin: "0 0 var(--space-4)" }}>
            Most parts of your thinking are working well — your problem‑solving, language, and reasoning are right where we&apos;d expect for your age.
          </p>
          <p className="font-serif" style={{ fontSize: "var(--text-md)", lineHeight: 1.7, color: "var(--cortex-ink-3)", margin: "0 0 var(--space-4)" }}>
            The main thing we noticed is <b>memory for new information</b>. Remembering things after a short delay was harder than the rest, and
            that&apos;s the part we want to keep an eye on.
          </p>
          <p className="font-serif" style={{ fontSize: "var(--text-md)", lineHeight: 1.7, color: "var(--cortex-ink-3)", margin: 0 }}>
            This isn&apos;t a final diagnosis on its own. The next step is a follow‑up with your neurologist, and we&apos;ll check again in about a
            year to see how things are going.
          </p>
          <div
            className="flex items-center gap-2"
            style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--cortex-border-soft)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cortex-fg-ghost)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", flex: 1 }}>
              Generated from the final report · simplified to ~6th‑grade reading level for patient understanding.
            </span>
            <Button type="button" variant="cortex-primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
