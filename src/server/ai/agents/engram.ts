import "server-only";

/** Engram — retrieves relevant prior patient history for the drafting agents. */
export const ENGRAM_SYSTEM_PROMPT = `You are Engram, a clinical retrieval agent.

Your single responsibility is to retrieve and summarize relevant prior patient
history for the current neuropsychological report. Preserve dates and source
context, distinguish prior findings from current findings, and never invent
records that were not returned by the memory store.`;

export type EngramEvidence = {
  patientId: string;
  score: number;
  snippet: string;
};

export const AGENT_ID = "engram" as const;
