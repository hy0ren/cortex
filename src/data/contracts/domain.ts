export type TestScore = {
  test: string;
  subtest?: string;
  standardScore: number;
  percentile: number;
  classification: string;
};

export type PatientDemographics = {
  name: string;
  dateOfBirth: string;
  sex: "M" | "F" | "X";
  education: string;
  handedness: "Right" | "Left" | "Ambidextrous";
  referralReason: string;
};

export type PatientHistory = {
  medical: string[];
  psychiatric: string[];
  medications: string[];
  priorEvaluations: Array<{
    date: string;
    setting: string;
    summary: string;
  }>;
};

export type PriorReport = {
  date: string;
  type: string;
  summary: string;
  sections?: Record<string, string>;
};

/** Synthetic patient record — consumed by Wernicke and Norm. */
export type PatientRecord = {
  id: string;
  mrn: string;
  demographics: PatientDemographics;
  history: PatientHistory;
  visitTranscript: string;
  testBattery: TestScore[];
  priorReports: PriorReport[];
};

/** Firestore draft document — live session state only, never patient history. */
export type ReportDraft = {
  id: string;
  clinicianId: string;
  patientId: string;
  status: "idle" | "generating" | "review" | "finalized";
  sections: Record<string, string>;
  agentNotes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

/** Agent identifiers in the Cortex pipeline. */
export type AgentId =
  | "wernicke"
  | "norm"
  | "engram"
  | "broca"
  | "glia"
  | "band";

export type AgentStatus = {
  agent: AgentId;
  phase: "idle" | "thinking" | "writing" | "reviewing" | "done" | "error";
  message: string;
  timestamp: string;
  detail?: string;
  metrics?: Record<string, string | number>;
};

export type HistoryChunk = {
  id: string;
  patientId: string;
  source: "transcript" | "priorReport" | "priorEvaluation";
  date?: string;
  text: string;
};

export type NormativeChunk = {
  id: string;
  test?: string;
  domain?: string;
  ageBand?: string;
  source: string;
  text: string;
};

/** Shared room state for Band multi-agent collaboration. */
export type BandRoom = {
  sessionId: string;
  patientId: string;
  transcript: string;
  testBattery: TestScore[];
  patientContext: string;
  normativeInterpretation: string;
  draftSections: Record<string, string>;
  qaFlags: Array<{
    severity: "info" | "warning" | "critical";
    section: string;
    message: string;
  }>;
  agentLog: AgentStatus[];
};

export type VectorSearchResult = {
  chunkId: string;
  patientId: string;
  score: number;
  snippet: string;
  source: HistoryChunk["source"];
};

export type NormativeSearchResult = {
  chunkId: string;
  score: number;
  snippet: string;
  source: string;
  test?: string;
  domain?: string;
};
