"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { AnnotationPacket, FlagAnnotation, StageAnnotation } from "@/data/contracts";

const STAGE_AGENTS: StageAnnotation["agent"][] = ["wernicke", "norm", "broca"];

export default function AnnotateReviewPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [packet, setPacket] = useState<AnnotationPacket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewerId, setReviewerId] = useState("");
  const [stageVerdicts, setStageVerdicts] = useState<Record<string, StageAnnotation["verdict"]>>({});
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});
  const [flagVerdicts, setFlagVerdicts] = useState<Record<string, FlagAnnotation["verdict"]>>({});
  const [missedIssues, setMissedIssues] = useState("");
  const [goldSummary, setGoldSummary] = useState("");

  useEffect(() => {
    fetch(`/api/annotations?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error?.message ?? "Failed to load packet");
        setPacket(json.data.packet);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load packet"));
  }, [token]);

  async function handleSubmit() {
    if (!packet) return;
    setSubmitting(true);
    setError(null);
    try {
      const stageAnnotations: StageAnnotation[] = STAGE_AGENTS.filter((a) => stageVerdicts[a]).map((agent) => ({
        agent,
        verdict: stageVerdicts[agent],
        notes: stageNotes[agent],
      }));
      const flagAnnotations: FlagAnnotation[] = packet.gliaFlags
        .filter((f) => flagVerdicts[f.id])
        .map((f) => ({ flagId: f.id, verdict: flagVerdicts[f.id] }));

      const res = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          reviewerId,
          stageAnnotations,
          flagAnnotations,
          missedIssues: missedIssues || undefined,
          goldSummary: goldSummary || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error?.message ?? "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !packet) {
    return <main style={{ padding: 32, fontFamily: "sans-serif" }}>Error: {error}</main>;
  }
  if (!packet) {
    return <main style={{ padding: 32, fontFamily: "sans-serif" }}>Loading review packet…</main>;
  }
  if (submitted) {
    return (
      <main style={{ padding: 32, fontFamily: "sans-serif" }}>
        <h1>Thank you</h1>
        <p>Your review has been recorded.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 32, maxWidth: 880, margin: "0 auto", fontFamily: "sans-serif", lineHeight: 1.5 }}>
      <h1>Cortex pipeline review</h1>
      <p style={{ color: "#666" }}>
        Patient: {packet.patientDemographics.name} (DOB {packet.patientDemographics.dateOfBirth}) — Referral:{" "}
        {packet.referralReason}
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2>Source transcript</h2>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 12, borderRadius: 6 }}>
          {packet.transcript}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Test battery</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Test</th>
              <th style={{ textAlign: "left" }}>Standard score</th>
              <th style={{ textAlign: "left" }}>Percentile</th>
              <th style={{ textAlign: "left" }}>Classification</th>
            </tr>
          </thead>
          <tbody>
            {packet.testBattery.map((t, i) => (
              <tr key={i}>
                <td>{t.test} {t.subtest}</td>
                <td>{t.standardScore}</td>
                <td>{t.percentile}</td>
                <td>{t.classification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {STAGE_AGENTS.map((agent) => (
        <section key={agent} style={{ marginBottom: 24 }}>
          <h2 style={{ textTransform: "capitalize" }}>{agent} output</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 12, borderRadius: 6, fontSize: 13 }}>
            {JSON.stringify(packet[agent], null, 2)}
          </pre>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
            <label>
              <select
                value={stageVerdicts[agent] ?? ""}
                onChange={(e) =>
                  setStageVerdicts((prev) => ({ ...prev, [agent]: e.target.value as StageAnnotation["verdict"] }))
                }
              >
                <option value="">Select verdict…</option>
                <option value="accurate">Accurate</option>
                <option value="inaccurate">Inaccurate</option>
                <option value="unclear">Unclear</option>
              </select>
            </label>
            <input
              placeholder="Notes (optional)"
              style={{ flex: 1, padding: 6 }}
              value={stageNotes[agent] ?? ""}
              onChange={(e) => setStageNotes((prev) => ({ ...prev, [agent]: e.target.value }))}
            />
          </div>
        </section>
      ))}

      <section style={{ marginBottom: 24 }}>
        <h2>Glia QA flags</h2>
        {packet.gliaFlags.length === 0 && <p style={{ color: "#666" }}>No flags were raised for this run.</p>}
        {packet.gliaFlags.map((flag) => (
          <div key={flag.id} style={{ border: "1px solid #ddd", borderRadius: 6, padding: 12, marginBottom: 8 }}>
            <strong>[{flag.severity}] {flag.title}</strong>
            <p style={{ color: "#666", margin: "4px 0" }}>{flag.detail}</p>
            <select
              value={flagVerdicts[flag.id] ?? ""}
              onChange={(e) =>
                setFlagVerdicts((prev) => ({ ...prev, [flag.id]: e.target.value as FlagAnnotation["verdict"] }))
              }
            >
              <option value="">Was this a real issue?</option>
              <option value="true_positive">True positive — real issue</option>
              <option value="false_positive">False positive — not a real issue</option>
            </select>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>What did the pipeline miss?</h2>
        <textarea
          style={{ width: "100%", minHeight: 80, padding: 8 }}
          placeholder="Anything a clinician would flag that Glia didn't catch"
          value={missedIssues}
          onChange={(e) => setMissedIssues(e.target.value)}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Optional: gold-standard summary</h2>
        <textarea
          style={{ width: "100%", minHeight: 120, padding: 8 }}
          placeholder="If you'd like, write the Summary and Impressions section as you would have"
          value={goldSummary}
          onChange={(e) => setGoldSummary(e.target.value)}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <label>
          Reviewer ID (provided by Terac)
          <input
            style={{ display: "block", padding: 8, marginTop: 4, width: 320 }}
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
          />
        </label>
      </section>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <button
        disabled={submitting || !reviewerId}
        onClick={handleSubmit}
        style={{ padding: "10px 20px", fontSize: 16, cursor: submitting ? "wait" : "pointer" }}
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </main>
  );
}
