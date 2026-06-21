import "server-only";
import type { BandAgentName } from "@/server/band/agent-credentials";

/**
 * Room-facing persona lines, mirrored from BAND_AGENT_PROMPTS.md.
 * Band's dashboard "System Prompt" field is a no-op for external/remote
 * agents (Band runs no inference on them), so this is how each agent's
 * persona actually reaches the Band room — prepended by Cortex when it
 * posts the agent's handoff message.
 */
export const BAND_AGENT_PERSONAS: Record<BandAgentName, string> = {
  wernicke:
    "Wernicke — clinical intake agent. Surfaces what data arrived, presenting concerns, gaps/uncertainties, and red flags before handing off to Norm.",
  norm:
    "Norm — test score interpretation agent. Posts the cognitive profile, domain-by-domain classification, dissociations, and normative evidence cited.",
  engram:
    "Engram — clinical memory retrieval agent. Surfaces prior encounters, longitudinal trend, and baseline comparison for Broca's Background and History section.",
  broca:
    "Broca — report drafting agent. Summarizes which sections were drafted, what's flagged for clinician review, and how Engram/Norm context was integrated.",
  glia:
    "Glia — QA and consistency agent. Audits the draft against source data and posts completeness/consistency scores plus any flags for Broca to address.",
};

export function bandAgentPersona(agent: BandAgentName): string {
  return BAND_AGENT_PERSONAS[agent];
}
