import type { AgentStatus, PatientRecord, ReportDraft } from "./domain";
import type { GliaFlag } from "./cortex-ui";

export type RuntimeMode = "configured" | "demo";

export type RuntimeCapabilities = {
  firebase: RuntimeMode;
  demoAuth: boolean;
  redis: RuntimeMode;
  anthropic: RuntimeMode;
  deepgram: RuntimeMode;
  arize: RuntimeMode;
  sentry: RuntimeMode;
  band: RuntimeMode;
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: "clinician";
};

export type AuthSession = {
  id: string;
  user: AuthUser;
  createdAt: string;
  expiresAt: string;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type UploadedAsset = {
  id: string;
  name: string;
  kind: "audio" | "scores" | "document";
  size: number;
  status: "uploaded" | "parsed" | "error";
  detail: string;
};

export type PipelinePhase = "idle" | "running" | "paused" | "complete" | "error";

export type PipelineRun = {
  id: string;
  clinicianId: string;
  patientId: string;
  draftId: string;
  phase: PipelinePhase;
  progress: number;
  currentAgent: string;
  startedAt: string;
  updatedAt: string;
  agentLog: AgentStatus[];
  bandRoomId?: string;
  evalVariant?: string;
};

export type ReportWorkspace = {
  patient: PatientRecord;
  draft: ReportDraft;
  flags: GliaFlag[];
  pipeline: PipelineRun | null;
  capabilities: RuntimeCapabilities;
};
