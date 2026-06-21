import "server-only";
import type { AnnotationPacket, AnnotationResult } from "@/data/contracts";
import { connectRedis, RedisKeys } from "./client";

export async function storeAnnotationPacket(packet: AnnotationPacket): Promise<void> {
  const redis = await connectRedis();
  await redis.set(RedisKeys.annotationPacket(packet.pipelineRunId), JSON.stringify(packet));
}

export async function getAnnotationPacket(runId: string): Promise<AnnotationPacket | null> {
  const redis = await connectRedis();
  const raw = await redis.get(RedisKeys.annotationPacket(runId));
  return raw ? (JSON.parse(raw) as AnnotationPacket) : null;
}

export async function storeAnnotation(result: AnnotationResult): Promise<void> {
  const redis = await connectRedis();
  await redis
    .multi()
    .set(RedisKeys.annotation(result.id), JSON.stringify(result))
    .sadd(RedisKeys.pipelineAnnotations(result.pipelineRunId), result.id)
    .sadd(RedisKeys.annotationIndex(), result.id)
    .exec();
}

export async function getAnnotationsForRun(runId: string): Promise<AnnotationResult[]> {
  const redis = await connectRedis();
  const ids = await redis.smembers(RedisKeys.pipelineAnnotations(runId));
  if (ids.length === 0) return [];
  const raw = await redis.mget(...ids.map((id) => RedisKeys.annotation(id)));
  return raw.filter((value): value is string => Boolean(value)).map((value) => JSON.parse(value) as AnnotationResult);
}

export async function listAllAnnotations(): Promise<AnnotationResult[]> {
  const redis = await connectRedis();
  const ids = await redis.smembers(RedisKeys.annotationIndex());
  if (ids.length === 0) return [];
  const raw = await redis.mget(...ids.map((id) => RedisKeys.annotation(id)));
  return raw.filter((value): value is string => Boolean(value)).map((value) => JSON.parse(value) as AnnotationResult);
}
