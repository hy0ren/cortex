import "server-only";

export type EmbeddingProvider = "voyage" | "openai" | "hash";

const DEFAULT_DIMS = 64;

function getProvider(): EmbeddingProvider {
  const raw = (process.env.EMBEDDING_PROVIDER ?? "hash").toLowerCase();
  if (raw === "voyage" || raw === "openai" || raw === "hash") return raw;
  return "hash";
}

function getDims(): number {
  const parsed = Number(process.env.EMBEDDING_DIMS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DIMS;
}

/** Hash-based embedding fallback (no external API). */
export function embedTextHash(text: string, dims = getDims()): number[] {
  const vec = new Array<number>(dims).fill(0);
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    vec[hash % dims] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? vec : vec.map((v) => v / norm);
}

async function embedViaVoyage(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey || apiKey.includes("your-")) {
    throw new Error("VOYAGE_API_KEY required for voyage embeddings");
  }
  const model = process.env.EMBEDDING_MODEL ?? "voyage-3-lite";
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: texts, model }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Voyage embedding failed (${response.status})`);
  }
  const data = (await response.json()) as {
    data?: Array<{ embedding: number[] }>;
  };
  return (data.data ?? []).map((row) => row.embedding);
}

async function embedViaOpenAI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes("your-")) {
    throw new Error("OPENAI_API_KEY required for openai embeddings");
  }
  const model = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: texts, model }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`OpenAI embedding failed (${response.status})`);
  }
  const data = (await response.json()) as {
    data?: Array<{ embedding: number[] }>;
  };
  return (data.data ?? []).map((row) => row.embedding);
}

/** Embed a single text string. Falls back to hash on provider failure. */
export async function embedText(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}

/** Embed multiple texts in one batch. Falls back to hash on provider failure. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const provider = getProvider();
  if (provider === "hash") {
    return texts.map((text) => embedTextHash(text));
  }

  try {
    if (provider === "voyage") return await embedViaVoyage(texts);
    if (provider === "openai") return await embedViaOpenAI(texts);
  } catch (error) {
    console.warn("[cortex-embeddings] Provider failed; using hash fallback", error);
  }

  return texts.map((text) => embedTextHash(text));
}

export function getEmbeddingProvider(): EmbeddingProvider {
  return getProvider();
}
