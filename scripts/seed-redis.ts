/**
 * Seed Redis with synthetic patient fixtures.
 *
 * Usage:
 *   cp .env.example .env   # set REDIS_URL at minimum
 *   npm run seed:redis
 */
import { loadEnvConfig } from "@next/env";
import { PATIENT_FIXTURES } from "@/data/fixtures";
import { DEMO_ACTIVE_PATIENT } from "@/data/demo/workspace";
import {
  clearPatientStore,
  disconnectRedis,
  seedPatients,
} from "@/server/persistence/redis";

loadEnvConfig(process.cwd());

const ALL_PATIENTS = [DEMO_ACTIVE_PATIENT, ...PATIENT_FIXTURES];

async function main() {
  const shouldClear = process.argv.includes("--clear");

  console.log(`Seeding ${ALL_PATIENTS.length} synthetic patients to Redis...`);

  if (shouldClear) {
    console.log("Clearing existing patient store...");
    await clearPatientStore();
  }

  const count = await seedPatients(ALL_PATIENTS);
  console.log(`Done. Stored ${count} patients.`);

  for (const p of ALL_PATIENTS) {
    console.log(`  • ${p.id} — ${p.demographics.name} (${p.mrn})`);
  }

  await disconnectRedis();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
