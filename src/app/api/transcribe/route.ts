import { requireRequestSession } from "@/server/auth/request-session";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { fail, ok, routeError } from "@/server/http/api-response";
import { transcribeVisitAudio } from "@/server/speech/deepgram";
import { DEMO_ACTIVE_ENCOUNTER } from "@/data/demo/workspace";
import { getEncounter, storeEncounter } from "@/server/persistence/redis/encounter-store";
export async function POST(request: Request) {
  try {
    await requireRequestSession();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("INVALID_FILE", "An audio file is required");
    if (file.size > 25 * 1024 * 1024) {
      return fail("FILE_TOO_LARGE", "Audio files must be 25MB or smaller");
    }
    if (
      !file.type.startsWith("audio/") &&
      !/\.(wav|mp3|m4a|webm|ogg|flac)$/i.test(file.name)
    ) {
      return fail("INVALID_FILE", "A supported audio file is required");
    }

    const encounterId = form.get("encounterId");
    let encounter = null;
    if (typeof encounterId === "string") {
      encounter = await getEncounter(encounterId);
    }

    if (getRuntimeCapabilities().deepgram === "demo") {
      const demoResult = {
        result: {
          transcript: DEMO_ACTIVE_ENCOUNTER.transcript,
          confidence: 0.98,
          durationSeconds: 42,
          words: [],
        },
        mode: "demo",
      };
      if (encounter) {
        encounter.transcript = demoResult.result.transcript;
        await storeEncounter(encounter);
      }
      return ok(demoResult);
    }

    const result = await transcribeVisitAudio({
      audio: await file.arrayBuffer(),
      mimetype: file.type,
    });

    if (encounter && result.transcript) {
      encounter.transcript = result.transcript;
      await storeEncounter(encounter);
    }

    return ok({ result, mode: "configured" });
  } catch (error) {
    return routeError(error, { route: "transcribe.create" });
  }
}
