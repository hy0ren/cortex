import type { GliaFlag, PatientRecord, ReportDraft, Encounter } from "@/data/contracts";
import { INITIAL_FLAGS } from "./cortex";

export const DEMO_ACTIVE_PATIENT: PatientRecord = {
  id: "pat-demo-hayes",
  mrn: "SYN-4471",
  demographics: {
    name: "Eleanor M. Hayes",
    dateOfBirth: "1957-03-14",
    sex: "F",
    education: "16 years",
    handedness: "Right",
    referralReason:
      "Eight-month progressive memory decline; rule out amnestic MCI versus early neurodegenerative disease",
  },
  history: {
    medical: ["Type 2 Diabetes, well-controlled", "Hypertension"],
    psychiatric: [],
    medications: ["Metformin 500mg BID", "Lisinopril 10mg daily"],
    priorEvaluations: [],
  },
  priorReports: [],
};

export const DEMO_ACTIVE_ENCOUNTER: Encounter = {
  id: "enc-demo-hayes",
  patientId: "pat-demo-hayes",
  clinicianId: "system",
  status: "completed",
  appointmentDate: "2026-06-21",
  referralReason: "Eight-month progressive memory decline; rule out amnestic MCI versus early neurodegenerative disease",
  transcript: "The patient and her daughter describe progressive forgetfulness, repeated questions, misplaced items, and increasing reliance on written reminders over approximately eight months. Daily activities remain mostly intact, although family now manages medications.",
  testBattery: [
    { test: "WAIS-IV", subtest: "Full Scale IQ", standardScore: 98, percentile: 45, classification: "Average" },
    { test: "WAIS-IV", subtest: "Verbal Comprehension", standardScore: 105, percentile: 63, classification: "Average" },
    { test: "WAIS-IV", subtest: "Perceptual Reasoning", standardScore: 101, percentile: 53, classification: "Average" },
    { test: "WAIS-IV", subtest: "Working Memory", standardScore: 90, percentile: 25, classification: "Average" },
    { test: "WAIS-IV", subtest: "Processing Speed", standardScore: 86, percentile: 18, classification: "Low Average" },
    { test: "WMS-IV", subtest: "Immediate Memory", standardScore: 81, percentile: 10, classification: "Low Average" },
    { test: "WMS-IV", subtest: "Delayed Memory", standardScore: 73, percentile: 4, classification: "Borderline" },
    { test: "RAVLT", subtest: "Delayed Recall", standardScore: 70, percentile: 2, classification: "Borderline" },
    { test: "Boston Naming Test", standardScore: 92, percentile: 30, classification: "Average" },
    { test: "Verbal Fluency", subtest: "FAS", standardScore: 88, percentile: 21, classification: "Low Average" },
    { test: "Trail Making", subtest: "Part B", standardScore: 84, percentile: 14, classification: "Low Average" },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

};

export const DEMO_REPORT_SECTIONS: Record<string, string> = {
  reasonForReferral:
    "Ms. Hayes is a 69-year-old, right-handed woman with 16 years of education, referred by Neurology for comprehensive neuropsychological evaluation. The referral concerns an eight-month history of progressive memory difficulty.",
  history:
    "The patient and her daughter report insidious onset of forgetfulness, misplaced items, repeated questions, and increasing reliance on written reminders. Instrumental activities remain largely independent, though her daughter recently assumed medication management.",
  behavioralObservations:
    "Ms. Hayes presented as alert, cooperative, and appropriately groomed. Speech was fluent and prosodic. Effort was adequate and performance-validity indicators were within acceptable limits.",
  interpretation:
    "Overall intellectual functioning is Average. Memory is selectively reduced, with delayed verbal recall in the Borderline range and limited benefit from recognition cueing. The profile is most consistent with amnestic mild cognitive impairment; an early neurodegenerative etiology cannot be excluded.",
  summary:
    "Ms. Hayes demonstrates a circumscribed amnestic profile on a background of otherwise preserved cognition. Neurology follow-up, compensatory strategies, medication review, affective screening, and repeat evaluation in 12 months are recommended.",
};

export function createDemoDraft(
  clinicianId: string,
  options?: { id?: string; patientId?: string; fillMockData?: boolean }
): ReportDraft {
  const now = new Date().toISOString();
  return {
    id: options?.id ?? "draft-hayes-2026",
    clinicianId,
    patientId: options?.patientId ?? DEMO_ACTIVE_PATIENT.id,
    status: options?.fillMockData ? "review" : "idle",
    sections: options?.fillMockData ? { ...DEMO_REPORT_SECTIONS } : {},
    agentNotes: {
      flags: "[]",
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function getDemoFlags(): GliaFlag[] {
  return INITIAL_FLAGS.map((flag) => ({ ...flag }));
}
