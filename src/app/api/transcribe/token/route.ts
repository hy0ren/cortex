import { requireRequestSession } from "@/server/auth/request-session";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { fail, ok, routeError } from "@/server/http/api-response";
import { getDeepgramClient } from "@/server/speech/deepgram";
import { getEnv } from "@/server/config/env";

export async function GET() {
  try {
    await requireRequestSession();

    if (getRuntimeCapabilities().deepgram === "demo") {
      return fail("NOT_CONFIGURED", "Deepgram is not configured");
    }

    const deepgram = getDeepgramClient();
    
    // Attempt to generate a temporary project key
    try {
      const { result: projectsResult, error: projectsError } = await deepgram.manage.getProjects();
      if (projectsError) throw projectsError;
      
      const projectId = projectsResult?.projects?.[0]?.project_id;
      if (projectId) {
        const { result: keyResult, error: keyError } = await deepgram.manage.createProjectKey(projectId, {
          comment: "temp_browser_token",
          scopes: ["usage:write"],
          time_to_live_in_seconds: 3600, // 1 hour
        });
        
        if (keyResult?.key) {
          return ok({ token: keyResult.key });
        }
      }
    } catch (err) {
      console.warn("[cortex-deepgram] Failed to generate temp key, falling back to main key:", err instanceof Error ? err.message : err);
    }
    
    // Fallback to main key for local development if the API key lacks management scopes
    const { deepgram: config } = getEnv();
    if (config.apiKey) {
      return ok({ token: config.apiKey });
    }

    return fail("INTERNAL_ERROR", "Failed to retrieve Deepgram token");
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error, { route: "transcribe.token" });
  }
}
