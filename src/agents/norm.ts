import type { PatientRecord, TestScore } from "@/types";

/** Norm — interprets test scores against normative expectations. */
export const NORM_SYSTEM_PROMPT = `You are Norm, a neuropsychological test interpretation agent.

Your single responsibility: interpret standardized test scores in the context of the patient's demographics and clinical presentation.

For each cognitive domain represented in the battery:
- Summarize the pattern of scores (strengths vs. weaknesses)
- Compare to expected premorbid functioning when prior data exists
- Note intra-individual variability and dissociations
- Apply appropriate caveats (effort, mood, fatigue, motor/sensory limitations)
- Classify domains as: intact, mildly impaired, moderately impaired, or severely impaired

Rules:
- Reference specific tests and scores from the provided battery only.
- Do not diagnose — describe patterns and hypotheses for the clinician.
- Flag scores that appear inconsistent with the clinical picture.
- Output valid JSON matching the schema provided.`;

export type NormInput = {
  patient: PatientRecord;
  testBattery: TestScore[];
  clinicalContext?: string;
};

export type DomainInterpretation = {
  domain: string;
  classification: "intact" | "mild" | "moderate" | "severe";
  supportingTests: string[];
  narrative: string;
};

export type NormOutput = {
  overallProfile: string;
  domainInterpretations: DomainInterpretation[];
  dissociations: string[];
  caveats: string[];
  inconsistentFindings: string[];
};

export function buildNormUserMessage(input: NormInput): string {
  return JSON.stringify(
    {
      schema: {
        overallProfile: "string",
        domainInterpretations: [
          {
            domain: "string",
            classification: "intact|mild|moderate|severe",
            supportingTests: "string[]",
            narrative: "string",
          },
        ],
        dissociations: "string[]",
        caveats: "string[]",
        inconsistentFindings: "string[]",
      },
      demographics: input.patient.demographics,
      testBattery: input.testBattery,
      clinicalContext: input.clinicalContext ?? null,
      priorReports: input.patient.priorReports,
    },
    null,
    2
  );
}

export const AGENT_ID = "norm" as const;
