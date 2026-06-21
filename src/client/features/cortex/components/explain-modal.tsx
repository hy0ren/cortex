"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/client/components/ui/button";

type ExplainModalProps = {
  open: boolean;
  onClose: () => void;
};

const PATIENT_EXPLANATION =
  "Most parts of your thinking are working well — your problem-solving, language, and reasoning are right where we'd expect for your age. The main thing we noticed is memory for new information. Remembering things after a short delay was harder than the rest, and that's the part we want to keep an eye on. This isn't a final diagnosis on its own. The next step is a follow-up with your neurologist, and we'll check again in about a year to see how things are going.";

export function ExplainModal({ open, onClose }: ExplainModalProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      setPlaying(false);
      setLoading(false);
    }
  }, [open]);

  async function togglePlayback() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    // If we already have audio loaded, just resume
    if (audioRef.current?.src && !audioRef.current.ended) {
      void audioRef.current.play();
      setPlaying(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: PATIENT_EXPLANATION }),
      });

      if (!res.ok) {
        // Fall back to browser TTS
        const utterance = new SpeechSynthesisUtterance(PATIENT_EXPLANATION);
        utterance.onend = () => setPlaying(false);
        window.speechSynthesis?.speak(utterance);
        setPlaying(true);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current.src = url;
      } else {
        const audio = new Audio(url);
        audio.onended = () => setPlaying(false);
        audio.onerror = () => setPlaying(false);
        audioRef.current = audio;
      }
      void audioRef.current.play();
      setPlaying(true);
    } finally {
      setLoading(false);
    }
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
              onClick={() => void togglePlayback()}
              aria-label={playing ? "Stop explanation" : "Read explanation aloud"}
              disabled={loading}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading ? "wait" : "pointer",
                flex: "none",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cortex-teal-dark)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                  </path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--cortex-teal-dark)">
                  {playing ? <path d="M7 6h4v12H7zM13 6h4v12h-4z" /> : <path d="M7 5l12 7-12 7z" />}
                </svg>
              )}
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
                    animation: playing ? "wave 1s infinite" : undefined,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
            <span className="font-mono" style={{ fontSize: "var(--text-sm)", opacity: 0.9 }}>
              {loading ? "···" : "0:48"}
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
