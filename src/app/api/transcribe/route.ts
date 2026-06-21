import { requireRequestSession } from "@/server/auth/request-session";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { fail, ok, routeError } from "@/server/http/api-response";
import { transcribeVisitAudio } from "@/server/speech/deepgram";
import { DEMO_ACTIVE_PATIENT } from "@/data/demo/workspace";

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

    if (getRuntimeCapabilities().deepgram === "demo") {
      return ok({
        result: {
          transcript: DEMO_ACTIVE_PATIENT.visitTranscript,
          confidence: 0.98,
          durationSeconds: 42,
          words: [],
        },
        mode: "demo",
      });
    }

    const result = await transcribeVisitAudio({
      audio: await file.arrayBuffer(),
      mimetype: file.type,
    });
    return ok({ result, mode: "configured" });
  } catch (error) {
    return routeError(error, { route: "transcribe.create" });
  }
}
