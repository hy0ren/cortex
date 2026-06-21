/**
 * Seed Redis with synthetic normative interpretive corpus.
 *
 * Usage:
 *   npm run seed:norms
 *   npm run seed:norms -- --clear
 */
import { loadEnvConfig } from "@next/env";
import {
  clearNormativeStore,
  countNormativeChunks,
  disconnectRedis,
  seedNormativeCorpus,
} from "@/server/persistence/redis";

loadEnvConfig(process.cwd());

async function main() {
  const shouldClear = process.argv.includes("--clear");

  if (shouldClear) {
    console.log("Clearing existing normative store...");
    await clearNormativeStore();
  }

  const count = await seedNormativeCorpus();
  console.log(`Done. Stored ${count} normative chunks.`);

  const verified = await countNormativeChunks();
  console.log(`Verified ${verified} chunks in index.`);

  await disconnectRedis();
}

main().catch((err) => {
  console.error("Normative seed failed:", err);
  process.exit(1);
});
