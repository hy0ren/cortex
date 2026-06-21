import { requireRequestSession } from "@/server/auth/request-session";
import { fail, routeError } from "@/server/http/api-response";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getDeepgramClient } from "@/server/speech/deepgram";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await requireRequestSession();
    const body = await request.json() as { text?: string };
    const text = body.text?.trim();
    if (!text) return fail("INVALID_REQUEST", "text is required");

    if (getRuntimeCapabilities().deepgram !== "configured") {
      return fail("NOT_CONFIGURED", "Text-to-speech is not configured", 503);
    }

    const deepgram = getDeepgramClient();
    const response = await deepgram.speak.request(
      { text },
      { model: "aura-2-en-us" }
    );
    const stream = await response.getStream();
    if (!stream) {
      return fail("TTS_FAILED", "Deepgram returned no audio stream");
    }

    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const audio = Buffer.concat(chunks.map((c) => Buffer.from(c)));

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return routeError(error, { route: "speak.create" });
  }
}
