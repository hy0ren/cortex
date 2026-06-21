import Anthropic from "@anthropic-ai/sdk";
import "server-only";
import { getEnv, requireEnvValue } from "@/server/config/env";

let client: Anthropic | null = null;

/** The SDK appends /v1/messages itself — strip a trailing /v1 so proxies like TokenRouter that already include it in their base URL don't end up double-pathed. */
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/v1\/?$/, "");
}

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const { anthropic } = getEnv();
    client = new Anthropic({
      apiKey: requireEnvValue(anthropic.apiKey, "ANTHROPIC_API_KEY"),
      ...(anthropic.baseUrl && { baseURL: normalizeBaseUrl(anthropic.baseUrl) }),
    });
  }
  return client;
}

export function getAnthropicModel(): string {
  return getEnv().anthropic.model;
}

export type ClaudeMessage = Anthropic.MessageParam;

export type ClaudeCompletionOptions = {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
};

/** Thin wrapper around Claude completions for agent modules. */
export async function completeWithClaude(
  options: ClaudeCompletionOptions
): Promise<string> {
  const anthropic = getAnthropicClient();
  const model = getAnthropicModel();

  const response = await anthropic.messages.create({
    model,
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.2,
    system: options.system,
    messages: options.messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }

  return textBlock.text;
}
