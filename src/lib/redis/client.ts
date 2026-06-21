import Redis from "ioredis";

let redis: Redis | null = null;

function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "redis://localhost:6379";
}

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}

export async function connectRedis(): Promise<Redis> {
  const client = getRedisClient();
  if (client.status !== "ready" && client.status !== "connecting") {
    await client.connect();
  }
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

/** Key namespace helpers — keeps patient history isolated from other data. */
export const RedisKeys = {
  patient: (id: string) => `cortex:patient:${id}`,
  patientIndex: () => "cortex:patients:index",
  patientEmbedding: (id: string) => `cortex:patient:${id}:embedding`,
  patientSearchIndex: () => "cortex:patients:search",
} as const;
