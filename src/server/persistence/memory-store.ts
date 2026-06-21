import "server-only";
import type {
  AuthSession,
  PipelineRun,
  ReportDraft,
  UploadedAsset,
  Encounter,
} from "@/data/contracts";

type MemoryStore = {
  sessions: Map<string, AuthSession>;
  drafts: Map<string, ReportDraft>;
  pipelines: Map<string, PipelineRun>;
  uploads: Map<string, UploadedAsset[]>;
  encounters: Map<string, Encounter>;
};

const globalStore = globalThis as typeof globalThis & {
  __cortexMemoryStore?: MemoryStore;
};

export function getMemoryStore(): MemoryStore {
  globalStore.__cortexMemoryStore ??= {
    sessions: new Map(),
    drafts: new Map(),
    pipelines: new Map(),
    uploads: new Map(),
    encounters: new Map(),
  };
  return globalStore.__cortexMemoryStore;
}
