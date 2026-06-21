import type { AgentName } from "./cortex-client.js";
import {
  executeAgentOnCortex,
  extractRunId,
  getBandWorkerConfig,
  mentionsAgent,
} from "./cortex-client.js";
import {
  listBandChats,
  markBandMessageFailed,
  markBandMessageProcessed,
  markBandMessageProcessing,
  messageContent,
  nextBandMessage,
  validateBandAgent,
} from "./band-rest-client.js";

const POLL_MS = 2_000;

/**
 * Band remote agent via Agent REST API only.
 * Uses your band_a_* keys — no Band dashboard AI provider or Anthropic in workers.
 * All LLM work runs on Cortex (ANTHROPIC_API_KEY / TokenRouter).
 */
export async function runBandAgent(agent: AgentName) {
  const { agentId, apiKey } = getBandWorkerConfig(agent);
  if (!agentId || !apiKey) {
    console.error(
      `[${agent}] Missing BAND_${agent.toUpperCase()}_AGENT_ID or BAND_${agent.toUpperCase()}_API_KEY`
    );
    process.exit(1);
  }

  await validateBandAgent(agent);
  console.log(`[${agent}] Band remote agent listening (REST, ${agentId.slice(0, 8)}…)`);

  for (;;) {
    try {
      const chats = await listBandChats(agent);
      for (const chat of chats) {
        let message = await nextBandMessage(agent, chat.id);
        while (message?.id) {
          const content = messageContent(message);
          if (mentionsAgent(content, agent)) {
            const runId = extractRunId(content);
            if (runId) {
              await markBandMessageProcessing(agent, chat.id, message.id);
              try {
                console.log(`[${agent}] Cortex execute ${runId}`);
                await executeAgentOnCortex(runId, agent);
                await markBandMessageProcessed(agent, chat.id, message.id);
              } catch (error) {
                const detail = error instanceof Error ? error.message : String(error);
                console.error(`[${agent}] failed: ${detail}`);
                await markBandMessageFailed(agent, chat.id, message.id, detail);
              }
            }
          }
          message = await nextBandMessage(agent, chat.id);
        }
      }
    } catch (error) {
      console.warn(`[${agent}] poll error`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}
