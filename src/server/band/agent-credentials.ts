import "server-only";
import { getEnv } from "@/server/config/env";

export const BAND_AGENT_NAMES = [
  "wernicke",
  "norm",
  "engram",
  "broca",
  "glia",
] as const;

export type BandAgentName = (typeof BAND_AGENT_NAMES)[number];

export function getBandAgentId(agent: BandAgentName): string {
  const { band } = getEnv();
  const map: Record<BandAgentName, string> = {
    wernicke: band.wernickeAgentId,
    norm: band.normAgentId,
    engram: band.engramAgentId,
    broca: band.brocaAgentId,
    glia: band.gliaAgentId,
  };
  return map[agent];
}

export function getBandAgentApiKey(agent: BandAgentName): string {
  const { band } = getEnv();
  const map: Record<BandAgentName, string> = {
    wernicke: band.wernickeApiKey,
    norm: band.normApiKey,
    engram: band.engramApiKey,
    broca: band.brocaApiKey,
    glia: band.gliaApiKey,
  };
  return map[agent] || band.apiKey;
}

export function getBandRestApiKey(): string {
  return getBandAgentApiKey("wernicke") || getEnv().band.apiKey;
}

export function bandAgentHandle(agent: string): string {
  const { band } = getEnv();
  return band.agentHandlePrefix ? `@${band.agentHandlePrefix}/${agent}` : `@${agent}`;
}

export function isConfiguredBandValue(value: string): boolean {
  return Boolean(value && !value.includes("your-"));
}

export function isBandFullyConfigured(): boolean {
  const { band } = getEnv();
  const ids = BAND_AGENT_NAMES.map(getBandAgentId);
  const keys = BAND_AGENT_NAMES.map(getBandAgentApiKey);
  return (
    ids.every(isConfiguredBandValue) &&
    keys.every(isConfiguredBandValue) &&
    isConfiguredBandValue(band.syncSecret)
  );
}
