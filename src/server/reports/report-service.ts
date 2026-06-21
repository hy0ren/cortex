import "server-only";
import type { GliaFlag, ReportDraft, ReportWorkspace } from "@/data/contracts";
import { createDemoDraft, getDemoFlags } from "@/data/demo/workspace";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { findPatient } from "@/server/persistence/patient-repository";
import { getReportDraft, upsertReportDraft } from "@/server/persistence/drafts";
import { getMemoryStore } from "@/server/persistence/memory-store";

export async function getWorkspace(
  clinicianId: string,
  patientId = "pat-demo-hayes",
  draftId?: string
): Promise<ReportWorkspace> {
  const patient = await findPatient(patientId);
  if (!patient) throw new Error("Patient not found");

  const resolvedDraftId =
    draftId ?? `draft-${patientId}-${clinicianId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
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
  const pipeline = [...getMemoryStore().pipelines.values()]
    .find(
      (run) =>
        run.draftId === draft.id && run.clinicianId === clinicianId
    ) ?? null;

  return {
    patient,
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

export async function resolveDraftFlag(
  id: string,
  flagId: string
): Promise<ReportDraft> {
  const draft = await getReportDraft(id);
  if (!draft) throw new Error("Draft not found");
  const remaining = parseFlags(draft).filter((flag) => flag.id !== flagId);
  return saveDraft({
    ...draft,
    agentNotes: { ...draft.agentNotes, flags: JSON.stringify(remaining) },
  });
}
