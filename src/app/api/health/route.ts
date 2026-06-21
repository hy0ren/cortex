import { fail, ok } from "@/server/http/api-response";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { connectRedis } from "@/server/persistence/redis/client";

export async function GET() {
  const capabilities = getRuntimeCapabilities();
  if (process.env.NODE_ENV === "production") {
    if (capabilities.redis !== "configured") {
      return fail("NOT_READY", "Redis is required in production", 503);
    }
    try {
      const redis = await connectRedis();
      await redis.ping();
    } catch (error) {
      console.error("[cortex-health] Redis readiness check failed", error);
      return fail("NOT_READY", "Redis is unavailable", 503);
    }
  }

  return ok({
    status: "ready",
    capabilities,
    timestamp: new Date().toISOString(),
  });
}
