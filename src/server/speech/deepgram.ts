import { createClient, DeepgramClient } from "@deepgram/sdk";
import "server-only";
import { getEnv } from "@/server/config/env";

let client: DeepgramClient | null = null;

export function getDeepgramClient(): DeepgramClient {
  if (!client) {
    const { deepgram } = getEnv();
    client = createClient(deepgram.apiKey);
  }
  return client;
}

export type TranscribeOptions = {
  /** Raw audio buffer (WAV, MP3, WebM, etc.) */
  audio: Buffer | ArrayBuffer;
  mimetype?: string;
  /** Optional medical vocabulary boost */
  keywords?: string[];
};

export type TranscriptionResult = {
  transcript: string;
  confidence: number;
  durationSeconds: number;
  words: Array<{ word: string; start: number; end: number; confidence: number }>;
};

/**
 * Transcribe visit audio via Deepgram Nova-2 Medical.
 * Output feeds directly into Wernicke's transcript ingestion.
 */
export async function transcribeVisitAudio(
  options: TranscribeOptions
): Promise<TranscriptionResult> {
  const deepgram = getDeepgramClient();
  const buffer = Buffer.isBuffer(options.audio)
    ? options.audio
    : Buffer.from(new Uint8Array(options.audio));

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    buffer,
    {
      model: "nova-2-medical",
      smart_format: true,
      punctuate: true,
      diarize: true,
      utterances: true,
      keywords: options.keywords ?? [
        "neuropsychological:2",
        "WAIS:2",
        "WMS-IV:2",
        "Trail Making:2",
        "Boston Naming:2",
      ],
      mimetype: options.mimetype,
    }
  );

  if (error) {
    throw new Error(`Deepgram transcription failed: ${error.message}`);
  }

  const channel = result.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];
  const transcript = alternative?.transcript ?? "";
  const confidence = alternative?.confidence ?? 0;
  const words =
    alternative?.words?.map((w) => ({
      word: w.word,
      start: w.start,
      end: w.end,
      confidence: w.confidence,
    })) ?? [];

  const durationSeconds =
    result.metadata?.duration ?? words.at(-1)?.end ?? 0;

  return { transcript, confidence, durationSeconds, words };
}
