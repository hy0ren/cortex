import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { createPipelineRun } from "@/server/pipeline/pipeline-service";
import { getReportDraft } from "@/server/persistence/drafts";
import { saveDraft } from "@/server/reports/report-service";

export async function POST(request: Request) {
  try {
    const session = await requireRequestSession();
    const body = await request.json() as { patientId?: string; draftId?: string };
    if (!body.patientId || !body.draftId) {
      return fail("INVALID_REQUEST", "patientId and draftId are required");
    }
    const draft = await getReportDraft(body.draftId);
    if (!draft) return fail("NOT_FOUND", "Draft not found", 404);
    if (
      draft.clinicianId !== session.user.id ||
      draft.patientId !== body.patientId
    ) {
      return fail("FORBIDDEN", "Draft does not belong to this session", 403);
    }
    await saveDraft({ ...draft, status: "generating" });
    return ok({ run: await createPipelineRun({
      clinicianId: session.user.id,
      patientId: body.patientId,
      draftId: body.draftId,
    }) }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
