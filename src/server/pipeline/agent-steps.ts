import "server-only";
import type {
  GliaFlag,
  NormativeSearchResult,
  PatientRecord,
  Encounter,
  VectorSearchResult,
} from "@/data/contracts";
import { completeWithClaude } from "@/server/ai/anthropic";
import {
  BROCA_SYSTEM_PROMPT,
  buildBrocaUserMessage,
  type BrocaOutput,
  GLIA_SYSTEM_PROMPT,
  buildGliaUserMessage,
  type GliaOutput,
  NORM_SYSTEM_PROMPT,
  buildNormUserMessage,
  type NormOutput,
  WERNICKE_SYSTEM_PROMPT,
  buildWernickeUserMessage,
  type WernickeOutput,
} from "@/server/ai/agents";
import { getEnv } from "@/server/config/env";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { searchNormativeContext, searchPatientHistory } from "@/server/persistence/redis";

export function parseAgentJson<T>(raw: string): T | null {
  try {
    const normalized = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    return JSON.parse(normalized) as T;
  } catch {
    return null;
  }
}

const SECTION_KEY_MAP: Record<string, string> = {
  "REASON FOR REFERRAL": "Reason for Referral",
  REASONFORREFERRAL: "Reason for Referral",
  "BACKGROUND AND HISTORY": "History",
  HISTORY: "History",
  "BEHAVIORAL OBSERVATIONS": "Behavioral Observations",
  BEHAVIORALOBSERVATIONS: "Behavioral Observations",
  "TEST RESULTS AND INTERPRETATION": "Interpretation",
  INTERPRETATION: "Interpretation",
  "SUMMARY AND IMPRESSIONS": "Summary",
  SUMMARY: "Summary",
  RECOMMENDATIONS: "Summary",
};

export function mapToReportSectionKey(section: string): string {
  const exact = SECTION_KEY_MAP[section.toUpperCase()];
  if (exact) return exact;
  const match = Object.entries(SECTION_KEY_MAP).find(([key]) =>
    section.toUpperCase().includes(key) || key.includes(section.toUpperCase())
  );
  return match?.[1] ?? section;
}

export function applyBrocaOutput(
  current: Record<string, string>,
  output: BrocaOutput
): Record<string, string> {
  const sections = output.sections;
  const summary = sections["SUMMARY AND IMPRESSIONS"];
  const recommendations = sections.RECOMMENDATIONS;
  return {
    ...current,
    ...(sections["REASON FOR REFERRAL"] && {
      reasonForReferral: sections["REASON FOR REFERRAL"],
    }),
    ...(sections["BACKGROUND AND HISTORY"] && {
      history: sections["BACKGROUND AND HISTORY"],
    }),
    ...(sections["BEHAVIORAL OBSERVATIONS"] && {
      behavioralObservations: sections["BEHAVIORAL OBSERVATIONS"],
    }),
    ...(sections["TEST RESULTS AND INTERPRETATION"] && {
      interpretation: sections["TEST RESULTS AND INTERPRETATION"],
    }),
    ...((summary || recommendations) && {
      summary: [summary, recommendations].filter(Boolean).join("\n\n"),
    }),
  };
}

export function gliaFlagsFromOutput(output: GliaOutput): GliaFlag[] {
  return output.flags.map((flag, index) => ({
    id: `glia-${Date.now()}-${index}`,
    section: mapToReportSectionKey(flag.section),
    severity: flag.severity === "info" ? "note" : "verify",
    title: flag.message,
    detail: flag.suggestion ?? flag.message,
  }));
}

export function summarizeWernicke(output: WernickeOutput): string {
  return `${output.presentingConcerns.length} concerns, ${output.redFlags.length} red flags flagged`;
}

export function summarizeNorm(output: NormOutput): string {
  const impaired = output.domainInterpretations.filter(
    (d) => d.classification !== "intact"
  ).length;
  return `${output.domainInterpretations.length} domains reviewed, ${impaired} below intact`;
}

export function summarizeEngram(evidence: VectorSearchResult[]): string {
  return `Retrieved ${evidence.length} prior-history references for this patient`;
}

export function summarizeBroca(output: BrocaOutput): string {
  return `${Object.keys(output.sections).length} report sections drafted`;
}

export function summarizeGlia(output: GliaOutput): string {
  return `${output.flags.length} QA flags · completeness ${output.completenessScore}% · consistency ${output.consistencyScore}%`;
}

export async function runWernickeStep(patient: PatientRecord, encounter: Encounter): Promise<{
  raw: string;
  output: WernickeOutput | null;
}> {
  const raw = await completeWithClaude({
    system: WERNICKE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildWernickeUserMessage({ 
      patient, transcript: encounter.transcript 
    }) }],
  });
  return { raw, output: parseAgentJson<WernickeOutput>(raw) };
}

export async function retrieveNormativeEvidence(
  patient: PatientRecord,
  encounter: Encounter,
  clinicalContext?: string
): Promise<NormativeSearchResult[]> {
  const query = [
    patient.demographics.referralReason,
    clinicalContext ?? "",
    ...encounter.testBattery.map(
      (score) => `${score.test} ${score.subtest ?? ""} ${score.classification}`
    ),
  ].join("\n");
  const primaryTest = encounter.testBattery[0]?.test;
  return searchNormativeContext(query, { test: primaryTest }, 6);
}

export async function runNormStep(
  patient: PatientRecord,
  encounter: Encounter,
  clinicalContext?: string
): Promise<{
  raw: string;
  output: NormOutput | null;
  normEvidence: NormativeSearchResult[];
}> {
  const normEvidence = await retrieveNormativeEvidence(patient, encounter, clinicalContext);
  const raw = await completeWithClaude({
    system: NORM_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildNormUserMessage({
          patient,
          testBattery: encounter.testBattery,
          clinicalContext,
          retrievedNorms: normEvidence.map((item) => ({
            source: item.source,
            snippet: item.snippet,
            test: item.test,
            domain: item.domain,
          })),
        }),
      },
    ],
  });
  return { raw, output: parseAgentJson<NormOutput>(raw), normEvidence };
}

export async function runEngramStep(patient: PatientRecord, encounter: Encounter): Promise<VectorSearchResult[]> {
  if (getRuntimeCapabilities().redis !== "configured") return [];
  return searchPatientHistory(
    `${patient.demographics.referralReason}\n${encounter.transcript}`,
    5,
    patient.id
  );
}

export async function runBrocaStep(input: {
  patient: PatientRecord;
  clinicalContext: string;
  normativeInterpretation: string;
  engramEvidence: VectorSearchResult[];
}): Promise<{ raw: string; output: BrocaOutput | null }> {
  const message = buildBrocaUserMessage({
    clinicalContext: input.clinicalContext,
    normativeInterpretation: input.normativeInterpretation,
    patientName: input.patient.demographics.name,
    referralReason: input.patient.demographics.referralReason,
    engramEvidence: input.engramEvidence.map((item) => ({
      snippet: item.snippet,
      source: item.source,
    })),
  });
  const raw = await completeWithClaude({
    system: BROCA_SYSTEM_PROMPT,
    messages: [{ role: "user", content: message }],
  });
  const parsed = parseAgentJson<BrocaOutput>(raw);
  const output =
    parsed &&
    parsed.sections &&
    typeof parsed.sections === "object" &&
    !Array.isArray(parsed.sections)
      ? parsed
      : null;
  return { raw, output };
}

export async function runGliaStep(input: {
  draftSections: Record<string, string>;
  clinicalContext: string;
  normativeInterpretation: string;
  sourceTranscript: string;
  retrievedEvidence?: Array<{ snippet: string; source: string }>;
}): Promise<{ raw: string; output: GliaOutput | null }> {
  const message = buildGliaUserMessage(input);
  const raw = await completeWithClaude({
    system: GLIA_SYSTEM_PROMPT,
    messages: [{ role: "user", content: message }],
  });
  return { raw, output: parseAgentJson<GliaOutput>(raw) };
}

export function isGliaEnabled(): boolean {
  return getEnv().glia.enabled;
}

export function getEvalVariant(): string {
  return getEnv().evalVariant;
}

export function groundedTagsFromDraft(agentNotes: Record<string, string>): string[] {
  const tags: string[] = [];
  try {
    const normEvidence = JSON.parse(agentNotes.normEvidence ?? "[]") as NormativeSearchResult[];
    for (const item of normEvidence.slice(0, 4)) {
      tags.push(item.source);
    }
  } catch {
    /* ignore */
  }
  try {
    const engramEvidence = JSON.parse(agentNotes.engramEvidence ?? "[]") as VectorSearchResult[];
    for (const item of engramEvidence.slice(0, 2)) {
      tags.push(item.snippet.slice(0, 60));
    }
  } catch {
    /* ignore */
  }
  return [...new Set(tags)].slice(0, 6);
}
