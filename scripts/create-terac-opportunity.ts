/**
 * Build review packets for a set of completed Cortex pipeline runs, mint
 * per-run review tokens, and create (but do not launch) a Terac opportunity
 * with one task per run pointing at our hosted /annotate/[token] page.
 *
 * Usage:
 *   npm run terac:create-opportunity -- --runs=<runId1>,<runId2> [--launch]
 *
 * Run IDs come from completed pipeline runs — e.g. the "pipeline run=<id>"
 * line printed by scripts/simulate-band-run.ts, or a real clinician session.
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { buildAnnotationPacket } from "@/server/annotations/packet-builder";
import { mintReviewToken } from "@/server/terac/review-token";
import {
  createOpportunity,
  launchOpportunity,
  type TeracScreeningQuestionInput,
  type TeracTaskInput,
} from "@/server/terac/client";
import { isTeracConfigured } from "@/server/terac/credentials";
import { getEnv } from "@/server/config/env";
import { disconnectRedis } from "@/server/persistence/redis";

const runsArg = process.argv.find((arg) => arg.startsWith("--runs="));
const runIds = (runsArg?.split("=")[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const shouldLaunch = process.argv.includes("--launch");

// Screening guide drafted for this opportunity — paste/maintain in the Terac
// dashboard's screening UI; mirrored here so task creation stays in sync.
const SCREENING_QUESTIONS: TeracScreeningQuestionInput[] = [
  {
    key: "license",
    text: "Are you a licensed clinical neuropsychologist, or a doctoral-level psychology trainee currently under clinical supervision?",
    pick: "one",
    answers: [
      { text: "Licensed neuropsychologist", qualify_logic: "qualify" },
      { text: "Doctoral trainee under supervision", qualify_logic: "qualify" },
      { text: "Other mental health clinician (non-neuropsych)", qualify_logic: "reject" },
      { text: "None of the above", qualify_logic: "reject" },
    ],
  },
  {
    key: "report_experience",
    text: "Have you personally authored or co-authored neuropsychological reports as part of clinical practice?",
    pick: "one",
    answers: [
      { text: "Yes, regularly (within the past 2 years)", qualify_logic: "qualify" },
      { text: "Yes, but not recently (2+ years ago)", qualify_logic: "may" },
      { text: "No", qualify_logic: "reject" },
    ],
  },
  {
    key: "batteries",
    text: "Which standardized batteries have you administered or interpreted?",
    pick: "many",
    answers: [
      { text: "WAIS-IV / WAIS-5", qualify_logic: "must" },
      { text: "WMS-IV / WMS-5", qualify_logic: "may" },
      { text: "Other (e.g. RBANS, D-KEFS, CVLT)", qualify_logic: "may" },
      { text: "None", qualify_logic: "reject" },
    ],
  },
  {
    key: "comfort_critiquing_ai",
    text: "Are you comfortable reviewing AI-generated clinical report drafts and flagging inaccuracies, hallucinated findings, or inappropriate diagnostic language?",
    pick: "one",
    answers: [
      { text: "Yes", qualify_logic: "qualify" },
      { text: "No", qualify_logic: "reject" },
    ],
  },
];

async function main() {
  if (runIds.length === 0) {
    console.error("No run IDs provided. Usage: --runs=<runId1>,<runId2>");
    process.exitCode = 1;
    return;
  }
  if (!isTeracConfigured()) {
    console.error(
      "Terac is not configured (TERAC_API_KEY / TERAC_PROJECT_ID / TERAC_REVIEW_SECRET missing). " +
        "Building packets and tokens for inspection, but skipping the live API call."
    );
  }

  const { terac } = getEnv();
  const tasks: TeracTaskInput[] = [];
  for (const [index, runId] of runIds.entries()) {
    const packet = await buildAnnotationPacket(runId);
    const token = mintReviewToken(packet.pipelineRunId);
    const taskUrl = `${terac.appBaseUrl}/annotate/${token}`;
    console.log(`[${runId}] review link: ${taskUrl}`);
    tasks.push({
      sequence: index + 1,
      task_type: "interview",
      review_type: "manual",
      task_url: taskUrl,
      duration_minutes: 25,
    });
  }

  if (!isTeracConfigured()) {
    console.log(`Built ${tasks.length} task(s). Skipped Terac API call — set credentials to create the opportunity.`);
    return;
  }

  const opportunity = await createOpportunity({
    title: "Cortex neuropsych report review",
    project_id: terac.projectId,
    num_participants: tasks.length,
    business_type: "b2b",
    tasks,
    description:
      "Review AI-generated neuropsychological report pipeline outputs for clinical accuracy and QA flag precision.",
    screening_questions: SCREENING_QUESTIONS,
    expected_days_to_complete: 10,
  });
  console.log(`Created opportunity ${opportunity.id} (status: ${opportunity.status})`);

  if (shouldLaunch) {
    const launched = await launchOpportunity(opportunity.id);
    console.log(`Launched opportunity ${launched.id} (status: ${launched.status})`);
  } else {
    console.log("Not launched — pass --launch once you've verified the opportunity in the Terac dashboard.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => disconnectRedis());
