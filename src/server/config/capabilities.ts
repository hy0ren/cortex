import "server-only";
import type { RuntimeCapabilities } from "@/data/contracts";
import { isBandConfigured } from "@/server/band/room-client";
import { isTeracConfigured } from "@/server/terac/credentials";

function configured(value: string | undefined): "configured" | "demo" {
  return value && !value.includes("your-") ? "configured" : "demo";
}

export function getRuntimeCapabilities(): RuntimeCapabilities {
  const redisCloudConfigured =
    configured(process.env.REDIS_CLOUD_ACCOUNT_KEY) === "configured" &&
    configured(process.env.REDIS_CLOUD_SECRET_KEY) === "configured";

  return {
    firebase:
      configured(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) === "configured" &&
      configured(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) === "configured"
        ? "configured"
        : "demo",
    demoAuth:
      process.env.NODE_ENV !== "production" ||
      process.env.ALLOW_DEMO_AUTH === "true",
    redis:
      configured(process.env.REDIS_URL) === "configured" || redisCloudConfigured
        ? "configured"
        : "demo",
    anthropic: configured(process.env.ANTHROPIC_API_KEY),
    deepgram: configured(process.env.DEEPGRAM_API_KEY),
    arize:
      configured(process.env.ARIZE_SPACE_ID) === "configured" &&
      configured(process.env.ARIZE_API_KEY) === "configured"
        ? "configured"
        : "demo",
    sentry: configured(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN),
    band: isBandConfigured() ? "configured" : "demo",
    terac: isTeracConfigured() ? "configured" : "demo",
  };
}
