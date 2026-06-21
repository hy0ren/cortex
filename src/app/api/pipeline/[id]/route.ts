import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import {
  advancePipeline,
  getPipelineRun,
  setPipelinePhase,
} from "@/server/pipeline/pipeline-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRequestSession();
    const { id } = await context.params;
    const run = getPipelineRun(id);
    if (!run) return fail("NOT_FOUND", "Pipeline run not found", 404);
    return ok({ run });
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
      action?: "advance" | "pause" | "resume";
    };
    if (body.action === "advance") return ok({ run: await advancePipeline(id) });
    if (body.action === "pause") return ok({ run: setPipelinePhase(id, "paused") });
    if (body.action === "resume") return ok({ run: setPipelinePhase(id, "running") });
    return fail("INVALID_REQUEST", "Unsupported pipeline action");
  } catch (error) {
    return routeError(error);
  }
}
