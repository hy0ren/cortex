import "server-only";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { randomUUID } from "crypto";
import { storeEncounter } from "@/server/persistence/redis/encounter-store";
import { saveDraft } from "@/server/reports/report-service";
import { createPipelineRun, getPipelineRun } from "@/server/pipeline/pipeline-service";
import { executePipelineAgent } from "@/server/pipeline/band-sync-service";
import { listRoomMessages } from "@/server/band/room-client";
import type { AgentId } from "@/data/contracts";

const PATIENT_ID = "pat-001";
const CLINICIAN_ID = "sim-clinician";

async function main() {
  const now = new Date().toISOString();
  const encounterId = randomUUID();
  const draftId = randomUUID();

  await storeEncounter({
    id: encounterId,
    patientId: PATIENT_ID,
    clinicianId: CLINICIAN_ID,
    status: "completed",
    appointmentDate: now,
    referralReason: "Post-TBI cognitive changes",
    transcript:
      "Patient reports word-finding difficulty and short-term memory lapses since a fall 4 months ago. Denies headache or vision changes. Spouse confirms increased forgetfulness at home.",
    testBattery: [
      { test: "WMS-IV", subtest: "Logical Memory I", standardScore: 78, percentile: 7, classification: "Below Average" },
      { test: "WAIS-IV", subtest: "Digit Span", standardScore: 95, percentile: 37, classification: "Average" },
    ],
    createdAt: now,
    updatedAt: now,
  });

  await saveDraft({
    id: draftId,
    clinicianId: CLINICIAN_ID,
    patientId: PATIENT_ID,
    status: "generating",
    sections: {},
    agentNotes: {},
    createdAt: now,
    updatedAt: now,
  });

  console.log(`[sim] encounter=${encounterId} draft=${draftId}`);

  const run = await createPipelineRun({
    clinicianId: CLINICIAN_ID,
    patientId: PATIENT_ID,
    encounterId,
    draftId,
  });

  console.log(`[sim] pipeline run=${run.id} bandRoomId=${run.bandRoomId ?? "(none)"}`);

  const sequence: AgentId[] = ["wernicke", "norm", "engram", "broca", "glia"];
  for (const agent of sequence) {
    console.log(`[sim] executing ${agent}...`);
    const updated = await executePipelineAgent(run.id, agent);
    const lastLog = updated.agentLog.at(-1);
    console.log(`[sim]   -> ${lastLog?.message} ${lastLog?.detail ? `(${lastLog.detail})` : ""}`);
  }

  const finalRun = await getPipelineRun(run.id);
  console.log(`[sim] final phase=${finalRun?.phase} progress=${finalRun?.progress}`);

  if (finalRun?.bandRoomId) {
    const messages = await listRoomMessages(finalRun.bandRoomId);
    console.log(`[sim] Band room ${finalRun.bandRoomId} has ${messages.length} message(s):\n`);
    for (const m of messages) {
      console.log(`--- ${m.created_at ?? ""} ---\n${m.content}\n`);
    }
  } else {
    console.log("[sim] No Band room was created (Band not configured?).");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[sim] failed", error);
    process.exit(1);
  });
