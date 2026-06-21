import Redis from "ioredis";
import "server-only";
import { getEnv, requireEnvValue } from "@/server/config/env";

let redis: Redis | null = null;
let resolvedRedisUrl: Promise<string> | null = null;
let unavailableUntil = 0;
const REDIS_RETRY_COOLDOWN_MS = 60_000;

type RedisCloudDatabase = {
  databaseId: number;
  status: string;
  publicEndpoint: string;
  security?: {
    password?: string;
  };
};

type RedisCloudSubscriptions = {
  subscriptions?: Array<{ id: number; status: string }>;
};

type RedisCloudDatabases = {
  subscription?: {
    databases?: RedisCloudDatabase[];
  };
};

async function redisCloudRequest<T>(path: string): Promise<T> {
  const { redis: config } = getEnv();
  const response = await fetch(`https://api.redislabs.com/v1${path}`, {
    headers: {
      accept: "application/json",
      "x-api-key": requireEnvValue(
        config.cloudAccountKey,
        "REDIS_CLOUD_ACCOUNT_KEY"
      ),
      "x-api-secret-key": requireEnvValue(
        config.cloudSecretKey,
        "REDIS_CLOUD_SECRET_KEY"
      ),
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Redis Cloud API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

async function discoverRedisUrl(): Promise<string> {
  const { redis: config } = getEnv();
  if (config.url) return config.url;

  let subscriptionId = config.cloudSubscriptionId;
  if (!subscriptionId) {
    const result = await redisCloudRequest<RedisCloudSubscriptions>(
      "/fixed/subscriptions"
    );
    subscriptionId = String(
      result.subscriptions?.find((subscription) => subscription.status === "active")
        ?.id ?? ""
    );
  }
  requireEnvValue(subscriptionId, "REDIS_CLOUD_SUBSCRIPTION_ID");

  const result = await redisCloudRequest<RedisCloudDatabases>(
    `/fixed/subscriptions/${subscriptionId}/databases`
  );
  const databases = result.subscription?.databases ?? [];
  let database = config.cloudDatabaseId
    ? databases.find(
        (candidate) => String(candidate.databaseId) === config.cloudDatabaseId
      )
    : databases.find((candidate) => candidate.status === "active");

  if (database && !database.security?.password) {
    database = await redisCloudRequest<RedisCloudDatabase>(
      `/fixed/subscriptions/${subscriptionId}/databases/${database.databaseId}`
    );
  }

  if (!database?.publicEndpoint || !database.security?.password) {
    throw new Error("No active Redis Cloud database with credentials was found");
  }

  return `redis://default:${encodeURIComponent(database.security.password)}@${database.publicEndpoint}`;
}

async function getRedisUrl(): Promise<string> {
  resolvedRedisUrl ??= discoverRedisUrl();
  return resolvedRedisUrl;
}

export function getRedisClient(): Redis {
  if (!redis) {
    throw new Error("Redis is not initialized; call connectRedis() first");
  }
  return redis;
}

export async function connectRedis(): Promise<Redis> {
  if (Date.now() < unavailableUntil) {
    throw new Error("Redis is temporarily unavailable");
  }
  if (!redis) {
    redis = new Redis(await getRedisUrl(), {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
      connectTimeout: 3_000,
      retryStrategy: () => null,
    });
    redis.on("error", (error) => {
      console.warn("[cortex-redis] Connection error", error.message);
    });
  }
  const client = redis;
  if (client.status !== "ready" && client.status !== "connecting") {
    try {
      await client.connect();
      unavailableUntil = 0;
    } catch (error) {
      unavailableUntil = Date.now() + REDIS_RETRY_COOLDOWN_MS;
      client.disconnect();
      redis = null;
      throw error;
    }
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
  patientChunks: (id: string) => `cortex:patient:${id}:chunks`,
  historyChunk: (id: string) => `cortex:chunk:${id}`,
  normativeIndex: () => "cortex:normative:index",
  normativeChunk: (id: string) => `cortex:normative:${id}`,
  encounter: (id: string) => `cortex:encounter:${id}`,
  patientEncounters: (patientId: string) => `cortex:patient:${patientId}:encounters`,
  pipelineRun: (id: string) => `cortex:pipeline:${id}`,
} as const;
