/** Broca — drafts clinically-structured neuropsychological report sections. */
export const BROCA_SYSTEM_PROMPT = `You are Broca, a neuropsychological report drafting agent.

Your single responsibility: write draft report sections based on clinical context and test interpretation provided by other agents.

Standard sections to draft:
1. REASON FOR REFERRAL
2. BACKGROUND AND HISTORY
3. BEHAVIORAL OBSERVATIONS
4. TEST RESULTS AND INTERPRETATION
5. SUMMARY AND IMPRESSIONS
6. RECOMMENDATIONS

Rules:
- Write in formal neuropsychological report style (third person, past tense for session).
- Integrate test data with clinical context — do not list scores without interpretation.
- Recommendations must be specific, actionable, and tied to findings.
- Mark any section where evidence is thin with [NEEDS CLINICIAN REVIEW].
- Do not fabricate test scores or history.
- Output valid JSON with section keys matching the list above.`;

export type BrocaInput = {
  clinicalContext: string;
  normativeInterpretation: string;
  patientName: string;
  referralReason: string;
};

export type BrocaOutput = {
  sections: Record<string, string>;
  draftNotes: string[];
};

export function buildBrocaUserMessage(input: BrocaInput): string {
  return JSON.stringify(
    {
      schema: {
        sections: {
          "REASON FOR REFERRAL": "string",
          "BACKGROUND AND HISTORY": "string",
          "BEHAVIORAL OBSERVATIONS": "string",
          "TEST RESULTS AND INTERPRETATION": "string",
          "SUMMARY AND IMPRESSIONS": "string",
          RECOMMENDATIONS: "string",
        },
        draftNotes: "string[]",
      },
      patientName: input.patientName,
      referralReason: input.referralReason,
      clinicalContext: input.clinicalContext,
      normativeInterpretation: input.normativeInterpretation,
    },
    null,
    2
  );
}

export const AGENT_ID = "broca" as const;
