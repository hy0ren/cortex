"use client";

import type { GliaFlag } from "../types";
import { TEST_RESULTS, flagStyle } from "../mock-data";
import { CheckIcon } from "../icons";

type ReportScreenProps = {
  flags: GliaFlag[];
  onResolveFlag: (id: string) => void;
  onOpenExplain: () => void;
};

function classificationStyle(classification: string, warn?: boolean, alert?: boolean) {
  if (alert) return { color: "#A85B2A", bg: "#F9EADD" };
  if (warn) return { color: "#8A6D2E", bg: "#F7F0DF" };
  return { color: "#51607A", bg: "#EEF1F6" };
}

export function ReportScreen({ flags, onResolveFlag, onOpenExplain }: ReportScreenProps) {
  return (
    <div className="sa" style={{ flex: 1, overflowY: "auto", background: "#EFF1F4" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "rgba(239,241,244,0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #E1E5EB",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#101a27", letterSpacing: "-.01em" }}>
              Neuropsychological Evaluation
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#8A6D2E",
                background: "#F7F0DF",
                border: "1px solid #EAD9B5",
                padding: "3px 9px",
                borderRadius: 20,
              }}
            >
              Draft
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#8A95A3", marginTop: 3 }}>Last edited just now · autosaved</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              fontWeight: 600,
              color: "#B5803A",
              background: "#FBF3E2",
              border: "1px solid #ECDCB6",
              height: 34,
              padding: "0 12px",
              borderRadius: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            Glia: {flags.length} to review
          </div>
          <button
            type="button"
            onClick={onOpenExplain}
            className="cortex-teal-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              height: 34,
              padding: "0 13px",
              borderRadius: 8,
              border: "1px solid #DCE0E7",
              background: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#0B7E70",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
            </svg>
            Explain to patient
          </button>
          <button
            type="button"
            className="cortex-teal-btn"
            style={{
              height: 34,
              padding: "0 15px",
              borderRadius: 8,
              border: "none",
              background: "#0E9C89",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Finalize
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 26, padding: "30px 32px 60px", alignItems: "flex-start", maxWidth: 1180, margin: "0 auto" }}>
        <article
          style={{
            flex: 1,
            minWidth: 0,
            background: "#fff",
            border: "1px solid #E5E8ED",
            borderRadius: 4,
            boxShadow: "0 1px 3px rgba(16,26,39,.06)",
            padding: "48px 56px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingBottom: 22,
              borderBottom: "2px solid #101a27",
              marginBottom: 30,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: ".12em",
                  color: "#93A0B0",
                  textTransform: "uppercase",
                }}
              >
                Confidential · Synthetic record
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 27,
                  fontWeight: 700,
                  color: "#101a27",
                  margin: "9px 0 4px",
                  letterSpacing: "-.01em",
                }}
              >
                Neuropsychological Evaluation
              </h2>
              <div style={{ fontSize: 13, color: "#647082" }}>
                Eleanor M. Hayes · 69 years · Right‑handed · 16 years education
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#8A95A3",
                lineHeight: 1.9,
              }}
            >
              <div>MRN&nbsp;&nbsp;SYN‑4471</div>
              <div>DOB&nbsp;&nbsp;14 Mar 1957</div>
              <div>DOE&nbsp;&nbsp;18 Jun 2026</div>
              <div>Examiner&nbsp;&nbsp;L. Okafor, PhD</div>
            </div>
          </div>

          {[
            {
              title: "Reason for Referral",
              body: "Ms. Hayes is a 69‑year‑old, right‑handed woman with 16 years of education, referred by Neurology (R. Okonkwo, MD) for comprehensive neuropsychological evaluation. The referral concerns an eight‑month history of progressive memory difficulty and seeks to characterize her cognitive profile and help differentiate amnestic mild cognitive impairment from an early neurodegenerative process.",
            },
            {
              title: "History of Presenting Concern",
              body: (
                <>
                  The patient and her daughter report insidious onset of forgetfulness over the preceding{" "}
                  <span style={{ background: "#FBF1DD", borderBottom: "2px solid #D9A441", padding: "0 2px", cursor: "pointer" }}>
                    eight months
                    <sup style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, color: "#B5803A", marginLeft: 1 }}>1</sup>
                  </span>
                  , most notable for misplaced items, repeated questions, and increasing reliance on written reminders. Instrumental activities of daily living remain largely independent, though her daughter assumed management of medications two months ago. Medical history is significant for hypertension and hypothyroidism, both stably treated; there is no history of stroke, head injury, or seizure. Family history includes a mother with late‑onset dementia.
                </>
              ),
            },
            {
              title: "Behavioral Observations",
              body: "Ms. Hayes presented as alert, cooperative, and appropriately groomed. Speech was fluent and prosodic with no paraphasic errors. She was oriented to person, place, and situation, with mild uncertainty for the exact date. Effort was adequate and performance‑validity indicators were within acceptable limits. She became mildly anxious during memory tasks but remained engaged throughout.",
            },
          ].map((section) => (
            <section key={section.title} style={{ marginBottom: 26 }}>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#0B7E70",
                  margin: "0 0 9px",
                  letterSpacing: "-.005em",
                }}
              >
                {section.title}
              </h3>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 14.5, lineHeight: 1.74, color: "#2b3542", margin: 0 }}>
                {section.body}
              </p>
            </section>
          ))}

          <section style={{ marginBottom: 26 }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "#0B7E70", margin: "0 0 11px", letterSpacing: "-.005em" }}>
              Tests Administered
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {["WAIS‑IV", "WMS‑IV", "RAVLT", "Trail Making A & B", "Boston Naming Test", "Verbal Fluency (FAS / Animals)", "Stroop", "MoCA"].map(
                (test) => (
                  <span
                    key={test}
                    style={{
                      fontSize: 12,
                      color: "#3a4654",
                      background: "#F4F6F8",
                      border: "1px solid #E5E8ED",
                      padding: "5px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {test}
                  </span>
                )
              )}
            </div>
          </section>

          <section style={{ marginBottom: 26 }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "#0B7E70", margin: "0 0 12px", letterSpacing: "-.005em" }}>
              Test Results
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #D5DAE1" }}>
                  {["Measure", "Std. Score", "%ile", "Classification"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        textAlign: i === 0 ? "left" : i === 3 ? "left" : "right",
                        padding: i === 0 ? "8px 10px 8px 0" : i === 3 ? "8px 0 8px 14px" : "8px 14px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        color: "#93A0B0",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEST_RESULTS.map((row) => {
                  const cls = classificationStyle(row.classification, row.warn, row.alert);
                  return (
                    <tr
                      key={row.measure}
                      style={{
                        borderBottom: "1px solid #EEF0F3",
                        background: row.highlight ? "#FCF7EF" : undefined,
                      }}
                    >
                      <td style={{ padding: "9px 10px 9px 0", color: "#1b2735", fontWeight: row.highlight ? 600 : 500 }}>
                        {row.measure}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          padding: "9px 14px",
                          fontFamily: "var(--font-mono)",
                          color: row.alert ? "#A85B2A" : "#1b2735",
                          fontWeight: row.alert ? 500 : undefined,
                        }}
                      >
                        {row.score}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          padding: "9px 14px",
                          fontFamily: "var(--font-mono)",
                          color: row.alert ? "#A85B2A" : "#647082",
                        }}
                      >
                        {row.percentile}
                      </td>
                      <td style={{ padding: "9px 0 9px 14px" }}>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: cls.color,
                            background: cls.bg,
                            padding: "3px 8px",
                            borderRadius: 5,
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
            <div style={{ fontSize: 11, color: "#93A0B0", marginTop: 10, fontStyle: "italic" }}>
              Standard scores: M = 100, SD = 15, age‑corrected. Classification per Heaton conventions. SEM applied; bands indicate confidence, not point certainty.
            </div>
          </section>

          <section style={{ marginBottom: 26 }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "#0B7E70", margin: "0 0 9px", letterSpacing: "-.005em" }}>
              Interpretation
            </h3>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 14.5, lineHeight: 1.74, color: "#2b3542", margin: 0 }}>
              Overall intellectual functioning falls within the Average range and is consistent with estimated premorbid ability. Against this backdrop, memory is{" "}
              <span style={{ background: "#FBF1DD", borderBottom: "2px solid #D9A441", padding: "0 2px", cursor: "pointer" }}>
                mildly reduced
                <sup style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, color: "#B5803A", marginLeft: 1 }}>2</sup>
              </span>{" "}
              relative to other domains, with delayed verbal recall (RAVLT, WMS‑IV Delayed) falling in the Borderline range and limited benefit from recognition cueing — a pattern suggestive of an encoding‑type amnestic process. Processing speed and aspects of executive set‑shifting are mildly reduced (Low Average) and may be partly secondary to task memory demands. Language and visuospatial reasoning are intact. Affective contribution was{" "}
              <span style={{ background: "#EBF0FB", borderBottom: "2px solid #6E93E0", padding: "0 2px", cursor: "pointer" }}>
                not formally screened
                <sup style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 700, color: "#2F5BD0", marginLeft: 1 }}>3</sup>
              </span>{" "}
              this visit. Taken together, the profile is most consistent with amnestic mild cognitive impairment; an early neurodegenerative etiology cannot be excluded and warrants surveillance.
            </p>
          </section>

          <section>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "#0B7E70", margin: "0 0 9px", letterSpacing: "-.005em" }}>
              Summary & Recommendations
            </h3>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 14.5, lineHeight: 1.74, color: "#2b3542", margin: "0 0 12px" }}>
              Ms. Hayes demonstrates a circumscribed amnestic profile on a background of otherwise preserved cognition, most consistent with amnestic mild cognitive impairment. The following are recommended:
            </p>
            <ol style={{ fontFamily: "var(--font-serif)", fontSize: 14.5, lineHeight: 1.7, color: "#2b3542", margin: 0, paddingLeft: 20 }}>
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

        <aside style={{ width: 312, flex: "none", position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E8ED",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(16,26,39,.05)",
            }}
          >
            <div style={{ padding: "15px 17px", borderBottom: "1px solid #EEF0F3", display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "#EAF0FB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F5BD0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M12 3 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
                </svg>
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1b2735" }}>Glia · Quality assurance</div>
                <div style={{ fontSize: 11, color: "#8A95A3", marginTop: 2 }}>Human‑in‑the‑loop review</div>
              </div>
            </div>
            <div style={{ padding: "12px 17px", borderBottom: "1px solid #EEF0F3", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#56616F" }}>
                <CheckIcon color="#0E9C89" />
                Normative alignment verified
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#56616F" }}>
                <CheckIcon color="#0E9C89" />
                All required sections present
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#56616F" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B5803A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
                <span style={{ fontWeight: 600, color: "#3a4654" }}>{flags.length} items need your judgement</span>
              </div>
            </div>

            <div style={{ padding: "13px 14px", display: "flex", flexDirection: "column", gap: 11 }}>
              {flags.map((f) => {
                const style = flagStyle(f.severity);
                return (
                  <div
                    key={f.id}
                    style={{
                      border: `1px solid ${style.bord}`,
                      background: style.soft,
                      borderRadius: 10,
                      padding: "12px 13px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          fontWeight: 500,
                          color: style.accent,
                          border: `1px solid ${style.bord}`,
                          padding: "2px 6px",
                          borderRadius: 5,
                          background: "#fff",
                        }}
                      >
                        {style.label}
                      </span>
                      <span style={{ fontSize: 10.5, color: "#8A95A3" }}>{f.section}</span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1b2735", marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "#56616F" }}>{f.detail}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
                      <button
                        type="button"
                        onClick={() => onResolveFlag(f.id)}
                        style={{
                          flex: 1,
                          height: 30,
                          borderRadius: 7,
                          border: "none",
                          background: style.accent,
                          color: "#fff",
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveFlag(f.id)}
                        style={{
                          flex: 1,
                          height: 30,
                          borderRadius: 7,
                          border: "1px solid #DCE0E7",
                          background: "#fff",
                          color: "#647082",
                          fontSize: 11.5,
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
                <div style={{ textAlign: "center", padding: "26px 12px" }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "#E3F4F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <CheckIcon color="#0E9C89" size={22} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1b2735" }}>All clear</div>
                  <div style={{ fontSize: 11.5, color: "#8A95A3", marginTop: 3 }}>
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
