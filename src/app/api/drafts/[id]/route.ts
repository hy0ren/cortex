import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { getReportDraft } from "@/server/persistence/drafts";
import {
  resolveDraftFlag,
  saveDraft,
  updateDraftStatus,
} from "@/server/reports/report-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRequestSession();
    const { id } = await context.params;
    const draft = await getReportDraft(id);
    if (!draft) return fail("NOT_FOUND", "Draft not found", 404);
    return ok({ draft });
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRequestSession();
    const { id } = await context.params;
    const body = await request.json() as {
      status?: "idle" | "generating" | "review" | "finalized";
      flagId?: string;
      sections?: Record<string, string>;
    };

    if (body.flagId) {
      return ok({ draft: await resolveDraftFlag(id, body.flagId) });
    }
    if (body.status) {
      return ok({ draft: await updateDraftStatus(id, body.status) });
    }
    if (body.sections) {
      const existing = await getReportDraft(id);
      if (!existing) return fail("NOT_FOUND", "Draft not found", 404);
      return ok({ draft: await saveDraft({ ...existing, sections: body.sections }) });
    }
    return fail("INVALID_REQUEST", "No supported draft update supplied");
  } catch (error) {
    return routeError(error);
  }
}
