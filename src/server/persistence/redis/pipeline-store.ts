import "server-only";
import type { PipelineRun } from "@/data/contracts";
import { connectRedis, RedisKeys } from "./client";

/** Save a pipeline run. */
export async function storePipelineRun(run: PipelineRun): Promise<void> {
  const redis = await connectRedis();
  await redis.set(RedisKeys.pipelineRun(run.id), JSON.stringify(run));
}

/** Retrieve a pipeline run by ID. */
export async function getPipelineRunFromRedis(id: string): Promise<PipelineRun | null> {
  const redis = await connectRedis();
  const raw = await redis.get(RedisKeys.pipelineRun(id));
  if (!raw) return null;
  return JSON.parse(raw) as PipelineRun;
}

/** 
 * Atomically lock a pipeline run to prevent overlapping execution.
 * Returns true if the lock was acquired, false if it was already locked.
 */
export async function acquirePipelineLock(id: string, ttlSeconds: number = 60): Promise<boolean> {
  const redis = await connectRedis();
  const lockKey = `cortex:lock:pipeline:${id}`;
  const result = await redis.set(lockKey, "1", "EX", ttlSeconds, "NX");
  return result === "OK";
}

/** Release the pipeline lock. */
export async function releasePipelineLock(id: string): Promise<void> {
  const redis = await connectRedis();
  const lockKey = `cortex:lock:pipeline:${id}`;
  await redis.del(lockKey);
}
