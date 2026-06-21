import { config as loadEnv } from "dotenv";
import { resolve } from "path";

loadEnv({ path: resolve(process.cwd(), "../../.env.local") });
loadEnv({ path: resolve(process.cwd(), "../../.env") });

export type AgentName = "wernicke" | "norm" | "engram" | "broca" | "glia";

export function cortexBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function bandSyncSecret(): string {
  return process.env.BAND_SYNC_SECRET ?? "";
}

function bandAgentHandle(agent: AgentName): string {
  const prefix = process.env.BAND_AGENT_HANDLE_PREFIX;
  return prefix ? `@${prefix}/${agent}` : `@${agent}`;
}

function resolveBandAgentApiKey(agent: AgentName): string {
  const perAgent = process.env[`BAND_${agent.toUpperCase()}_API_KEY`];
  return perAgent || process.env.BAND_API_KEY || "";
}

export function getBandWorkerConfig(agent: AgentName) {
  return {
    agentId: process.env[`BAND_${agent.toUpperCase()}_AGENT_ID`] ?? "",
    apiKey: resolveBandAgentApiKey(agent),
    wsUrl: process.env.THENVOI_WS_URL ?? "wss://app.band.ai/api/v1/socket/websocket",
    restUrl: process.env.THENVOI_REST_URL ?? "https://app.band.ai/api/v1/agent",
  };
}

export async function fetchPipelineContext(runId: string) {
  const response = await fetch(`${cortexBaseUrl()}/api/pipeline/${runId}/context`, {
    headers: { "x-band-sync-secret": bandSyncSecret() },
  });
  if (!response.ok) {
    throw new Error(`Context fetch failed (${response.status})`);
  }
  const payload = (await response.json()) as {
    data?: { run?: { id: string; bandRoomId?: string } };
  };
  return payload.data;
}

export async function executeAgentOnCortex(runId: string, agent: AgentName) {
  const response = await fetch(`${cortexBaseUrl()}/api/pipeline/${runId}/agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-band-sync-secret": bandSyncSecret(),
    },
    body: JSON.stringify({ agent }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agent execute failed (${response.status}): ${text.slice(0, 200)}`);
  }
  return response.json();
}

export function extractRunId(content: string): string | null {
  const match = content.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return match?.[0] ?? null;
}

export function mentionsAgent(content: string, agent: AgentName): boolean {
  const lower = content.toLowerCase();
  const handle = bandAgentHandle(agent).toLowerCase();
  return lower.includes(handle) || lower.includes(`@${agent}`);
}
