/** Human (Terac-recruited clinician) review labels for a completed pipeline run. */

export type AnnotationVerdict = "accurate" | "inaccurate" | "unclear";

export type StageAnnotation = {
  agent: "wernicke" | "norm" | "broca";
  verdict: AnnotationVerdict;
  notes?: string;
};

export type FlagAnnotationVerdict = "true_positive" | "false_positive";

export type FlagAnnotation = {
  flagId: string;
  verdict: FlagAnnotationVerdict;
  notes?: string;
};

export type AnnotationResult = {
  id: string;
  pipelineRunId: string;
  reviewerId: string;
  stageAnnotations: StageAnnotation[];
  flagAnnotations: FlagAnnotation[];
  missedIssues?: string;
  goldSummary?: string;
  createdAt: string;
};

export type AnnotationPacket = {
  pipelineRunId: string;
  patientDemographics: { name: string; dateOfBirth: string };
  referralReason: string;
  transcript: string;
  testBattery: Array<{
    test: string;
    subtest?: string;
    standardScore: number;
    percentile: number;
    classification: string;
  }>;
  wernicke: unknown;
  norm: unknown;
  broca: unknown;
  gliaFlags: Array<{
    id: string;
    section: string;
    severity: "verify" | "note";
    title: string;
    detail: string;
  }>;
};
