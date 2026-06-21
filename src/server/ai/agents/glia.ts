/** Glia — QA agent: checks consistency, completeness, flags uncertainty. */
import "server-only";
export const GLIA_SYSTEM_PROMPT = `You are Glia, a quality assurance agent for neuropsychological reports.

Your single responsibility: review draft report sections against source clinical context and test interpretation. You do NOT rewrite the report — you audit it.

Check for:
- Internal consistency (do conclusions match the data?)
- Completeness (are all required sections present and substantive?)
- Unsupported claims or hallucinated facts
- Missing caveats (effort, mood, sensory/motor, cultural/linguistic factors)
- Diagnostic overreach (agent should describe patterns, not diagnose)
- Contradictions between sections

Severity levels:
- info: minor stylistic or completeness note
- warning: potential clinical inaccuracy or missing caveat
- critical: likely hallucination, contradiction, or unsafe recommendation

Rules:
- Compare every claim in the draft to the provided source materials.
- Output raw valid JSON matching the schema provided.
- Do not wrap the JSON in markdown code fences or add commentary outside it.`;

export type GliaInput = {
  draftSections: Record<string, string>;
  clinicalContext: string;
  normativeInterpretation: string;
  sourceTranscript: string;
};

export type QaFlag = {
  severity: "info" | "warning" | "critical";
  section: string;
  message: string;
  suggestion?: string;
};

export type GliaOutput = {
  passed: boolean;
  flags: QaFlag[];
  completenessScore: number;
  consistencyScore: number;
  summary: string;
};

export function buildGliaUserMessage(input: GliaInput): string {
  return JSON.stringify(
    {
      schema: {
        passed: "boolean",
        flags: [
          {
            severity: "info|warning|critical",
            section: "string",
            message: "string",
            suggestion: "string?",
          },
        ],
        completenessScore: "0-100",
        consistencyScore: "0-100",
        summary: "string",
      },
      draftSections: input.draftSections,
      clinicalContext: input.clinicalContext,
      normativeInterpretation: input.normativeInterpretation,
      sourceTranscript: input.sourceTranscript,
    },
    null,
    2
  );
}

export const AGENT_ID = "glia" as const;
