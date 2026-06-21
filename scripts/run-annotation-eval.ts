/**
 * Aggregate all stored Terac annotation results into Glia flag
 * precision/recall and per-stage error rates, then log the aggregate as a
 * span to Arize so the trend is visible over successive annotation batches.
 *
 * Usage:
 *   npm run terac:eval
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { listAllAnnotations } from "@/server/persistence/redis/annotation-store";
import { disconnectRedis } from "@/server/persistence/redis";
import { flushArizeTracing, getAgentTracer } from "@/server/observability/arize";

async function main() {
  const annotations = await listAllAnnotations();
  if (annotations.length === 0) {
    console.log("No annotations found yet — nothing to evaluate.");
    return;
  }

  let truePositives = 0;
  let falsePositives = 0;
  let missedIssueCount = 0;
  const stageErrorCounts: Record<string, { total: number; inaccurate: number }> = {
    wernicke: { total: 0, inaccurate: 0 },
    norm: { total: 0, inaccurate: 0 },
    broca: { total: 0, inaccurate: 0 },
  };

  for (const annotation of annotations) {
    for (const flag of annotation.flagAnnotations) {
      if (flag.verdict === "true_positive") truePositives += 1;
      if (flag.verdict === "false_positive") falsePositives += 1;
    }
    if (annotation.missedIssues?.trim()) missedIssueCount += 1;
    for (const stage of annotation.stageAnnotations) {
      const bucket = stageErrorCounts[stage.agent];
      bucket.total += 1;
      if (stage.verdict === "inaccurate") bucket.inaccurate += 1;
    }
  }

  // Precision: of flags Glia raised, how many were real. Recall is
  // approximated from missed-issue reports (false negatives) — a rough
  // proxy since we don't have a fixed ground-truth issue count per case.
  const flaggedTotal = truePositives + falsePositives;
  const precision = flaggedTotal > 0 ? truePositives / flaggedTotal : null;
  const recallProxy =
    truePositives + missedIssueCount > 0 ? truePositives / (truePositives + missedIssueCount) : null;

  console.log(`Annotations evaluated: ${annotations.length}`);
  console.log(
    `Glia flag precision: ${precision !== null ? `${(precision * 100).toFixed(1)}%` : "n/a"} (${truePositives} TP / ${falsePositives} FP)`
  );
  console.log(
    `Glia flag recall (proxy): ${recallProxy !== null ? `${(recallProxy * 100).toFixed(1)}%` : "n/a"} (${missedIssueCount} missed-issue reports)`
  );
  for (const [agent, { total, inaccurate }] of Object.entries(stageErrorCounts)) {
    if (total === 0) continue;
    console.log(`${agent} error rate: ${((inaccurate / total) * 100).toFixed(1)}% (${inaccurate}/${total} reviews)`);
  }

  const tracer = getAgentTracer();
  tracer.startActiveSpan("cortex.eval.terac_annotations", (span) => {
    span.setAttributes({
      "openinference.span.kind": "EVALUATOR",
      "eval.annotation_count": annotations.length,
      ...(precision !== null && { "eval.glia_flag_precision": precision }),
      ...(recallProxy !== null && { "eval.glia_flag_recall_proxy": recallProxy }),
      ...Object.fromEntries(
        Object.entries(stageErrorCounts)
          .filter(([, { total }]) => total > 0)
          .map(([agent, { total, inaccurate }]) => [`eval.stage_error_rate.${agent}`, inaccurate / total])
      ),
    });
    span.end();
  });
  await flushArizeTracing();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => disconnectRedis());
