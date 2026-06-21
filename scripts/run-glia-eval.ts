/**
 * Run Glia on/off eval comparison and export spans to Arize.
 *
 * Usage:
 *   EVAL_VARIANT=glia-on GLIA_ENABLED=true npm run eval:glia
 *   EVAL_VARIANT=glia-off GLIA_ENABLED=false npm run eval:glia
 */
import { loadEnvConfig } from "@next/env";
import { flushArizeTracing } from "@/server/observability/arize";
import { resetEnvCache } from "@/server/config/env";
import { createPipelineRun, advancePipeline } from "@/server/pipeline/pipeline-service";
import { getReportDraft } from "@/server/persistence/drafts";
import { getWorkspace } from "@/server/reports/report-service";

loadEnvConfig(process.cwd());

async function runOnce(label: string) {
  process.env.EVAL_VARIANT = label;
  process.env.GLIA_ENABLED = label === "glia-on" ? "true" : "false";
  resetEnvCache();

  const workspace = await getWorkspace("eval-clinician", "pat-demo-hayes", undefined, "enc-demo-hayes");
  if (!workspace) throw new Error("Workspace not found");
  const run = await createPipelineRun({
    clinicianId: workspace.draft.clinicianId,
    patientId: workspace.patient.id,
    encounterId: "enc-demo-hayes",
    draftId: workspace.draft.id,
  });

  let current = run;
  while (current.phase === "running") {
    current = await advancePipeline(current.id);
  }

  const draft = await getReportDraft(workspace.draft.id);
  const flags = JSON.parse(draft?.agentNotes.flags ?? "[]") as unknown[];
  console.log(`  ${label}: phase=${current.phase}, flags=${flags.length}, progress=${current.progress}`);
  return flags.length;
}

async function main() {
  console.log("Running Glia eval comparison (demo pipeline mode)…");
  const onFlags = await runOnce("glia-on");
  const offFlags = await runOnce("glia-off");
  await flushArizeTracing();
  console.log(`\nSummary: glia-on=${onFlags} flags, glia-off=${offFlags} flags`);
  console.log("Compare spans in Arize filtered by eval.variant");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
