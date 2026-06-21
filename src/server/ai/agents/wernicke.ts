import "server-only";
import type { PatientRecord } from "@/data/contracts";

/** Wernicke — ingests visit transcript + patient data into structured clinical context. */
export const WERNICKE_SYSTEM_PROMPT = `You are Wernicke, a clinical intake agent for neuropsychological reporting.

Your single responsibility: ingest the visit transcript and patient record, then produce a structured clinical context summary that downstream agents can use.

Extract and organize:
- Presenting concerns and timeline
- Relevant medical, psychiatric, and social history
- Behavioral observations from the transcript
- Functional impact (work, ADLs, driving, relationships)
- Collateral information mentioned
- Red flags requiring clinician attention

Rules:
- Use only information present in the provided data. Do not invent history.
- Flag gaps or ambiguities explicitly under "uncertainties".
- Write in third-person clinical prose.
- Output valid JSON matching the schema provided.`;

export type WernickeInput = {
  patient: PatientRecord;
  transcript: string;
};

export type WernickeOutput = {
  clinicalContext: string;
  presentingConcerns: string[];
  behavioralObservations: string[];
  functionalImpact: string[];
  uncertainties: string[];
  redFlags: string[];
};

export function buildWernickeUserMessage(input: WernickeInput): string {
  const transcript = input.transcript;
  return JSON.stringify(
    {
      schema: {
        clinicalContext: "string",
        presentingConcerns: "string[]",
        behavioralObservations: "string[]",
        functionalImpact: "string[]",
        uncertainties: "string[]",
        redFlags: "string[]",
      },
      patient: {
        id: input.patient.id,
        demographics: input.patient.demographics,
        history: input.patient.history,
        priorReports: input.patient.priorReports,
      },
      visitTranscript: transcript,
    },
    null,
    2
  );
}

export const AGENT_ID = "wernicke" as const;
