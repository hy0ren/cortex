/**
 * Generate diverse synthetic agent traffic and export it to Arize.
 *
 * Usage:
 *   npm run eval:arize -- --rounds=2
 */
import { loadEnvConfig } from "@next/env";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import {
  DEMO_ACTIVE_ENCOUNTER,
  DEMO_ACTIVE_PATIENT,
} from "@/data/demo/workspace";
import { PATIENT_FIXTURES } from "@/data/fixtures";
import type { Encounter, PatientRecord } from "@/data/contracts";
import {
  buildBrocaUserMessage,
  buildGliaUserMessage,
  buildNormUserMessage,
  buildWernickeUserMessage,
} from "@/server/ai/agents";
import {
  applyBrocaOutput,
  runBrocaStep,
  runEngramStep,
  runGliaStep,
  runNormStep,
  runWernickeStep,
} from "@/server/pipeline/agent-steps";
import {
  flushArizeTracing,
  recordGeneration,
  withAgentSpan,
} from "@/server/observability/arize";
import { disconnectRedis } from "@/server/persistence/redis";

loadEnvConfig(process.cwd());

const roundsArg = process.argv.find((arg) => arg.startsWith("--rounds="));
const rounds = Math.max(1, Number(roundsArg?.split("=")[1] ?? 2));
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const patientLimit = Math.max(
  1,
  Number(limitArg?.split("=")[1] ?? PATIENT_FIXTURES.length + 1)
);
const patients = [DEMO_ACTIVE_PATIENT, ...PATIENT_FIXTURES].slice(0, patientLimit);
const label =
  process.argv.find((arg) => arg.startsWith("--label="))?.split("=")[1] ??
  "unlabeled";
const summaryFile = process.argv
  .find((arg) => arg.startsWith("--summary-file="))
  ?.split("=")[1];

type CaseResult = {
  label: string;
  round: number;
  patientId: string;
  parseCount: number;
  redFlagCount: number;
  normEvidenceCount: number;
  engramResultCount: number;
  sectionCount: number;
  gliaFlagCount: number;
  completenessScore: number;
  consistencyScore: number;
  wernickeOutput: unknown;
  normOutput: unknown;
  brocaOutput: unknown;
  gliaOutput: unknown;
};

const results: CaseResult[] = [];

function encounterFor(patient: PatientRecord, index: number): Encounter {
  if (patient.id === DEMO_ACTIVE_PATIENT.id) return DEMO_ACTIVE_ENCOUNTER;

  const scoreOffset = [-4, -1, 2, 5][index % 4];
  return {
    ...DEMO_ACTIVE_ENCOUNTER,
    id: `eval-${patient.id}`,
    patientId: patient.id,
    referralReason: patient.demographics.referralReason,
    transcript: [
      `Synthetic evaluation for ${patient.demographics.name}.`,
      `The referral concern is: ${patient.demographics.referralReason}.`,
      `The patient described functional difficulty consistent with the referral question.`,
      "The clinician noted cooperative behavior and adequate engagement.",
      "No additional facts beyond the synthetic record were provided.",
    ].join(" "),
    testBattery: DEMO_ACTIVE_ENCOUNTER.testBattery.map((score, scoreIndex) => ({
      ...score,
      standardScore: Math.max(
        55,
        Math.min(130, score.standardScore + scoreOffset + (scoreIndex % 3) - 1)
      ),
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function evaluateCase(patient: PatientRecord, encounter: Encounter, round: number) {
  const sessionId = `bulk-eval-${round}-${patient.id}-${randomUUID()}`;
  const common = { sessionId, patientId: patient.id };

  const wernicke = await withAgentSpan(
    "cortex.eval.wernicke",
    { agent: "wernicke", ...common },
    async (span) => {
      span.setAttributes({ "eval.kind": "bulk-synthetic", "eval.round": round });
      const result = await runWernickeStep(patient, encounter);
      recordGeneration(
        buildWernickeUserMessage({ patient, transcript: encounter.transcript }),
        result.raw
      );
      span.setAttribute("eval.parse_success", Boolean(result.output));
      span.setAttribute("eval.red_flags", result.output?.redFlags.length ?? 0);
      return result;
    }
  );

  const clinicalContext = wernicke.output?.clinicalContext ?? encounter.transcript;
  const norm = await withAgentSpan(
    "cortex.eval.norm",
    { agent: "norm", ...common },
    async (span) => {
      span.setAttributes({ "eval.kind": "bulk-synthetic", "eval.round": round });
      const result = await runNormStep(patient, encounter, clinicalContext);
      recordGeneration(
        buildNormUserMessage({
          patient,
          testBattery: encounter.testBattery,
          clinicalContext,
          retrievedNorms: result.normEvidence.map((item) => ({
            source: item.source,
            snippet: item.snippet,
            test: item.test,
            domain: item.domain,
          })),
        }),
        result.raw
      );
      span.setAttribute("eval.parse_success", Boolean(result.output));
      span.setAttribute("eval.norm_evidence_count", result.normEvidence.length);
      return result;
    }
  );

  const engramEvidence = await withAgentSpan(
    "cortex.eval.engram",
    { agent: "engram", ...common },
    async (span) => {
      span.setAttributes({ "eval.kind": "bulk-synthetic", "eval.round": round });
      const result = await runEngramStep(patient, encounter);
      span.setAttribute("eval.result_count", result.length);
      return result;
    }
  );

  const normativeInterpretation =
    norm.output?.overallProfile ??
    encounter.testBattery
      .map((score) => `${score.test} ${score.subtest ?? ""}: ${score.classification}`)
      .join("\n");
  const brocaInput = {
    patient,
    clinicalContext,
    normativeInterpretation,
    engramEvidence,
  };
  const broca = await withAgentSpan(
    "cortex.eval.broca",
    { agent: "broca", ...common },
    async (span) => {
      span.setAttributes({ "eval.kind": "bulk-synthetic", "eval.round": round });
      const result = await runBrocaStep(brocaInput);
      recordGeneration(
        buildBrocaUserMessage({
          patientName: patient.demographics.name,
          referralReason: patient.demographics.referralReason,
          clinicalContext,
          normativeInterpretation,
          engramEvidence: engramEvidence.map((item) => ({
            snippet: item.snippet,
            source: item.source,
          })),
        }),
        result.raw
      );
      span.setAttribute("eval.parse_success", Boolean(result.output));
      span.setAttribute(
        "eval.section_count",
        result.output ? Object.keys(result.output.sections).length : 0
      );
      return result;
    }
  );

  const draftSections = broca.output
    ? applyBrocaOutput({}, broca.output)
    : { generatedDraft: broca.raw };
  const gliaInput = {
    draftSections,
    clinicalContext,
    normativeInterpretation,
    sourceTranscript: encounter.transcript,
  };
  const glia = await withAgentSpan(
    "cortex.eval.glia",
    { agent: "glia", ...common },
    async (span) => {
      span.setAttributes({ "eval.kind": "bulk-synthetic", "eval.round": round });
      const result = await runGliaStep(gliaInput);
      recordGeneration(buildGliaUserMessage(gliaInput), result.raw);
      span.setAttribute("eval.parse_success", Boolean(result.output));
      span.setAttribute("eval.flag_count", result.output?.flags.length ?? 0);
      span.setAttribute(
        "eval.completeness_score",
        result.output?.completenessScore ?? 0
      );
      span.setAttribute(
        "eval.consistency_score",
        result.output?.consistencyScore ?? 0
      );
      return result;
    }
  );

  results.push({
    label,
    round,
    patientId: patient.id,
    parseCount: [
      wernicke.output,
      norm.output,
      broca.output,
      glia.output,
    ].filter(Boolean).length,
    redFlagCount: wernicke.output?.redFlags.length ?? 0,
    normEvidenceCount: norm.normEvidence.length,
    engramResultCount: engramEvidence.length,
    sectionCount: broca.output ? Object.keys(broca.output.sections).length : 0,
    gliaFlagCount: glia.output?.flags.length ?? 0,
    completenessScore: glia.output?.completenessScore ?? 0,
    consistencyScore: glia.output?.consistencyScore ?? 0,
    wernickeOutput: wernicke.output,
    normOutput: norm.output,
    brocaOutput: broca.output,
    gliaOutput: glia.output,
  });

  console.log(
    `  ${patient.id}: parsed=${[
      wernicke.output,
      norm.output,
      broca.output,
      glia.output,
    ].filter(Boolean).length}/4 flags=${glia.output?.flags.length ?? 0}`
  );
}

async function main() {
  console.log(
    `Running ${rounds} round(s) × ${patients.length} synthetic cases × 5 agent spans...`
  );
  for (let round = 1; round <= rounds; round += 1) {
    console.log(`Round ${round}/${rounds}`);
    for (const [index, patient] of patients.entries()) {
      await evaluateCase(patient, encounterFor(patient, index), round);
    }
  }
  await flushArizeTracing();
  await disconnectRedis();
  if (summaryFile) {
    await writeFile(summaryFile, JSON.stringify(results, null, 2));
    console.log(`Summary written to ${summaryFile}`);
  }
  console.log(`Export complete: ${rounds * patients.length * 5} agent spans.`);
}

main().catch(async (error) => {
  console.error(error);
  await flushArizeTracing().catch(() => undefined);
  await disconnectRedis().catch(() => undefined);
  process.exit(1);
});
