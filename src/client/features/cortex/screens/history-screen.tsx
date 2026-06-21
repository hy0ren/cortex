"use client";

type HistoryScreenProps = {
  onGoReport: () => void;
  onCompare: () => void;
  onOpenEncounter: () => void;
};

type EncounterAction = "openDraft" | "compare" | "openReport" | "openNote";

type Encounter = {
  date: string;
  badge: string;
  badgeStyle: { color: string; bg: string; border: string };
  title: string;
  summary: string;
  active?: boolean;
  extra?: string;
  actions: EncounterAction[];
};

const ENCOUNTERS: Encounter[] = [
  {
    date: "18 Jun 2026",
    badge: "Draft",
    badgeStyle: { color: "#8A6D2E", bg: "#F7F0DF", border: "#EAD9B5" },
    title: "Comprehensive Neuropsychological Evaluation",
    summary: "Full battery. Amnestic profile — delayed recall Borderline; other domains preserved. Impression: amnestic MCI.",
    active: true,
    extra: "Today",
    actions: ["openDraft", "compare"],
  },
  {
    date: "02 Dec 2025",
    badge: "Final",
    badgeStyle: { color: "#0B7E70", bg: "#E3F4F0", border: "transparent" },
    title: "Cognitive screening — follow‑up",
    summary: "MoCA 24/30. Mild decline from baseline, predominantly delayed recall. Recommended full evaluation.",
    actions: ["openReport"],
  },
  {
    date: "15 Jun 2025",
    badge: "Final",
    badgeStyle: { color: "#0B7E70", bg: "#E3F4F0", border: "transparent" },
    title: "Initial consultation",
    summary: "Memory complaint raised by family. MoCA 27/30. Baseline labs and thyroid panel ordered.",
    actions: ["openNote"],
  },
  {
    date: "10 Sep 2024",
    badge: "Intake",
    badgeStyle: { color: "#647082", bg: "#F0F2F5", border: "transparent" },
    title: "Referral intake",
    summary: "Established care. PMH hypertension, hypothyroidism. Family history of late‑onset dementia recorded.",
    actions: [],
  },
];

export function HistoryScreen({ onGoReport, onCompare, onOpenEncounter }: HistoryScreenProps) {
  return (
    <div className="sa" style={{ flex: 1, overflowY: "auto", padding: "28px 32px 40px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 24 }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: ".1em",
                color: "#93A0B0",
                textTransform: "uppercase",
                marginBottom: 7,
              }}
            >
              Patient record
            </div>
            <h1 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.02em", color: "#101a27" }}>
              Eleanor M. Hayes
            </h1>
            <p style={{ margin: "7px 0 0", fontSize: 13.5, color: "#647082" }}>
              69F · MRN SYN‑4471 · 4 encounters on file · referred by Neurology
            </p>
          </div>
          <div
            style={{
              marginLeft: "auto",
              background: "#fff",
              border: "1px solid #E5E8ED",
              borderRadius: 12,
              padding: "13px 18px",
              boxShadow: "0 1px 2px rgba(16,26,39,.03)",
            }}
          >
            <div style={{ fontSize: 11, color: "#8A95A3", marginBottom: 8 }}>MoCA trend</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 38 }}>
              {[90, 80, 66, 58].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: `${h}%`,
                    background: ["#0E9C89", "#5BBBAB", "#D9A441", "#C0524A"][i],
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#A6B0BD", marginTop: 6 }}>
              28 → 27 → 24 → 22
            </div>
          </div>
        </div>

        <div style={{ position: "relative", paddingLeft: 30 }}>
          <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: 2, background: "#E1E5EB" }} />

          {ENCOUNTERS.map((enc, i) => (
            <div key={enc.date} style={{ position: "relative", marginBottom: i < ENCOUNTERS.length - 1 ? 16 : 0 }}>
              <div
                style={{
                  position: "absolute",
                  left: -29,
                  top: 18,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  border: `3px solid ${enc.active ? "#2F5BD0" : "#C2C9D4"}`,
                }}
              />
              <div
                style={{
                  background: "#fff",
                  border: enc.active ? "1px solid #D6DEEC" : "1px solid #E5E8ED",
                  borderRadius: 12,
                  padding: "16px 18px",
                  boxShadow: enc.active ? "0 2px 10px rgba(47,91,208,.07)" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: enc.active ? "#2F5BD0" : "#8A95A3" }}>
                    {enc.date}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: enc.badgeStyle.color,
                      background: enc.badgeStyle.bg,
                      border: enc.badgeStyle.border !== "transparent" ? `1px solid ${enc.badgeStyle.border}` : undefined,
                      padding: "2px 8px",
                      borderRadius: 20,
                    }}
                  >
                    {enc.badge}
                  </span>
                  {enc.extra && (
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#8A95A3" }}>{enc.extra}</span>
                  )}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#101a27", marginBottom: 4 }}>{enc.title}</div>
                <div style={{ fontSize: 12.5, color: "#56616F", lineHeight: 1.5 }}>{enc.summary}</div>
                {enc.actions.length > 0 && (
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    {enc.actions.includes("openDraft") && (
                      <button
                        type="button"
                        onClick={onGoReport}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#fff",
                          background: "#2F5BD0",
                          border: "none",
                          borderRadius: 7,
                          padding: "7px 13px",
                          cursor: "pointer",
                        }}
                      >
                        Open draft
                      </button>
                    )}
                    {enc.actions.includes("compare") && (
                      <button
                        type="button"
                        onClick={onCompare}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#647082",
                          background: "#fff",
                          border: "1px solid #DCE0E7",
                          borderRadius: 7,
                          padding: "7px 13px",
                          cursor: "pointer",
                        }}
                      >
                        Compare
                      </button>
                    )}
                    {(enc.actions.includes("openReport") || enc.actions.includes("openNote")) && (
                      <button
                        type="button"
                        onClick={onOpenEncounter}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#647082",
                          background: "#fff",
                          border: "1px solid #DCE0E7",
                          borderRadius: 7,
                          padding: "7px 13px",
                          cursor: "pointer",
                        }}
                      >
                        {enc.actions.includes("openReport") ? "Open report" : "Open note"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
