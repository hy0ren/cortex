import type { GliaFlag } from "./types";

export const INITIAL_FLAGS: GliaFlag[] = [
  {
    id: "f1",
    section: "Interpretation",
    severity: "verify",
    title: "Severity language vs. score range",
    detail:
      "Draft reads \"mildly reduced,\" yet WMS‑IV Delayed (73) and RAVLT Delayed (70) fall in the Borderline range. Confirm intended severity.",
  },
  {
    id: "f2",
    section: "Interpretation",
    severity: "note",
    title: "Mood not formally screened",
    detail:
      "No affective measure (e.g., GDS‑15) in the attached battery. Findings are attributed to cognition; consider noting screening was deferred.",
  },
  {
    id: "f3",
    section: "History",
    severity: "verify",
    title: "Onset date is ambiguous",
    detail:
      "Dictation says \"about eight months,\" while the intake form notes \"since last fall.\" Reconcile the reported onset.",
  },
];

export const TEST_RESULTS = [
  { measure: "WAIS‑IV Full Scale IQ", score: 98, percentile: 45, classification: "Average", highlight: false },
  { measure: "Verbal Comprehension", score: 105, percentile: 63, classification: "Average", highlight: false },
  { measure: "Perceptual Reasoning", score: 101, percentile: 53, classification: "Average", highlight: false },
  { measure: "Working Memory", score: 90, percentile: 25, classification: "Average", highlight: false },
  { measure: "Processing Speed", score: 86, percentile: 18, classification: "Low Average", highlight: false, warn: true },
  { measure: "WMS‑IV Immediate Memory", score: 81, percentile: 10, classification: "Low Average", highlight: false, warn: true },
  { measure: "WMS‑IV Delayed Memory", score: 73, percentile: 4, classification: "Borderline", highlight: true, alert: true },
  { measure: "RAVLT Delayed Recall", score: 70, percentile: 2, classification: "Borderline", highlight: true, alert: true },
  { measure: "Boston Naming Test", score: 92, percentile: 30, classification: "Average", highlight: false },
  { measure: "Verbal Fluency (FAS)", score: 88, percentile: 21, classification: "Low Average", highlight: false, warn: true },
  { measure: "Trail Making B", score: 84, percentile: 14, classification: "Low Average", highlight: false, warn: true },
];

export function buildWaveBars(): Array<{ h: string; d: string; c: string }> {
  return Array.from({ length: 46 }, (_, i) => {
    const h = 14 + Math.round(30 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.3)));
    return {
      h: `${h}px`,
      d: `${(i * 0.045).toFixed(2)}s`,
      c: i < 30 ? "#0E9C89" : "#CBD3DC",
    };
  });
}

export function flagStyle(severity: "verify" | "note") {
  return severity === "verify"
    ? { accent: "#B5803A", soft: "#FBF3E2", bord: "#ECDCB6", label: "Needs review" }
    : { accent: "#2F5BD0", soft: "#EAEFFB", bord: "#CDD9F4", label: "Note" };
}
