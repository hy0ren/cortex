import "server-only";
import type { AnnotationPacket, GliaFlag } from "@/data/contracts";
import { parseAgentJson } from "@/server/pipeline/agent-steps";
import { getPipelineRun } from "@/server/pipeline/pipeline-service";
import { getReportDraft } from "@/server/persistence/drafts";
import { findPatient } from "@/server/persistence/patient-repository";
import { getEncounter } from "@/server/persistence/redis/encounter-store";
import { storeAnnotationPacket } from "@/server/persistence/redis/annotation-store";

export async function buildAnnotationPacket(pipelineRunId: string): Promise<AnnotationPacket> {
  const run = await getPipelineRun(pipelineRunId);
  if (!run) throw new Error(`Pipeline run not found: ${pipelineRunId}`);

  const [patient, encounter, draft] = await Promise.all([
    findPatient(run.patientId),
    getEncounter(run.encounterId),
    getReportDraft(run.draftId),
  ]);
  if (!patient || !encounter || !draft) {
    throw new Error(`Missing patient, encounter, or draft for run ${pipelineRunId}`);
  }

  const packet: AnnotationPacket = {
    pipelineRunId,
    patientDemographics: {
      name: patient.demographics.name,
      dateOfBirth: patient.demographics.dateOfBirth,
    },
    referralReason: encounter.referralReason,
    transcript: encounter.transcript,
    testBattery: encounter.testBattery,
    wernicke: parseAgentJson(draft.agentNotes.wernicke ?? ""),
    norm: parseAgentJson(draft.agentNotes.norm ?? ""),
    broca: draft.sections,
    gliaFlags: parseAgentJson<GliaFlag[]>(draft.agentNotes.flags ?? "") ?? [],
  };

  await storeAnnotationPacket(packet);
  return packet;
}
