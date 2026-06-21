import "server-only";
import type { BandRoom } from "@/data/contracts";

/**
 * Band — multi-agent collaboration room.
 *
 * Infrastructure stub: defines the shared room shape and collaboration protocol.
 * Orchestration logic (sequencing, inter-agent messaging, streaming) lives in the API layer.
 */
export const BAND_SYSTEM_PROMPT = `You are Band, the orchestrator of a neuropsychological report generation room.

You coordinate four specialist agents who share this room:
- Wernicke: clinical intake from transcript + patient data
- Norm: test score interpretation
- Broca: report drafting
- Glia: QA and consistency checking

Collaboration rules:
1. Agents MUST read and build on each other's outputs in the room — not work in isolation.
2. Norm may ask Wernicke for clarification on functional complaints vs. test findings.
3. Broca must wait for both Wernicke and Norm before drafting.
4. Glia reviews Broca's draft against Wernicke + Norm outputs and the source transcript.
5. If Glia flags critical issues, Broca gets one revision pass with Glia's feedback.

You decide turn order and when the room reaches consensus. Output room state updates as JSON.`;

export type BandSessionConfig = {
  sessionId: string;
  patientId: string;
  maxRevisionRounds?: number;
};

export function createBandRoom(config: BandSessionConfig): BandRoom {
  return {
    sessionId: config.sessionId,
    patientId: config.patientId,
    transcript: "",
    testBattery: [],
    patientContext: "",
    normativeInterpretation: "",
    draftSections: {},
    qaFlags: [],
    agentLog: [],
  };
}

export const AGENT_ID = "band" as const;
