import "server-only";
import type {
  AuthSession,
  PipelineRun,
  ReportDraft,
  UploadedAsset,
} from "@/data/contracts";

type MemoryStore = {
  sessions: Map<string, AuthSession>;
  users: Map<string, {
    id: string;
    email: string;
    displayName: string;
    role: "clinician";
    passwordHash: string;
    createdAt: string;
  }>;
  drafts: Map<string, ReportDraft>;
  pipelines: Map<string, PipelineRun>;
  uploads: Map<string, UploadedAsset[]>;
};

const globalStore = globalThis as typeof globalThis & {
  __cortexMemoryStore?: MemoryStore;
};

export function getMemoryStore(): MemoryStore {
  globalStore.__cortexMemoryStore ??= {
    sessions: new Map(),
    users: new Map(),
    drafts: new Map(),
    pipelines: new Map(),
    uploads: new Map(),
  };
  return globalStore.__cortexMemoryStore;
}
