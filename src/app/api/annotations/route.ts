import { randomUUID } from "crypto";
import { fail, ok, routeError } from "@/server/http/api-response";
import { verifyReviewToken } from "@/server/terac/review-token";
import { getAnnotationPacket, storeAnnotation } from "@/server/persistence/redis/annotation-store";
import type { AnnotationResult, FlagAnnotation, StageAnnotation } from "@/data/contracts";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return fail("INVALID_REQUEST", "token is required");

    const verified = verifyReviewToken(token);
    if (!verified) return fail("UNAUTHORIZED", "Invalid or expired review token", 401);

    const packet = await getAnnotationPacket(verified.pipelineRunId);
    if (!packet) return fail("NOT_FOUND", "Review packet not found", 404);

    return ok({ packet });
  } catch (error) {
    return routeError(error, { route: "annotations.get" });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      reviewerId?: string;
      stageAnnotations?: StageAnnotation[];
      flagAnnotations?: FlagAnnotation[];
      missedIssues?: string;
      goldSummary?: string;
    };

    if (!body.token) return fail("INVALID_REQUEST", "token is required");
    const verified = verifyReviewToken(body.token);
    if (!verified) return fail("UNAUTHORIZED", "Invalid or expired review token", 401);

    if (!body.reviewerId || !body.stageAnnotations || !body.flagAnnotations) {
      return fail("INVALID_REQUEST", "reviewerId, stageAnnotations, and flagAnnotations are required");
    }

    const annotation: AnnotationResult = {
      id: randomUUID(),
      pipelineRunId: verified.pipelineRunId,
      reviewerId: body.reviewerId,
      stageAnnotations: body.stageAnnotations,
      flagAnnotations: body.flagAnnotations,
      missedIssues: body.missedIssues,
      goldSummary: body.goldSummary,
      createdAt: new Date().toISOString(),
    };

    await storeAnnotation(annotation);
    return ok({ annotation }, { status: 201 });
  } catch (error) {
    return routeError(error, { route: "annotations.post" });
  }
}
