import { requireRequestSession } from "@/server/auth/request-session";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { fail, ok, routeError } from "@/server/http/api-response";
import { getDeepgramClient } from "@/server/speech/deepgram";

export async function GET() {
  try {
    await requireRequestSession();

    if (getRuntimeCapabilities().deepgram === "demo") {
      return fail("NOT_CONFIGURED", "Deepgram is not configured");
    }

    const deepgram = getDeepgramClient();
    
    try {
      const { result: projectsResult, error: projectsError } = await deepgram.manage.getProjects();
      if (projectsError) throw projectsError;
      
      const projectId = projectsResult?.projects?.[0]?.project_id;
      if (projectId) {
        const { result: keyResult, error: keyError } = await deepgram.manage.createProjectKey(projectId, {
          comment: "cortex-live-transcription",
          scopes: ["usage:write"],
          time_to_live_in_seconds: 300,
        });
        if (keyError) throw keyError;
        if (keyResult?.key) {
          return ok({ token: keyResult.key });
        }
      }
    } catch (err) {
      console.warn(
        "[cortex-deepgram] Failed to generate a temporary browser key:",
        err instanceof Error ? err.message : err
      );
    }

    return fail(
      "TEMPORARY_TOKEN_UNAVAILABLE",
      "Live transcription is unavailable because a temporary Deepgram key could not be created",
      503
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error, { route: "transcribe.token" });
  }
}
