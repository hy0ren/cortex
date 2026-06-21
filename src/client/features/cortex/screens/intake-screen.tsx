"use client";

import { useEffect, useRef, useState } from "react";
import type { PatientRecord, UploadedAsset } from "@/data/contracts";
import { buildWaveBars } from "@/data/demo/cortex";
import { ArrowRight, CheckIcon } from "../components/icons";
import { Button } from "@/client/components/ui/button";

type IntakeScreenProps = {
  patient: PatientRecord;
  uploads: UploadedAsset[];
  busy: boolean;
  onUpload: (file: File) => Promise<void>;
  onTranscribe: (file: File) => Promise<string>;
  onGenerate: () => Promise<void>;
  onSaveDraft: () => Promise<void>;
};

const TEST_FILES = [
  { name: "WAIS‑IV_scores.csv", detail: "5 indices · normed by Norm" },
  { name: "WMS‑IV_memory.pdf", detail: "Immediate & delayed indices" },
  { name: "EF_language_battery.xlsx", detail: "Trails, BNT, fluency, Stroop" },
];

export function IntakeScreen({ patient, uploads, busy, onUpload, onTranscribe, onGenerate, onSaveDraft }: IntakeScreenProps) {
  const bars = buildWaveBars();
  const fileInput = useRef<HTMLInputElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [captureMode, setCaptureMode] = useState<"live" | "upload">("live");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState(patient.visitTranscript);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  async function selectFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("audio/")) {
        const nextTranscript = await onTranscribe(file);
        if (nextTranscript) setTranscript(nextTranscript);
      }
      await onUpload(file);
    }
  }

  async function toggleRecording() {
    if (recording) {
      recorder.current?.stop();
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const nextRecorder = new MediaRecorder(stream);
    audioChunks.current = [];
    nextRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.current.push(event.data);
    };
    nextRecorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: nextRecorder.mimeType || "audio/webm" });
      const file = new File([blob], `visit-${Date.now()}.webm`, { type: blob.type });
      void selectFiles({ 0: file, length: 1, item: () => file } as unknown as FileList);
    };
    recorder.current = nextRecorder;
    setElapsedSeconds(0);
    nextRecorder.start();
    setRecording(true);
  }

  return (
    <div className="sa" style={{ flex: 1, overflowY: "auto", padding: "32px 36px 44px" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <div
            className="font-mono uppercase"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-mono-wide)", color: "var(--cortex-fg-ghost)", marginBottom: "var(--space-2)" }}
          >
            New session
          </div>
          <h1 style={{ margin: 0, fontSize: "var(--text-3xl)", fontWeight: 700, letterSpacing: "-.02em", color: "var(--cortex-ink)" }}>
            Capture the visit
          </h1>
          <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-md)", color: "var(--cortex-fg-subtle)" }}>
            Dictate or upload the session, attach structured test data, then hand it to the pipeline.
          </p>
        </div>

        <div className="flex items-start gap-5">
          <div style={{ flex: 1.6, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div
              style={{
                background: "var(--cortex-surface)",
                border: "1px solid var(--cortex-border)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <div className="flex items-center gap-2" style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--cortex-border-soft)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--cortex-ink-2)" }}>Visit capture</span>
                <div
                  role="tablist"
                  aria-label="Capture mode"
                  className="flex gap-1"
                  style={{ marginLeft: "auto", background: "var(--cortex-chip-bg)", borderRadius: "var(--radius-sm)", padding: 3 }}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={captureMode === "live"}
                    onClick={() => setCaptureMode("live")}
                    style={{
                      border: 0,
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      color: captureMode === "live" ? "#fff" : "var(--cortex-fg-subtle)",
                      background: captureMode === "live" ? "var(--cortex-teal)" : "transparent",
                      padding: "5px 12px",
                      borderRadius: "var(--radius-xs)",
                      cursor: "pointer",
                    }}
                  >
                    Live dictation
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={captureMode === "upload"}
                    onClick={() => {
                      setCaptureMode("upload");
                      fileInput.current?.click();
                    }}
                    style={{
                      border: 0,
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      color: captureMode === "upload" ? "#fff" : "var(--cortex-fg-subtle)",
                      background: captureMode === "upload" ? "var(--cortex-teal)" : "transparent",
                      padding: "5px 12px",
                      borderRadius: "var(--radius-xs)",
                      cursor: "pointer",
                    }}
                  >
                    Upload
                  </button>
                </div>
              </div>
              <div style={{ padding: "var(--space-5) var(--space-5)" }}>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => void toggleRecording()}
                    aria-label={recording ? "Stop dictation" : "Start dictation"}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: "none",
                      background: recording ? "#c0524a" : "var(--cortex-teal)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flex: "none",
                      boxShadow: "0 2px 8px rgba(192,82,74,.3)",
                      animation: recording ? "ring 2s ease-out infinite" : undefined,
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
                  <div className="font-mono" style={{ fontSize: "var(--text-lg)", color: "var(--cortex-ink-2)", flex: "none" }}>
                    {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:{String(elapsedSeconds % 60).padStart(2, "0")}
                  </div>
                </div>
                <div
                  className="font-serif"
                  style={{
                    marginTop: "var(--space-5)",
                    background: "var(--cortex-surface-muted)",
                    border: "1px solid var(--cortex-border-soft)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-4) var(--space-4)",
                    fontSize: "var(--text-sm)",
                    lineHeight: 1.7,
                    color: "var(--cortex-ink-4)",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "var(--text-xs)",
                      letterSpacing: "var(--tracking-mono-wide)",
                      color: "var(--cortex-fg-ghost)",
                      display: "block",
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    {recording ? "LIVE TRANSCRIPT · WERNICKE LISTENING" : "DICTATION PAUSED"}
                  </span>
                  &ldquo;{transcript}
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 14,
                      background: "var(--cortex-teal)",
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
                background: "var(--cortex-surface)",
                border: "1px solid var(--cortex-border)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <div className="flex items-center" style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--cortex-border-soft)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--cortex-ink-2)" }}>Structured test data</span>
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: "var(--text-xs)",
                    color: "var(--cortex-teal-dark)",
                    background: "var(--cortex-teal-tint)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-xl)",
                    fontWeight: 600,
                  }}
                >
                  {TEST_FILES.length + uploads.length} files parsed
                </span>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex items-center gap-1.5"
                  style={{
                    marginLeft: "auto",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "var(--cortex-teal)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add battery
                </button>
              </div>
              <div style={{ padding: "var(--space-2) var(--space-5) var(--space-4)" }}>
                {[
                  ...TEST_FILES.map((file) => ({ ...file, status: "Parsed" })),
                  ...uploads.map((asset) => ({
                    name: asset.name,
                    detail: asset.detail,
                    status: asset.status === "parsed" ? "Parsed" : "Uploaded",
                  })),
                ].map((file, i, files) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3"
                    style={{ padding: "11px 0", borderBottom: i < files.length - 1 ? "1px solid var(--cortex-border-soft)" : "none" }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--cortex-chip-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "none",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cortex-fg-subtle)" strokeWidth="1.7">
                        <path d="M7 3h7l4 4v14H7z" />
                        <path d="M14 3v4h4" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--cortex-ink-2)" }}>{file.name}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--cortex-fg-ghost)" }}>{file.detail}</div>
                    </div>
                    <span className="flex items-center gap-1.5" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--cortex-teal-dark)" }}>
                      <CheckIcon color="var(--cortex-teal-dark)" size={13} />
                      {file.status}
                    </span>
                  </div>
                ))}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInput.current?.click()}
                  onKeyDown={(event) => event.key === "Enter" && fileInput.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void selectFiles(event.dataTransfer.files);
                  }}
                  style={{
                    marginTop: "var(--space-2)",
                    border: "1.5px dashed var(--cortex-border-stronger)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-4)",
                    textAlign: "center",
                    color: "var(--cortex-fg-ghost)",
                  }}
                >
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--cortex-fg-subtle)" }}>Drop additional score sheets</div>
                  <div style={{ fontSize: "var(--text-xs)", marginTop: 2 }}>CSV, PDF, or XLSX · validate files contain no unnecessary identifiers</div>
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  hidden
                  accept=".csv,.pdf,.xlsx,.xls,.json,audio/*"
                  onChange={(event) => void selectFiles(event.target.files)}
                />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div
              style={{
                background: "var(--cortex-surface)",
                border: "1px solid var(--cortex-border)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--cortex-border-soft)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--cortex-ink-2)" }}>
                Patient context
              </div>
              <div style={{ padding: "var(--space-2) var(--space-5) var(--space-4)" }}>
                {[
                  ["Name", patient.demographics.name],
                  ["Sex", patient.demographics.sex],
                  ["Handedness", patient.demographics.handedness],
                  ["Education", patient.demographics.education],
                  ["MRN", patient.mrn],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between" style={{ padding: "10px 0", borderBottom: "1px solid var(--cortex-border-soft)" }}>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-faint)" }}>{label}</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--cortex-ink-2)" }}>{value}</span>
                  </div>
                ))}
                <div style={{ padding: "10px 0" }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--cortex-fg-faint)", display: "block", marginBottom: 4 }}>Presenting concern</span>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--cortex-ink-4)", lineHeight: 1.5 }}>{patient.demographics.referralReason}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--cortex-surface)",
                border: "1px solid var(--cortex-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-5) var(--space-5)",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--cortex-ink-2)", marginBottom: "var(--space-3)" }}>Ready to generate</div>
              {["Transcript captured", "Test data parsed (11 measures)", "Consent on file"].map((item) => (
                <div key={item} className="flex items-center gap-2.5" style={{ marginBottom: "var(--space-2)" }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "var(--cortex-teal)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }}
                  >
                    <CheckIcon color="#fff" size={11} />
                  </span>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--cortex-ink-4)" }}>{item}</span>
                </div>
              ))}
              <Button
                type="button"
                variant="cortex-primary"
                onClick={() => void onGenerate()}
                disabled={busy}
                style={{ width: "100%", height: 44, marginTop: "var(--space-1)" }}
              >
                {busy ? "Starting pipeline…" : "Generate report"}
                <ArrowRight size={16} />
              </Button>
              <Button
                type="button"
                variant="cortex-secondary"
                onClick={() => void onSaveDraft()}
                disabled={busy}
                style={{ width: "100%", height: 38, marginTop: "var(--space-3)" }}
              >
                Save draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
