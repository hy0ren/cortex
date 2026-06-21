import "server-only";
import { getEnv, requireEnvValue } from "@/server/config/env";
import type { PatientRecord } from "@/data/contracts";
import {
  BAND_AGENT_NAMES,
  bandAgentHandle,
  getBandAgentApiKey,
  getBandAgentId,
  getBandRestApiKey,
  isBandFullyConfigured,
  type BandAgentName,
} from "@/server/band/agent-credentials";
import { bandAgentPersona } from "@/server/band/agent-personas";

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

function mentionPayload(agent: BandAgentName, kind: "mention" | "reference" = "mention") {
  const handle = bandAgentHandle(agent).slice(1);
  return {
    id: getBandAgentId(agent),
    name: agent,
    handle,
    kind,
  };
}

async function addBandParticipant(roomId: string, agent: BandAgentName): Promise<void> {
  const response = await fetch(`${bandRestBase()}/chats/${roomId}/participants`, {
    method: "POST",
    headers: bandHeaders(),
    body: JSON.stringify({
      participant: {
        participant_id: getBandAgentId(agent),
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
        title: `Cortex report ${input.sessionId.slice(0, 8)} · patient ${input.patientId}`,
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Band room create failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    data?: { id?: string; title?: string };
    id?: string;
    chat?: { id?: string; title?: string };
    chatroom_id?: string;
    name?: string;
  };
  const id = payload.data?.id ?? payload.id ?? payload.chat?.id ?? payload.chatroom_id;
  if (!id) throw new Error("Band room create returned no id");

  for (const agent of BAND_AGENT_NAMES) {
    if (agent === "wernicke") continue;
    await addBandParticipant(id, agent);
  }

  return { id, name: payload.data?.title ?? payload.chat?.title ?? payload.name ?? "Cortex report room" };
}

export async function postBandMessage(input: {
  roomId: string;
  body: string;
  mentionAgents?: BandAgentName[];
  selfMentionAgent?: BandAgentName;
  asAgent?: BandAgentName;
}): Promise<void> {
  const agents = input.mentionAgents ?? [];
  // Band requires at least one mention per message; when there's no next
  // agent to hand off to, mention a participant other than the sender
  // (Band rejects a message mentioning its own sender).
  const mentions =
    agents.length > 0
      ? agents.map((agent) => mentionPayload(agent))
      : input.selfMentionAgent
        ? [mentionPayload(input.selfMentionAgent, "mention")]
        : [];
  const apiKey = input.asAgent ? getBandAgentApiKey(input.asAgent) : undefined;
  const response = await fetch(`${bandRestBase()}/chats/${input.roomId}/messages`, {
    method: "POST",
    headers: bandHeaders(apiKey),
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
      "Ingesting transcript and patient record, then handing off to Norm.",
    ].join("\n"),
    mentionAgents: ["norm"],
    asAgent: "wernicke",
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
  const persona = BAND_AGENT_NAMES.includes(input.fromAgent as BandAgentName)
    ? bandAgentPersona(input.fromAgent as BandAgentName)
    : null;
  const intro = persona ? `${persona}\n\n` : "";
  const body =
    nextAgent === "complete"
      ? `${intro}${input.fromAgent} finished. Pipeline complete. ${input.summary}`
      : `${intro}${input.fromAgent} finished: ${input.summary}\n${bandAgentHandle(nextAgent)} please continue.`;

  await postBandMessage({
    roomId: input.roomId,
    body,
    mentionAgents: nextAgent === "complete" ? [] : [nextAgent],
    // Glia posts the final message itself, so it can't self-mention; loop
    // Wernicke back in as the room owner instead.
    selfMentionAgent: nextAgent === "complete" ? "wernicke" : undefined,
    asAgent: BAND_AGENT_NAMES.includes(input.fromAgent as BandAgentName)
      ? (input.fromAgent as BandAgentName)
      : "wernicke",
  });
}

export async function listRoomMessages(
  roomId: string
): Promise<Array<{ content: string; created_at?: string }>> {
  const response = await fetch(`${bandRestBase()}/chats/${roomId}/messages?status=all`, {
    headers: bandHeaders(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) return [];
  type RawMessage = { content: string; inserted_at?: string; created_at?: string };
  const payload = (await response.json()) as {
    data?: RawMessage[];
    messages?: RawMessage[];
  };
  const messages = payload.data ?? payload.messages ?? [];
  return messages.map((m) => ({ content: m.content, created_at: m.created_at ?? m.inserted_at }));
}
