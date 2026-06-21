import "server-only";
import type { GliaFlag, ReportDraft, ReportWorkspace } from "@/data/contracts";
import { createDemoDraft, getDemoFlags } from "@/data/demo/workspace";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { findPatient } from "@/server/persistence/patient-repository";
import { getReportDraft, upsertReportDraft } from "@/server/persistence/drafts";
import { getEncounter } from "@/server/persistence/redis/encounter-store";
import { getPipelineRunFromRedis } from "@/server/persistence/redis/pipeline-store";

export async function getWorkspace(
  clinicianId: string,
  patientId?: string,
  draftId?: string,
  encounterId?: string
): Promise<ReportWorkspace | null> {
  if (!patientId && !encounterId) return null;

  const resolvedPatientId = patientId ?? (encounterId ? (await getEncounter(encounterId))?.patientId : undefined);
  if (!resolvedPatientId) throw new Error("Patient ID required");

  const patient = await findPatient(resolvedPatientId);
  if (!patient) throw new Error("Patient not found");
  
  const encounter = encounterId ? await getEncounter(encounterId) : undefined;

  const resolvedDraftId =
    draftId ?? `draft-${patient.id}-${clinicianId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
  let draft = await getReportDraft(resolvedDraftId);
  if (draft && draft.clinicianId !== clinicianId) {
    throw new Error("Draft not found");
  }
  if (!draft) {
    draft = createDemoDraft(clinicianId, {
      id: resolvedDraftId,
      patientId: patient.id,
    });
    await upsertReportDraft(draft);
  }

  const flags = parseFlags(draft);
  const pipelineId = draft.agentNotes.pipelineId;
  const pipeline = pipelineId ? await getPipelineRunFromRedis(pipelineId) : null;

  return {
    patient,
    encounter: encounter ?? undefined,
    draft,
    flags,
    pipeline,
    capabilities: getRuntimeCapabilities(),
  };
}

function parseFlags(draft: ReportDraft): GliaFlag[] {
  try {
    const parsed = JSON.parse(draft.agentNotes.flags ?? "[]") as GliaFlag[];
    return Array.isArray(parsed) ? parsed : getDemoFlags();
  } catch {
    return getDemoFlags();
  }
}

export async function saveDraft(input: ReportDraft): Promise<ReportDraft> {
  const draft = { ...input, updatedAt: new Date().toISOString() };
  await upsertReportDraft(draft);
  return draft;
}

export async function updateDraftStatus(
  id: string,
  status: ReportDraft["status"]
): Promise<ReportDraft> {
  const draft = await getReportDraft(id);
  if (!draft) throw new Error("Draft not found");
  return saveDraft({ ...draft, status });
}

export type FlagResolution = "confirmed" | "dismissed";

type ResolvedFlagRecord = GliaFlag & {
  resolution: FlagResolution;
  resolvedAt: string;
};

function parseFlagHistory(draft: ReportDraft): ResolvedFlagRecord[] {
  try {
    const parsed = JSON.parse(draft.agentNotes.flagHistory ?? "[]") as ResolvedFlagRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function resolveDraftFlag(
  id: string,
  flagId: string,
  resolution: FlagResolution
): Promise<ReportDraft> {
  const draft = await getReportDraft(id);
  if (!draft) throw new Error("Draft not found");
  const flags = parseFlags(draft);
  const resolvedFlag = flags.find((flag) => flag.id === flagId);
  const remaining = flags.filter((flag) => flag.id !== flagId);
  const history = parseFlagHistory(draft);
  const nextHistory = resolvedFlag
    ? [...history, { ...resolvedFlag, resolution, resolvedAt: new Date().toISOString() }]
    : history;
  return saveDraft({
    ...draft,
    agentNotes: {
      ...draft.agentNotes,
      flags: JSON.stringify(remaining),
      flagHistory: JSON.stringify(nextHistory),
    },
  });
}
