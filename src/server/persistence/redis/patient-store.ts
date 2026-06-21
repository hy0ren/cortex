import "server-only";
import type { HistoryChunk, PatientRecord, VectorSearchResult } from "@/data/contracts";
import { embedText, embedTexts } from "@/server/ai/embeddings";
import { connectRedis, RedisKeys } from "./client";

type StoredHistoryChunk = HistoryChunk & { embedding: number[] };

/** Cosine similarity between two equal-length vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/** @deprecated Use embedText from embeddings service. */
export function embedPatientText(text: string, dims = 64): number[] {
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

function buildPatientChunks(patient: PatientRecord): HistoryChunk[] {
  const chunks: HistoryChunk[] = [];

  patient.visitTranscript
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((text, index) => {
      chunks.push({
        id: `${patient.id}-transcript-${index}`,
        patientId: patient.id,
        source: "transcript",
        text,
      });
    });

  patient.priorReports.forEach((report, index) => {
    chunks.push({
      id: `${patient.id}-report-${index}`,
      patientId: patient.id,
      source: "priorReport",
      date: report.date,
      text: `${report.type}: ${report.summary}`,
    });
  });

  patient.history.priorEvaluations.forEach((evaluation, index) => {
    chunks.push({
      id: `${patient.id}-eval-${index}`,
      patientId: patient.id,
      source: "priorEvaluation",
      date: evaluation.date,
      text: `${evaluation.setting}: ${evaluation.summary}`,
    });
  });

  return chunks;
}

async function indexPatientChunks(patient: PatientRecord): Promise<void> {
  const redis = await connectRedis();
  const chunks = buildPatientChunks(patient);
  const existing = await redis.smembers(RedisKeys.patientChunks(patient.id));
  if (existing.length > 0) {
    await redis.del(...existing.map((id) => RedisKeys.historyChunk(id)));
  }
  await redis.del(RedisKeys.patientChunks(patient.id));

  if (chunks.length === 0) return;

  const embeddings = await embedTexts(chunks.map((chunk) => chunk.text));
  const multi = redis.multi();
  for (let i = 0; i < chunks.length; i++) {
    const stored: StoredHistoryChunk = { ...chunks[i], embedding: embeddings[i] ?? [] };
    multi.set(RedisKeys.historyChunk(chunks[i].id), JSON.stringify(stored));
    multi.sadd(RedisKeys.patientChunks(patient.id), chunks[i].id);
  }
  await multi.exec();
}

/** Persist a synthetic patient record to Redis (history lane — never Firestore). */
export async function storePatient(patient: PatientRecord): Promise<void> {
  const redis = await connectRedis();
  const summaryText = [
    patient.demographics.name,
    patient.demographics.referralReason,
    patient.visitTranscript,
  ].join("\n");
  const summaryEmbedding = await embedText(summaryText);

  await redis
    .multi()
    .set(RedisKeys.patient(patient.id), JSON.stringify(patient))
    .sadd(RedisKeys.patientIndex(), patient.id)
    .set(RedisKeys.patientEmbedding(patient.id), JSON.stringify(summaryEmbedding))
    .exec();

  await indexPatientChunks(patient);
}

/** Retrieve a patient record by ID. */
export async function getPatient(id: string): Promise<PatientRecord | null> {
  const redis = await connectRedis();
  const raw = await redis.get(RedisKeys.patient(id));
  if (!raw) return null;
  return JSON.parse(raw) as PatientRecord;
}

/** List all patient IDs in the index. */
export async function listPatientIds(): Promise<string[]> {
  const redis = await connectRedis();
  return redis.smembers(RedisKeys.patientIndex());
}

/** Vector similarity search over patient history chunks (same-patient when patientId provided). */
export async function searchPatientHistory(
  query: string,
  limit = 5,
  patientId?: string
): Promise<VectorSearchResult[]> {
  const redis = await connectRedis();
  const queryVec = await embedText(query);
  const patientIds = patientId ? [patientId] : await listPatientIds();
  const results: VectorSearchResult[] = [];

  for (const id of patientIds) {
    const chunkIds = await redis.smembers(RedisKeys.patientChunks(id));
    if (chunkIds.length === 0) {
      const patientRaw = await redis.get(RedisKeys.patient(id));
      if (!patientRaw) continue;
      const patient = JSON.parse(patientRaw) as PatientRecord;
      const embeddingRaw = await redis.get(RedisKeys.patientEmbedding(id));
      if (!embeddingRaw) continue;
      const embedding = JSON.parse(embeddingRaw) as number[];
      results.push({
        chunkId: `${id}-summary`,
        patientId: id,
        score: cosineSimilarity(queryVec, embedding),
        snippet: [
          patient.demographics.referralReason,
          patient.priorReports[0]?.summary ?? "",
        ]
          .filter(Boolean)
          .join(" — "),
        source: "priorReport",
      });
      continue;
    }

    const rawChunks = await redis.mget(...chunkIds.map((chunkId) => RedisKeys.historyChunk(chunkId)));
    for (const raw of rawChunks) {
      if (!raw) continue;
      const chunk = JSON.parse(raw) as StoredHistoryChunk;
      results.push({
        chunkId: chunk.id,
        patientId: chunk.patientId,
        score: cosineSimilarity(queryVec, chunk.embedding),
        snippet: chunk.text.slice(0, 240),
        source: chunk.source,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Bulk seed from fixtures. */
export async function seedPatients(patients: PatientRecord[]): Promise<number> {
  for (const patient of patients) {
    await storePatient(patient);
  }
  return patients.length;
}

/** Clear all Cortex patient keys (dev/test only). */
export async function clearPatientStore(): Promise<void> {
  const redis = await connectRedis();
  const ids = await listPatientIds();
  const keys = ids.flatMap((id) => [
    RedisKeys.patient(id),
    RedisKeys.patientEmbedding(id),
    RedisKeys.patientChunks(id),
  ]);
  for (const id of ids) {
    const chunkIds = await redis.smembers(RedisKeys.patientChunks(id));
    keys.push(...chunkIds.map((chunkId) => RedisKeys.historyChunk(chunkId)));
  }
  if (keys.length > 0) await redis.del(...keys);
  await redis.del(RedisKeys.patientIndex());
}
