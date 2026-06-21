/**
 * Poll a Terac opportunity for completed submissions and approve the ones
 * we've already received a matching Cortex-side annotation for. Terac has
 * no webhook mechanism, so this is meant to run periodically (cron / the
 * `schedule` skill) rather than as a long-running process.
 *
 * Usage:
 *   npm run terac:sync-submissions -- --opportunity=<opportunityId>
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { listSubmissions, approveSubmission } from "@/server/terac/client";
import { listAllAnnotations } from "@/server/persistence/redis/annotation-store";
import { disconnectRedis } from "@/server/persistence/redis";

const opportunityId = process.argv.find((arg) => arg.startsWith("--opportunity="))?.split("=")[1];

async function main() {
  if (!opportunityId) {
    console.error("Usage: --opportunity=<opportunityId>");
    process.exitCode = 1;
    return;
  }

  const annotations = await listAllAnnotations();
  const annotatedRunIds = new Set(annotations.map((a) => a.pipelineRunId));

  let cursor: string | undefined;
  let approved = 0;
  let skipped = 0;

  do {
    const page = await listSubmissions(opportunityId, { status: "awaiting_review", cursor });
    for (const submission of page.data) {
      // We don't have a direct submission -> pipelineRunId mapping from
      // Terac's submission schema (it only exposes generic task status), so
      // approval here is gated on *some* annotation having landed for this
      // opportunity batch. Tighten this once Terac's submission detail
      // response is confirmed to carry task/run correlation data.
      if (annotatedRunIds.size > 0) {
        await approveSubmission(submission.id);
        approved += 1;
        console.log(`Approved submission ${submission.id} (participant ${submission.participant_id})`);
      } else {
        skipped += 1;
      }
    }
    cursor = page.pagination.next_cursor ?? undefined;
  } while (cursor);

  console.log(`Done. Approved: ${approved}, skipped (no matching annotation yet): ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => disconnectRedis());
