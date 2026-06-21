"use client";

import { useState } from "react";
import { Button } from "@/client/components/ui/button";

type HistoryScreenProps = {
  onGoReport: () => void;
};

type EncounterAction = "openDraft" | "compare" | "openReport" | "openNote";

type Encounter = {
  id: string;
  date: string;
  badge: string;
  badgeStyle: { color: string; bg: string; border: string };
  title: string;
  summary: string;
  moca?: number;
  active?: boolean;
  extra?: string;
  actions: EncounterAction[];
};

const ENCOUNTERS: Encounter[] = [
  {
    id: "enc-2026-06-18",
    date: "18 Jun 2026",
    badge: "Draft",
    badgeStyle: { color: "var(--cortex-warn)", bg: "var(--cortex-warn-bg)", border: "var(--cortex-warn-border)" },
    title: "Comprehensive Neuropsychological Evaluation",
    summary: "Full battery. Amnestic profile — delayed recall Borderline; other domains preserved. Impression: amnestic MCI.",
    active: true,
    extra: "Today",
    actions: ["openDraft", "compare"],
  },
  {
    id: "enc-2025-12-02",
    date: "02 Dec 2025",
    badge: "Final",
    badgeStyle: { color: "var(--cortex-teal-dark)", bg: "var(--cortex-teal-tint)", border: "transparent" },
    title: "Cognitive screening — follow‑up",
    summary: "MoCA 24/30. Mild decline from baseline, predominantly delayed recall. Recommended full evaluation.",
    moca: 24,
    actions: ["openReport", "compare"],
  },
  {
    id: "enc-2025-06-15",
    date: "15 Jun 2025",
    badge: "Final",
    badgeStyle: { color: "var(--cortex-teal-dark)", bg: "var(--cortex-teal-tint)", border: "transparent" },
    title: "Initial consultation",
    summary: "Memory complaint raised by family. MoCA 27/30. Baseline labs and thyroid panel ordered.",
    moca: 27,
    actions: ["openNote", "compare"],
  },
  {
    id: "enc-2024-09-10",
    date: "10 Sep 2024",
    badge: "Intake",
    badgeStyle: { color: "var(--cortex-fg-subtle)", bg: "var(--cortex-chip-bg)", border: "transparent" },
    title: "Referral intake",
    summary: "Established care. PMH hypertension, hypothyroidism. Family history of late‑onset dementia recorded.",
    actions: [],
  },
];

const MOCA_ENCOUNTERS = ENCOUNTERS.filter((enc) => typeof enc.moca === "number");

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(11,18,32,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          maxWidth: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "var(--cortex-surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 24px 60px rgba(0,0,0,.3)",
          padding: "var(--space-6)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function HistoryScreen({ onGoReport }: HistoryScreenProps) {
  const [openEncounterId, setOpenEncounterId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const openEncounter = ENCOUNTERS.find((enc) => enc.id === openEncounterId) ?? null;

  return (
    <div className="sa" style={{ flex: 1, overflowY: "auto", padding: "32px 36px 44px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div className="flex items-end gap-4" style={{ marginBottom: "var(--space-6)" }}>
          <div>
            <div
              className="font-mono uppercase"
              style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-mono-wide)", color: "var(--cortex-fg-ghost)", marginBottom: "var(--space-2)" }}
            >
              Patient record
            </div>
            <h1 style={{ margin: 0, fontSize: "var(--text-3xl)", fontWeight: 700, letterSpacing: "-.02em", color: "var(--cortex-ink)" }}>
              Eleanor M. Hayes
            </h1>
            <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-md)", color: "var(--cortex-fg-subtle)" }}>
              69F · MRN SYN‑4471 · 4 encounters on file · referred by Neurology
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            style={{
              marginLeft: "auto",
              background: "var(--cortex-surface)",
              border: "1px solid var(--cortex-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3) var(--space-4)",
              boxShadow: "var(--shadow-1)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", marginBottom: "var(--space-2)" }}>MoCA trend · tap to compare</div>
            <div className="flex items-end gap-1.5" style={{ height: 38 }}>
              {MOCA_ENCOUNTERS.map((enc, i) => (
                <div
                  key={enc.id}
                  style={{
                    width: 14,
                    height: `${(enc.moca! / 30) * 100}%`,
                    background: ["var(--cortex-teal)", "#5bbbab", "#d9a441", "#c0524a"][i],
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
            <div className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-disabled)", marginTop: 6 }}>
              {MOCA_ENCOUNTERS.map((enc) => enc.moca).join(" → ")}
            </div>
          </button>
        </div>

        <div style={{ position: "relative", paddingLeft: 30 }}>
          <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: 2, background: "var(--cortex-border-strong)" }} />

          {ENCOUNTERS.map((enc, i) => (
            <div key={enc.id} style={{ position: "relative", marginBottom: i < ENCOUNTERS.length - 1 ? "var(--space-4)" : 0 }}>
              <div
                style={{
                  position: "absolute",
                  left: -29,
                  top: 18,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "var(--cortex-surface)",
                  border: `3px solid ${enc.active ? "var(--cortex-blue)" : "#c2c9d4"}`,
                }}
              />
              <div
                style={{
                  background: "var(--cortex-surface)",
                  border: enc.active ? "1px solid var(--cortex-blue-border-soft)" : "1px solid var(--cortex-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4) var(--space-5)",
                  boxShadow: enc.active ? "0 2px 10px rgba(47,91,208,.07)" : undefined,
                }}
              >
                <div className="flex items-center gap-2.5" style={{ marginBottom: "var(--space-2)" }}>
                  <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: enc.active ? "var(--cortex-blue)" : "var(--cortex-fg-faint)" }}>
                    {enc.date}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      color: enc.badgeStyle.color,
                      background: enc.badgeStyle.bg,
                      border: enc.badgeStyle.border !== "transparent" ? `1px solid ${enc.badgeStyle.border}` : undefined,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-xl)",
                    }}
                  >
                    {enc.badge}
                  </span>
                  {enc.extra && <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)" }}>{enc.extra}</span>}
                </div>
                <div style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--cortex-ink)", marginBottom: 4 }}>{enc.title}</div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-muted)", lineHeight: 1.5 }}>{enc.summary}</div>
                {enc.actions.length > 0 && (
                  <div className="flex gap-2.5" style={{ marginTop: "var(--space-3)" }}>
                    {enc.actions.includes("openDraft") && (
                      <Button type="button" variant="default" size="sm" onClick={onGoReport} style={{ background: "var(--cortex-blue)" }}>
                        Open draft
                      </Button>
                    )}
                    {enc.actions.includes("compare") && (
                      <Button type="button" variant="cortex-secondary" size="sm" onClick={() => setCompareOpen(true)}>
                        Compare
                      </Button>
                    )}
                    {(enc.actions.includes("openReport") || enc.actions.includes("openNote")) && (
                      <Button type="button" variant="cortex-secondary" size="sm" onClick={() => setOpenEncounterId(enc.id)}>
                        {enc.actions.includes("openReport") ? "Open report" : "Open note"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {openEncounter && (
        <Modal onClose={() => setOpenEncounterId(null)}>
          <div className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", marginBottom: "var(--space-2)" }}>
            {openEncounter.date}
          </div>
          <h2 style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--cortex-ink)" }}>
            {openEncounter.title}
          </h2>
          <p style={{ margin: 0, fontSize: "var(--text-md)", lineHeight: 1.6, color: "var(--cortex-ink-4)" }}>{openEncounter.summary}</p>
          {typeof openEncounter.moca === "number" && (
            <div style={{ marginTop: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--cortex-fg-subtle)" }}>
              MoCA: <span style={{ fontWeight: 600, color: "var(--cortex-ink-2)" }}>{openEncounter.moca} / 30</span>
            </div>
          )}
          <Button type="button" variant="cortex-secondary" size="sm" onClick={() => setOpenEncounterId(null)} style={{ marginTop: "var(--space-5)" }}>
            Close
          </Button>
        </Modal>
      )}

      {compareOpen && (
        <Modal onClose={() => setCompareOpen(false)}>
          <h2 style={{ margin: "0 0 var(--space-4)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--cortex-ink)" }}>
            MoCA score comparison
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--cortex-border-strong)" }}>
                <th style={{ textAlign: "left", padding: "8px 0", color: "var(--cortex-fg-faint)", fontWeight: 500 }}>Encounter</th>
                <th style={{ textAlign: "right", padding: "8px 0", color: "var(--cortex-fg-faint)", fontWeight: 500 }}>MoCA</th>
              </tr>
            </thead>
            <tbody>
              {ENCOUNTERS.map((enc) => (
                <tr key={enc.id} style={{ borderBottom: "1px solid var(--cortex-border-soft)" }}>
                  <td style={{ padding: "9px 0", color: "var(--cortex-ink-2)" }}>
                    {enc.date} — {enc.title}
                  </td>
                  <td className="font-mono" style={{ textAlign: "right", padding: "9px 0", color: typeof enc.moca === "number" ? "var(--cortex-ink-2)" : "var(--cortex-fg-disabled)" }}>
                    {typeof enc.moca === "number" ? `${enc.moca} / 30` : "not administered"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", lineHeight: 1.5 }}>
            MoCA was not part of every encounter&apos;s battery — comparison is limited to visits where it was administered.
          </p>
          <Button type="button" variant="cortex-secondary" size="sm" onClick={() => setCompareOpen(false)} style={{ marginTop: "var(--space-4)" }}>
            Close
          </Button>
        </Modal>
      )}
    </div>
  );
}
