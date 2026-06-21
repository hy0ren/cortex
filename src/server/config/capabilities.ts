import "server-only";
import type { RuntimeCapabilities } from "@/data/contracts";

function configured(value: string | undefined): "configured" | "demo" {
  return value && !value.includes("your-") ? "configured" : "demo";
}

export function getRuntimeCapabilities(): RuntimeCapabilities {
  return {
    firebase:
      configured(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) === "configured" &&
      configured(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) === "configured"
        ? "configured"
        : "demo",
    redis: configured(process.env.REDIS_URL),
    anthropic: configured(process.env.ANTHROPIC_API_KEY),
    deepgram: configured(process.env.DEEPGRAM_API_KEY),
  };
}
