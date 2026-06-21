"use client";

import type { GliaFlag } from "../model/types";
import type { PatientRecord, ReportDraft } from "@/data/contracts";
import { flagStyle } from "@/data/demo/cortex";
import { CheckIcon } from "../components/icons";
import { Button } from "@/client/components/ui/button";
import { Badge } from "@/client/components/ui/badge";

type ReportScreenProps = {
  flags: GliaFlag[];
  draft: ReportDraft;
  patient: PatientRecord;
  busy: boolean;
  onResolveFlag: (id: string, resolution: "confirmed" | "dismissed") => void;
  onOpenExplain: () => void;
  onFinalize: () => Promise<void>;
};

function classificationStyle(warn?: boolean, alert?: boolean) {
  if (alert) return { color: "var(--cortex-alert)", bg: "var(--cortex-alert-bg)" };
  if (warn) return { color: "var(--cortex-warn)", bg: "var(--cortex-warn-bg)" };
  return { color: "#51607a", bg: "#eef1f6" };
}

function FlagMarkers({ flags }: { flags: GliaFlag[] }) {
  if (flags.length === 0) return null;
  return (
    <span style={{ display: "inline-flex", gap: 4, marginLeft: 8, verticalAlign: "super" }}>
      {flags.map((f, i) => {
        const style = flagStyle(f.severity);
        return (
          <a
            key={f.id}
            id={`flag-marker-${f.id}`}
            href={`#flag-card-${f.id}`}
            className="cortex-flag-marker"
            title={f.title}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: "50%",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              color: "#fff",
              background: style.accent,
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            {i + 1}
          </a>
        );
      })}
    </span>
  );
}

export function ReportScreen({ flags, draft, patient, busy, onResolveFlag, onOpenExplain, onFinalize }: ReportScreenProps) {
  const status = draft.status;
  const age = Math.max(0, new Date().getFullYear() - new Date(patient.demographics.dateOfBirth).getFullYear());
  const flagsBySection = (section: string) => flags.filter((f) => f.section === section);

  return (
    <div className="sa" style={{ flex: 1, overflowY: "auto", background: "var(--cortex-canvas)" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "rgba(239,241,244,0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e1e5eb",
          padding: "var(--space-4) var(--space-7)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--cortex-ink)", letterSpacing: "-.01em" }}>
              Neuropsychological Evaluation
            </h1>
            <Badge variant={status === "finalized" ? "verify" : "warn"} className="rounded-full border px-2.5 py-0.5">
              {status === "finalized" ? "Final" : "Draft"}
            </Badge>
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", marginTop: 3 }}>Last edited just now · autosaved</div>
        </div>
        <div className="flex items-center gap-2.5" style={{ marginLeft: "auto" }}>
          <div
            className="flex items-center gap-1.5"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--cortex-verify)",
              background: "var(--cortex-verify-bg)",
              border: "1px solid var(--cortex-verify-border)",
              height: 34,
              padding: "0 var(--space-3)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            Glia: {flags.length} to review
          </div>
          <Button type="button" variant="cortex-secondary" size="default" onClick={onOpenExplain}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
            </svg>
            Explain to patient
          </Button>
          <Button
            type="button"
            variant="cortex-primary"
            size="default"
            onClick={() => void onFinalize()}
            disabled={busy || status === "finalized"}
          >
            {status === "finalized" ? "Finalized" : busy ? "Saving…" : "Finalize"}
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--space-6)", padding: "var(--space-7) var(--space-7) var(--space-9)", alignItems: "flex-start", maxWidth: 1240, margin: "0 auto" }}>
        <article
          data-report-document
          style={{
            flex: 1,
            minWidth: 0,
            background: "var(--cortex-surface)",
            border: "1px solid var(--cortex-border)",
            borderRadius: "var(--radius-xs)",
            boxShadow: "0 1px 3px rgba(16,26,39,.06)",
            padding: "64px 72px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingBottom: "var(--space-5)",
              borderBottom: "2px solid var(--cortex-ink)",
              marginBottom: "var(--space-7)",
            }}
          >
            <div>
              <div
                className="font-mono uppercase"
                style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-mono-wide)", color: "var(--cortex-fg-ghost)" }}
              >
                Confidential · Synthetic record
              </div>
              <h2
                className="font-serif"
                style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--cortex-ink)", margin: "var(--space-2) 0 4px", letterSpacing: "-.01em" }}
              >
                Neuropsychological Evaluation
              </h2>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-subtle)" }}>
                {patient.demographics.name} · {age} years · {patient.demographics.handedness}-handed · {patient.demographics.education}
              </div>
            </div>
            <div className="font-mono" style={{ textAlign: "right", fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", lineHeight: 1.9 }}>
              <div>MRN&nbsp;&nbsp;{patient.mrn}</div>
              <div>DOB&nbsp;&nbsp;{patient.demographics.dateOfBirth}</div>
              <div>DOE&nbsp;&nbsp;{new Date(draft.updatedAt).toLocaleDateString()}</div>
              <div>Examiner&nbsp;&nbsp;L. Okafor, PhD</div>
            </div>
          </div>

          {[
            { key: "Reason for Referral", title: "Reason for Referral", body: draft.sections.reasonForReferral },
            { key: "History", title: "History of Presenting Concern", body: draft.sections.history },
            { key: "Behavioral Observations", title: "Behavioral Observations", body: draft.sections.behavioralObservations },
          ].map((section) => (
            <section key={section.key} style={{ marginBottom: "var(--space-7)" }}>
              <h3
                className="font-serif"
                style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--cortex-teal-dark)", margin: "0 0 var(--space-3)", letterSpacing: "-.005em" }}
              >
                {section.title}
              </h3>
              <p className="font-serif" style={{ fontSize: "var(--text-md)", lineHeight: 1.74, color: "var(--cortex-ink-3)", margin: 0 }}>
                {section.body}
                <FlagMarkers flags={flagsBySection(section.key)} />
              </p>
            </section>
          ))}

          <section style={{ marginBottom: "var(--space-7)" }}>
            <h3 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--cortex-teal-dark)", margin: "0 0 var(--space-4)", letterSpacing: "-.005em" }}>
              Tests Administered
            </h3>
            <div className="flex flex-wrap gap-[7px]">
              {[...new Set(patient.testBattery.map((score) => score.test))].map((test) => (
                <span
                  key={test}
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--cortex-ink-4)",
                    background: "#f4f6f8",
                    border: "1px solid var(--cortex-border)",
                    padding: "5px 10px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  {test}
                </span>
              ))}
            </div>
          </section>

          <section id="section-test-results" style={{ marginBottom: "var(--space-7)" }}>
            <h3 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--cortex-teal-dark)", margin: "0 0 var(--space-4)", letterSpacing: "-.005em" }}>
              Test Results
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--cortex-border-stronger)" }}>
                  {["Measure", "Std. Score", "%ile", "Classification"].map((h, i) => (
                    <th
                      key={h}
                      className="font-mono uppercase"
                      style={{
                        textAlign: i === 0 ? "left" : i === 3 ? "left" : "right",
                        padding: i === 0 ? "8px 10px 8px 0" : i === 3 ? "8px 0 8px 14px" : "8px 14px",
                        fontSize: "var(--text-xs)",
                        letterSpacing: "var(--tracking-mono-tight)",
                        color: "var(--cortex-fg-ghost)",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patient.testBattery.map((row) => {
                  const alert = /borderline|impaired/i.test(row.classification);
                  const warn = /low average/i.test(row.classification);
                  const cls = classificationStyle(warn, alert);
                  return (
                    <tr
                      key={`${row.test}-${row.subtest ?? ""}`}
                      style={{ borderBottom: "1px solid var(--cortex-border-soft)", background: alert ? "#fcf7ef" : undefined }}
                    >
                      <td style={{ padding: "9px 10px 9px 0", color: "var(--cortex-ink-2)", fontWeight: alert ? 600 : 500 }}>
                        {row.test}
                        {row.subtest ? ` — ${row.subtest}` : ""}
                      </td>
                      <td
                        className="font-mono"
                        style={{ textAlign: "right", padding: "9px 14px", color: alert ? "var(--cortex-alert)" : "var(--cortex-ink-2)", fontWeight: alert ? 500 : undefined }}
                      >
                        {row.standardScore}
                        {(warn || alert) && (
                          <span style={{ fontSize: 9, color: "var(--cortex-fg-ghost)", marginLeft: 3 }}>±SEM</span>
                        )}
                      </td>
                      <td className="font-mono" style={{ textAlign: "right", padding: "9px 14px", color: alert ? "var(--cortex-alert)" : "var(--cortex-fg-subtle)" }}>
                        {row.percentile}
                      </td>
                      <td style={{ padding: "9px 0 9px 14px" }}>
                        <span
                          style={{
                            fontSize: "var(--text-xs)",
                            fontWeight: 600,
                            color: cls.color,
                            background: cls.bg,
                            padding: "3px 8px",
                            borderRadius: "var(--radius-xs)",
                          }}
                        >
                          {row.classification}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-ghost)", marginTop: "var(--space-3)", fontStyle: "italic" }}>
              Standard scores: M = 100, SD = 15, age‑corrected. Classification per Heaton conventions. SEM applied; bands indicate confidence, not point
              certainty.
            </div>
          </section>

          <section style={{ marginBottom: "var(--space-7)" }}>
            <h3 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--cortex-teal-dark)", margin: "0 0 var(--space-3)", letterSpacing: "-.005em" }}>
              Interpretation
            </h3>
            <p className="font-serif" style={{ fontSize: "var(--text-md)", lineHeight: 1.74, color: "var(--cortex-ink-3)", margin: 0 }}>
              {draft.sections.interpretation}
              <FlagMarkers flags={flagsBySection("Interpretation")} />
            </p>
          </section>

          <section>
            <h3 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--cortex-teal-dark)", margin: "0 0 var(--space-3)", letterSpacing: "-.005em" }}>
              Summary & Recommendations
            </h3>
            <p className="font-serif" style={{ fontSize: "var(--text-md)", lineHeight: 1.74, color: "var(--cortex-ink-3)", margin: "0 0 var(--space-3)" }}>
              {draft.sections.summary}
              <FlagMarkers flags={flagsBySection("Summary")} />
            </p>
            <ol className="font-serif" style={{ fontSize: "var(--text-md)", lineHeight: 1.7, color: "var(--cortex-ink-3)", margin: 0, paddingLeft: 20 }}>
              {[
                "Neurology follow‑up with consideration of structural MRI and biomarker assessment.",
                "Repeat neuropsychological evaluation in 12 months to establish trajectory.",
                "Cognitive compensatory strategies and caregiver education.",
                "Medication review for anticholinergic burden.",
                "Affective screening (e.g., GDS‑15) at the next visit.",
              ].map((item, i) => (
                <li key={item} style={{ marginBottom: i < 4 ? 6 : 0 }}>
                  {item}
                </li>
              ))}
            </ol>
          </section>
        </article>

        <aside style={{ width: 312, flex: "none", position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div
            style={{
              background: "var(--cortex-surface)",
              border: "1px solid var(--cortex-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(16,26,39,.05)",
            }}
          >
            <div className="flex items-center gap-2.5" style={{ padding: "15px var(--space-4)", borderBottom: "1px solid var(--cortex-border-soft)" }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--cortex-blue-tint-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cortex-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M12 3 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
                </svg>
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--cortex-ink-2)" }}>Glia · Quality assurance</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", marginTop: 2 }}>Human‑in‑the‑loop review</div>
              </div>
            </div>
            <div className="flex flex-col gap-2" style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--cortex-border-soft)" }}>
              <div className="flex items-center gap-2" style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-muted)" }}>
                <CheckIcon color="var(--cortex-teal)" />
                Normative alignment verified
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-muted)" }}>
                <CheckIcon color="var(--cortex-teal)" />
                All required sections present
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-muted)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cortex-verify)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
                <span style={{ fontWeight: 600, color: "var(--cortex-ink-4)" }}>{flags.length} items need your judgement</span>
              </div>
            </div>

            <div className="flex flex-col gap-[11px]" style={{ padding: "13px 14px" }}>
              {flags.map((f, i) => {
                const style = flagStyle(f.severity);
                return (
                  <div
                    key={f.id}
                    id={`flag-card-${f.id}`}
                    className="cortex-flag-card"
                    style={{
                      border: `1px solid ${style.bord}`,
                      background: style.soft,
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-3)",
                    }}
                  >
                    <div className="flex items-center gap-1.5" style={{ marginBottom: 7 }}>
                      <span
                        className="font-mono"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#fff",
                          background: style.accent,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: 500,
                          color: style.accent,
                          border: `1px solid ${style.bord}`,
                          padding: "2px 6px",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--cortex-surface)",
                        }}
                      >
                        {style.label}
                      </span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)" }}>{f.section}</span>
                    </div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--cortex-ink-2)", marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: 1.5, color: "var(--cortex-fg-muted)" }}>{f.detail}</div>
                    <div className="flex gap-2" style={{ marginTop: "var(--space-3)" }}>
                      <button
                        type="button"
                        onClick={() => onResolveFlag(f.id, "confirmed")}
                        title="Confirm this flag is accurate and mark it reviewed"
                        style={{
                          flex: 1,
                          height: 30,
                          borderRadius: "var(--radius-sm)",
                          border: "none",
                          background: style.accent,
                          color: "#fff",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveFlag(f.id, "dismissed")}
                        title="Dismiss this flag as not applicable, without confirming it"
                        style={{
                          flex: 1,
                          height: 30,
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--cortex-border-strong)",
                          background: "var(--cortex-surface)",
                          color: "var(--cortex-fg-subtle)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
              {flags.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 12px" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "var(--cortex-teal-tint)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto var(--space-3)",
                    }}
                  >
                    <CheckIcon color="var(--cortex-teal)" size={24} />
                  </div>
                  <div style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--cortex-ink-2)" }}>All clear</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", marginTop: 4 }}>
                    No outstanding flags. Glia found nothing else to verify.
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
