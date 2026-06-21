import { fail, ok, routeError } from "@/server/http/api-response";
import { verifyBandSyncSecret } from "@/server/pipeline/band-sync-service";
import { findPatient } from "@/server/persistence/patient-repository";
import { getReportDraft } from "@/server/persistence/drafts";
import { getPipelineRun } from "@/server/pipeline/pipeline-service";

import { NextRequest } from "next/server";
import { requireRequestSession } from "@/server/auth/request-session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const calledByBand = verifyBandSyncSecret(request);
    const session = calledByBand ? null : await requireRequestSession();
    const { id } = await params;
    const run = await getPipelineRun(id);
    if (!run) return fail("NOT_FOUND", "Pipeline run not found", 404);
    if (session && run.clinicianId !== session.user.id) {
      return fail("FORBIDDEN", "Pipeline run does not belong to this session", 403);
    }

    const patient = await findPatient(run.patientId);
    const draft = await getReportDraft(run.draftId);
    if (!patient || !draft) return fail("NOT_FOUND", "Session context not found");

    return ok({ run, patient, draft });
  } catch (error) {
    return routeError(error, { route: "pipeline.context" });
  }
}
