import { ok } from "@/server/http/api-response";
import { getRuntimeCapabilities } from "@/server/config/capabilities";

export async function GET() {
  return ok({
    status: "ready",
    capabilities: getRuntimeCapabilities(),
    timestamp: new Date().toISOString(),
  });
}
