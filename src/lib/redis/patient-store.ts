import type { PatientRecord, VectorSearchResult } from "@/types";
import { connectRedis, RedisKeys } from "./client";

/** Cosine similarity between two equal-length vectors. */
function cosineSimilarity(a: number[], b: number[]): number {
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

/** Simple hash-based embedding for fixture/demo vector search (no external model). */
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

function patientToSearchText(patient: PatientRecord): string {
  return [
    patient.demographics.name,
    patient.demographics.referralReason,
    patient.history.medical.join(" "),
    patient.history.psychiatric.join(" "),
    patient.visitTranscript,
    patient.priorReports.map((r) => r.summary).join(" "),
  ].join("\n");
}

/** Persist a synthetic patient record to Redis (history lane — never Firestore). */
export async function storePatient(patient: PatientRecord): Promise<void> {
  const redis = await connectRedis();
  const key = RedisKeys.patient(patient.id);

  await redis
    .multi()
    .set(key, JSON.stringify(patient))
    .sadd(RedisKeys.patientIndex(), patient.id)
    .set(
      RedisKeys.patientEmbedding(patient.id),
      JSON.stringify(embedPatientText(patientToSearchText(patient)))
    )
    .exec();
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

/** Vector similarity search over patient history snippets. */
export async function searchPatientHistory(
  query: string,
  limit = 5
): Promise<VectorSearchResult[]> {
  const redis = await connectRedis();
  const queryVec = embedPatientText(query);
  const ids = await listPatientIds();

  const results: VectorSearchResult[] = [];

  for (const patientId of ids) {
    const [patientRaw, embeddingRaw] = await redis.mget(
      RedisKeys.patient(patientId),
      RedisKeys.patientEmbedding(patientId)
    );
    if (!patientRaw || !embeddingRaw) continue;

    const patient = JSON.parse(patientRaw) as PatientRecord;
    const embedding = JSON.parse(embeddingRaw) as number[];
    const score = cosineSimilarity(queryVec, embedding);

    results.push({
      patientId,
      score,
      snippet: [
        patient.demographics.name,
        patient.demographics.referralReason,
        patient.priorReports[0]?.summary ?? "",
      ]
        .filter(Boolean)
        .join(" — "),
    });
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
  ]);
  if (keys.length > 0) await redis.del(...keys);
  await redis.del(RedisKeys.patientIndex());
}
