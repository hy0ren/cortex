"use client";

import { buildWaveBars } from "@/data/demo/cortex";
import { ArrowRight, CheckIcon } from "../components/icons";

type IntakeScreenProps = {
  onGoPipeline: () => void;
};

const TEST_FILES = [
  { name: "WAIS‑IV_scores.csv", detail: "5 indices · normed by Norm" },
  { name: "WMS‑IV_memory.pdf", detail: "Immediate & delayed indices" },
  { name: "EF_language_battery.xlsx", detail: "Trails, BNT, fluency, Stroop" },
];

export function IntakeScreen({ onGoPipeline }: IntakeScreenProps) {
  const bars = buildWaveBars();

  return (
    <div className="sa" style={{ flex: 1, overflowY: "auto", padding: "28px 32px 40px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ marginBottom: 22 }}>
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
            New session
          </div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.02em", color: "#101a27" }}>
            Capture the visit
          </h1>
          <p style={{ margin: "7px 0 0", fontSize: 13.5, color: "#647082" }}>
            Dictate or upload the session, attach structured test data, then hand it to the pipeline.
          </p>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: 1.6, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E8ED",
                borderRadius: 13,
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(16,26,39,.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #EEF0F3", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1b2735" }}>Visit capture</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "#F0F2F5", borderRadius: 8, padding: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#0E9C89", padding: "5px 12px", borderRadius: 6 }}>
                    Live dictation
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#647082", padding: "5px 12px", borderRadius: 6, cursor: "pointer" }}>
                    Upload
                  </span>
                </div>
              </div>
              <div style={{ padding: "20px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button
                    type="button"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: "none",
                      background: "#C0524A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flex: "none",
                      boxShadow: "0 2px 8px rgba(192,82,74,.3)",
                      animation: "ring 2s ease-out infinite",
                    }}
                  >
                    <span style={{ width: 15, height: 15, borderRadius: 3, background: "#fff" }} />
                  </button>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, height: 46, overflow: "hidden" }}>
                    {bars.map((b, i) => (
                      <span
                        key={i}
                        style={{
                          flex: 1,
                          minWidth: 2,
                          height: b.h,
                          borderRadius: 2,
                          background: b.c,
                          transformOrigin: "center",
                          animation: "wave 1s ease-in-out infinite",
                          animationDelay: b.d,
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 17, color: "#1b2735", flex: "none" }}>14:22</div>
                </div>
                <div
                  style={{
                    marginTop: 18,
                    background: "#FBFCFD",
                    border: "1px solid #EEF0F3",
                    borderRadius: 10,
                    padding: "14px 16px",
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: "#3a4654",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: ".07em",
                      color: "#93A0B0",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    LIVE TRANSCRIPT · WERNICKE LISTENING
                  </span>
                  &ldquo;…she reports that the forgetfulness has been getting worse over the last several months. Her daughter notes she repeats questions and has been relying on notes. Daily activities are mostly intact, though medications are now managed by family
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 14,
                      background: "#0E9C89",
                      marginLeft: 2,
                      verticalAlign: -2,
                      animation: "blink 1s step-end infinite",
                    }}
                  />
                  &rdquo;
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E8ED",
                borderRadius: 13,
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(16,26,39,.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #EEF0F3" }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1b2735" }}>Structured test data</span>
                <span style={{ marginLeft: 8, fontSize: 11, color: "#0B7E70", background: "#E3F4F0", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                  3 files parsed
                </span>
                <button
                  type="button"
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#0E9C89",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add battery
                </button>
              </div>
              <div style={{ padding: "6px 18px 14px" }}>
                {TEST_FILES.map((file, i) => (
                  <div
                    key={file.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 0",
                      borderBottom: i < TEST_FILES.length - 1 ? "1px solid #F2F4F6" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "#F0F2F5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "none",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#647082" strokeWidth="1.7">
                        <path d="M7 3h7l4 4v14H7z" />
                        <path d="M14 3v4h4" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1b2735" }}>{file.name}</div>
                      <div style={{ fontSize: 11, color: "#93A0B0" }}>{file.detail}</div>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#0B7E70" }}>
                      <CheckIcon color="#0B7E70" size={13} />
                      Parsed
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 8,
                    border: "1.5px dashed #D5DAE1",
                    borderRadius: 10,
                    padding: 16,
                    textAlign: "center",
                    color: "#93A0B0",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#647082" }}>Drop additional score sheets</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>CSV, PDF, or XLSX · de‑identified on upload</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E8ED",
                borderRadius: 13,
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(16,26,39,.03)",
              }}
            >
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #EEF0F3", fontSize: 13.5, fontWeight: 600, color: "#1b2735" }}>
                Patient context
              </div>
              <div style={{ padding: "6px 18px 16px" }}>
                {[
                  ["Name", "Eleanor M. Hayes"],
                  ["Age / Sex", "69 · Female"],
                  ["Handedness", "Right"],
                  ["Education", "16 years"],
                  ["Referral", "Neurology · R. Okonkwo"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid #F2F4F6",
                    }}
                  >
                    <span style={{ fontSize: 12.5, color: "#8A95A3" }}>{label}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "#1b2735" }}>{value}</span>
                  </div>
                ))}
                <div style={{ padding: "10px 0" }}>
                  <span style={{ fontSize: 12.5, color: "#8A95A3", display: "block", marginBottom: 4 }}>Presenting concern</span>
                  <span style={{ fontSize: 12.5, color: "#3a4654", lineHeight: 1.5 }}>
                    8‑month progressive memory decline; r/o amnestic MCI vs. early neurodegenerative.
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E8ED",
                borderRadius: 13,
                padding: "16px 18px",
                boxShadow: "0 1px 2px rgba(16,26,39,.03)",
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1b2735", marginBottom: 12 }}>Ready to generate</div>
              {["Transcript captured", "Test data parsed (11 measures)", "Consent on file"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#0E9C89",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }}
                  >
                    <CheckIcon color="#fff" size={11} />
                  </span>
                  <span style={{ fontSize: 12.5, color: "#3a4654" }}>{item}</span>
                </div>
              ))}
              <button
                type="button"
                onClick={onGoPipeline}
                className="cortex-teal-btn"
                style={{
                  width: "100%",
                  height: 44,
                  marginTop: 7,
                  borderRadius: 10,
                  border: "none",
                  background: "#0E9C89",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(11,126,112,.25)",
                }}
              >
                Generate report
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                style={{
                  width: "100%",
                  height: 38,
                  marginTop: 9,
                  borderRadius: 10,
                  border: "1px solid #DCE0E7",
                  background: "#fff",
                  color: "#647082",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
