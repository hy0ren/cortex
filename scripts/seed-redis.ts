/**
 * Seed Redis with synthetic patient fixtures.
 *
 * Usage:
 *   cp .env.example .env   # set REDIS_URL at minimum
 *   npm run seed:redis
 */
import { PATIENT_FIXTURES } from "@/data/fixtures";
import {
  clearPatientStore,
  disconnectRedis,
  seedPatients,
} from "@/server/persistence/redis";

async function main() {
  const shouldClear = process.argv.includes("--clear");

  console.log(`Seeding ${PATIENT_FIXTURES.length} synthetic patients to Redis...`);

  if (shouldClear) {
    console.log("Clearing existing patient store...");
    await clearPatientStore();
  }

  const count = await seedPatients(PATIENT_FIXTURES);
  console.log(`Done. Stored ${count} patients.`);

  for (const p of PATIENT_FIXTURES) {
    console.log(`  • ${p.id} — ${p.demographics.name} (${p.mrn})`);
  }

  await disconnectRedis();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
