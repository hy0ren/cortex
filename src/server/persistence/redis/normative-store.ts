import "server-only";
import type { NormativeSearchResult } from "@/data/contracts";
import { NORMATIVE_CORPUS } from "@/data/fixtures/normative-corpus";
import { embedText, embedTexts } from "@/server/ai/embeddings";
import { connectRedis, RedisKeys } from "./client";
import { cosineSimilarity } from "./patient-store";

type StoredNormativeChunk = (typeof NORMATIVE_CORPUS)[number] & { embedding: number[] };

export type NormativeSearchFilters = {
  test?: string;
  domain?: string;
};

/** Seed normative corpus into Redis with embeddings. */
export async function seedNormativeCorpus(
  chunks = NORMATIVE_CORPUS
): Promise<number> {
  const redis = await connectRedis();
  const existing = await redis.smembers(RedisKeys.normativeIndex());
  if (existing.length > 0) {
    await redis.del(...existing.map((id) => RedisKeys.normativeChunk(id)));
  }
  await redis.del(RedisKeys.normativeIndex());

  const embeddings = await embedTexts(chunks.map((chunk) => chunk.text));
  const multi = redis.multi();
  for (let i = 0; i < chunks.length; i++) {
    const stored: StoredNormativeChunk = {
      ...chunks[i],
      embedding: embeddings[i] ?? [],
    };
    multi.set(RedisKeys.normativeChunk(chunks[i].id), JSON.stringify(stored));
    multi.sadd(RedisKeys.normativeIndex(), chunks[i].id);
  }
  await multi.exec();
  return chunks.length;
}

/** Semantic search over normative interpretive corpus. */
export async function searchNormativeContext(
  query: string,
  filters: NormativeSearchFilters = {},
  limit = 6
): Promise<NormativeSearchResult[]> {
  const redis = await connectRedis();
  const chunkIds = await redis.smembers(RedisKeys.normativeIndex());
  if (chunkIds.length === 0) {
    return searchNormativeInMemory(query, filters, limit);
  }

  const queryVec = await embedText(query);
  const rawChunks = await redis.mget(
    ...chunkIds.map((id) => RedisKeys.normativeChunk(id))
  );

  const results: NormativeSearchResult[] = [];
  for (const raw of rawChunks) {
    if (!raw) continue;
    const chunk = JSON.parse(raw) as StoredNormativeChunk;
    if (filters.test && chunk.test && !chunk.test.toLowerCase().includes(filters.test.toLowerCase())) {
      continue;
    }
    if (filters.domain && chunk.domain && chunk.domain !== filters.domain) {
      continue;
    }
    results.push({
      chunkId: chunk.id,
      score: cosineSimilarity(queryVec, chunk.embedding),
      snippet: chunk.text.slice(0, 280),
      source: chunk.source,
      test: chunk.test,
      domain: chunk.domain,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

function searchNormativeInMemory(
  query: string,
  filters: NormativeSearchFilters,
  limit: number
): NormativeSearchResult[] {
  const queryTokens = new Set(query.toLowerCase().split(/\W+/).filter(Boolean));
  const scored = NORMATIVE_CORPUS.filter((chunk) => {
    if (filters.test && chunk.test && !chunk.test.toLowerCase().includes(filters.test.toLowerCase())) {
      return false;
    }
    if (filters.domain && chunk.domain && chunk.domain !== filters.domain) {
      return false;
    }
    return true;
  }).map((chunk) => {
    const textTokens = chunk.text.toLowerCase().split(/\W+/);
    const overlap = textTokens.filter((token) => queryTokens.has(token)).length;
    return {
      chunkId: chunk.id,
      score: overlap / Math.max(queryTokens.size, 1),
      snippet: chunk.text.slice(0, 280),
      source: chunk.source,
      test: chunk.test,
      domain: chunk.domain,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function clearNormativeStore(): Promise<void> {
  const redis = await connectRedis();
  const ids = await redis.smembers(RedisKeys.normativeIndex());
  if (ids.length > 0) {
    await redis.del(...ids.map((id) => RedisKeys.normativeChunk(id)));
  }
  await redis.del(RedisKeys.normativeIndex());
}

export async function countNormativeChunks(): Promise<number> {
  const redis = await connectRedis();
  return redis.scard(RedisKeys.normativeIndex());
}
