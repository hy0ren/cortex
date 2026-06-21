/** Shared domain types for Cortex infrastructure and agents. */

export type {
  FlagSeverity,
  GliaFlag,
  TestResult,
  WaveBar,
} from "./cortex-ui";

export type {
  AgentId,
  AgentStatus,
  BandRoom,
  Encounter,
  PatientIntake,
  HistoryChunk,
  NormativeChunk,
  NormativeSearchResult,
  PatientDemographics,
  PatientHistory,
  PatientRecord,
  PriorReport,
  ReportDraft,
  TestScore,
  VectorSearchResult,
} from "./domain";

export type {
  AnnotationPacket,
  AnnotationResult,
  AnnotationVerdict,
  FlagAnnotation,
  FlagAnnotationVerdict,
  StageAnnotation,
} from "./annotations";

export type {
  ApiFailure,
  ApiResponse,
  ApiSuccess,
  AuthSession,
  AuthUser,
  PipelinePhase,
  PipelineRun,
  ReportWorkspace,
  RuntimeCapabilities,
  RuntimeMode,
  UploadedAsset,
} from "./api";
