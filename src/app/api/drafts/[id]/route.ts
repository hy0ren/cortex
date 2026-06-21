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
    const session = await requireRequestSession();
    const { id } = await context.params;
    const draft = await getReportDraft(id);
    if (!draft) return fail("NOT_FOUND", "Draft not found", 404);
    if (draft.clinicianId !== session.user.id) {
      return fail("FORBIDDEN", "Draft does not belong to this session", 403);
    }
    return ok({ draft });
  } catch (error) {
    return routeError(error, { route: "drafts.get" });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRequestSession();
    const { id } = await context.params;
    const existing = await getReportDraft(id);
    if (!existing) return fail("NOT_FOUND", "Draft not found", 404);
    if (existing.clinicianId !== session.user.id) {
      return fail("FORBIDDEN", "Draft does not belong to this session", 403);
    }
    const body = await request.json() as {
      status?: "idle" | "generating" | "review" | "finalized";
      flagId?: string;
      flagResolution?: "confirmed" | "dismissed";
      sections?: Record<string, string>;
    };

    if (body.flagId) {
      return ok({ draft: await resolveDraftFlag(id, body.flagId, body.flagResolution ?? "dismissed") });
    }
    if (body.status) {
      return ok({ draft: await updateDraftStatus(id, body.status) });
    }
    if (body.sections) {
      return ok({ draft: await saveDraft({ ...existing, sections: body.sections }) });
    }
    return fail("INVALID_REQUEST", "No supported draft update supplied");
  } catch (error) {
    return routeError(error, { route: "drafts.patch" });
  }
}
