import { NextRequest } from "next/server";
import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import {
  advancePipeline,
  getPipelineRun,
  setPipelinePhase,
} from "@/server/pipeline/pipeline-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRequestSession();
    const { id } = await params;
    const run = await getPipelineRun(id);
    if (!run) return fail("NOT_FOUND", "Pipeline run not found", 404);
    if (run.clinicianId !== session.user.id) {
      return fail("FORBIDDEN", "Pipeline run does not belong to this session", 403);
    }
    return ok({ run });
  } catch (error) {
    return routeError(error, { route: "pipeline.get" });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRequestSession();
    const { id } = await params;
    const run = await getPipelineRun(id);
    if (!run) return fail("NOT_FOUND", "Pipeline run not found", 404);
    if (run.clinicianId !== session.user.id) {
      return fail("FORBIDDEN", "Pipeline run does not belong to this session", 403);
    }
    const body = await request.json() as {
      action?: "advance" | "pause" | "resume";
    };
    if (body.action === "advance") return ok({ run: await advancePipeline(id) });
    if (body.action === "pause") return ok({ run: await setPipelinePhase(id, "paused") });
    if (body.action === "resume") return ok({ run: await setPipelinePhase(id, "running") });
    return fail("INVALID_REQUEST", "Unsupported pipeline action");
  } catch (error) {
    return routeError(error, { route: "pipeline.patch" });
  }
}
