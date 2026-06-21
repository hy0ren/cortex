import { NextRequest } from "next/server";
import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { getWorkspace } from "@/server/reports/report-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRequestSession();
    const patientId = request.nextUrl.searchParams.get("patientId") ?? undefined;
    const draftId = request.nextUrl.searchParams.get("draftId") ?? undefined;
    return ok({ workspace: await getWorkspace(session.user.id, patientId, draftId) });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error, { route: "workspace.get" });
  }
}
