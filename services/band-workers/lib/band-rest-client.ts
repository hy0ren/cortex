import type { AgentName } from "./cortex-client.js";
import { getBandWorkerConfig } from "./cortex-client.js";

type BandChat = { id: string; title?: string };
type BandMessage = {
  id: string;
  content?: string;
  message?: { content?: string };
};

function restBase(agent: AgentName): string {
  return getBandWorkerConfig(agent).restUrl.replace(/\/$/, "");
}

function bandHeaders(agent: AgentName): HeadersInit {
  const { apiKey } = getBandWorkerConfig(agent);
  return {
    "X-API-Key": apiKey,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function messageContent(message: BandMessage): string {
  return message.content ?? message.message?.content ?? "";
}

export async function validateBandAgent(agent: AgentName): Promise<void> {
  const response = await fetch(`${restBase(agent)}/me`, {
    headers: bandHeaders(agent),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Band /me failed (${response.status}): ${body.slice(0, 200)}`);
  }
}

export async function listBandChats(agent: AgentName): Promise<BandChat[]> {
  const response = await fetch(`${restBase(agent)}/chats`, {
    headers: bandHeaders(agent),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Band /chats failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    chats?: BandChat[];
    data?: BandChat[];
  };
  return data.chats ?? data.data ?? [];
}

export async function nextBandMessage(
  agent: AgentName,
  chatId: string
): Promise<BandMessage | null> {
  const response = await fetch(`${restBase(agent)}/chats/${chatId}/messages/next`, {
    headers: bandHeaders(agent),
    signal: AbortSignal.timeout(15_000),
  });

  if (response.status === 204) return null;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Band /messages/next failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as BandMessage & { message?: BandMessage };
  return data.message ?? data;
}

export async function markBandMessageProcessing(
  agent: AgentName,
  chatId: string,
  messageId: string
): Promise<void> {
  await fetch(`${restBase(agent)}/chats/${chatId}/messages/${messageId}/processing`, {
    method: "POST",
    headers: bandHeaders(agent),
    signal: AbortSignal.timeout(10_000),
  });
}

export async function markBandMessageProcessed(
  agent: AgentName,
  chatId: string,
  messageId: string
): Promise<void> {
  await fetch(`${restBase(agent)}/chats/${chatId}/messages/${messageId}/processed`, {
    method: "POST",
    headers: bandHeaders(agent),
    signal: AbortSignal.timeout(10_000),
  });
}

export async function markBandMessageFailed(
  agent: AgentName,
  chatId: string,
  messageId: string,
  error: string
): Promise<void> {
  await fetch(`${restBase(agent)}/chats/${chatId}/messages/${messageId}/failed`, {
    method: "POST",
    headers: bandHeaders(agent),
    body: JSON.stringify({ error }),
    signal: AbortSignal.timeout(10_000),
  });
}

export { messageContent };
