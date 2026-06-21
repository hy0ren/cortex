import { fail, ok, routeError } from "@/server/http/api-response";
import { verifyBandSyncSecret } from "@/server/pipeline/band-sync-service";
import { findPatient } from "@/server/persistence/patient-repository";
import { getReportDraft } from "@/server/persistence/drafts";
import { getPipelineRun } from "@/server/pipeline/pipeline-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyBandSyncSecret(request)) {
      return fail("UNAUTHORIZED", "Invalid band sync secret");
    }

    const { id } = await context.params;
    const run = getPipelineRun(id);
    if (!run) return fail("NOT_FOUND", "Pipeline run not found");

    const patient = await findPatient(run.patientId);
    const draft = await getReportDraft(run.draftId);
    if (!patient || !draft) return fail("NOT_FOUND", "Session context not found");

    return ok({ run, patient, draft });
  } catch (error) {
    return routeError(error, { route: "pipeline.context" });
  }
}
