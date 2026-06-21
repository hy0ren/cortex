import "server-only";
import { getEnv, requireEnvValue } from "@/server/config/env";
import type { PatientRecord } from "@/data/contracts";
import {
  BAND_AGENT_NAMES,
  bandAgentHandle,
  getBandAgentId,
  getBandRestApiKey,
  isBandFullyConfigured,
  type BandAgentName,
} from "@/server/band/agent-credentials";

type BandRoom = {
  id: string;
  name: string;
};

function bandHeaders(apiKey = getBandRestApiKey()): HeadersInit {
  return {
    "X-API-Key": requireEnvValue(apiKey, "BAND_WERNICKE_API_KEY"),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function bandRestBase(): string {
  const { band } = getEnv();
  return band.restUrl.replace(/\/$/, "");
}

export function isBandConfigured(): boolean {
  return isBandFullyConfigured();
}

function mentionPayload(agent: BandAgentName) {
  const handle = bandAgentHandle(agent).slice(1);
  return {
    id: getBandAgentId(agent),
    name: agent,
    handle,
  };
}

async function addBandParticipant(roomId: string, agent: BandAgentName): Promise<void> {
  const response = await fetch(`${bandRestBase()}/chats/${roomId}/participants`, {
    method: "POST",
    headers: bandHeaders(),
    body: JSON.stringify({
      participant: {
        agent_id: getBandAgentId(agent),
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok && response.status !== 409) {
    const body = await response.text();
    console.warn(
      `[cortex-band] add participant ${agent} failed (${response.status}): ${body.slice(0, 200)}`
    );
  }
}

export async function createReportRoom(input: {
  sessionId: string;
  patientId: string;
  draftId: string;
}): Promise<BandRoom> {
  const response = await fetch(`${bandRestBase()}/chats`, {
    method: "POST",
    headers: bandHeaders(),
    body: JSON.stringify({
      chat: {
        metadata: input,
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Band room create failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    id?: string;
    chat?: { id?: string; title?: string };
    chatroom_id?: string;
    name?: string;
  };
  const id = data.id ?? data.chat?.id ?? data.chatroom_id;
  if (!id) throw new Error("Band room create returned no id");

  for (const agent of BAND_AGENT_NAMES) {
    if (agent === "wernicke") continue;
    await addBandParticipant(id, agent);
  }

  return { id, name: data.chat?.title ?? data.name ?? "Cortex report room" };
}

export async function postBandMessage(input: {
  roomId: string;
  body: string;
  mentionAgents?: BandAgentName[];
}): Promise<void> {
  const mentions = (input.mentionAgents ?? []).map((agent) => mentionPayload(agent));
  const response = await fetch(`${bandRestBase()}/chats/${input.roomId}/messages`, {
    method: "POST",
    headers: bandHeaders(),
    body: JSON.stringify({
      message: {
        content: input.body,
        mentions,
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Band message failed (${response.status}): ${text.slice(0, 200)}`);
  }
}

export async function kickoffBandPipeline(input: {
  roomId: string;
  runId: string;
  patient: PatientRecord;
  draftId: string;
}): Promise<void> {
  await postBandMessage({
    roomId: input.roomId,
    body: [
      `Cortex pipeline ${input.runId} started for ${input.patient.demographics.name}.`,
      `Patient ID: ${input.patient.id}`,
      `Draft: ${input.draftId}`,
      `${bandAgentHandle("wernicke")} ingest transcript and patient record, then hand off to Norm.`,
    ].join("\n"),
    mentionAgents: ["wernicke"],
  });
}

export function nextBandAgentId(agent: string): string | null {
  const map: Record<string, BandAgentName> = {
    wernicke: "norm",
    norm: "engram",
    engram: "broca",
    broca: "glia",
  };
  const next = map[agent];
  return next ? getBandAgentId(next) : null;
}

export function nextBandAgentName(agent: string): BandAgentName | "complete" {
  const map: Record<string, BandAgentName | "complete"> = {
    wernicke: "norm",
    norm: "engram",
    engram: "broca",
    broca: "glia",
    glia: "complete",
  };
  return map[agent] ?? "complete";
}

export async function postBandHandoff(input: {
  roomId: string;
  fromAgent: string;
  toAgent: string;
  summary: string;
}): Promise<void> {
  const nextAgent = nextBandAgentName(input.fromAgent);
  const body =
    nextAgent === "complete"
      ? `${input.fromAgent} finished. Pipeline complete. ${input.summary}`
      : `${input.fromAgent} finished: ${input.summary}\n${bandAgentHandle(nextAgent)} please continue.`;

  await postBandMessage({
    roomId: input.roomId,
    body,
    mentionAgents: nextAgent === "complete" ? [] : [nextAgent],
  });
}

export async function listRoomMessages(
  roomId: string
): Promise<Array<{ content: string; created_at?: string }>> {
  const response = await fetch(`${bandRestBase()}/chats/${roomId}/messages`, {
    headers: bandHeaders(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) return [];
  const data = (await response.json()) as {
    messages?: Array<{ content: string; created_at?: string }>;
  };
  return data.messages ?? [];
}
