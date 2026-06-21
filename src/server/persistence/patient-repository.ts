import "server-only";
import type { PatientRecord } from "@/data/contracts";
import { PATIENT_FIXTURES } from "@/data/fixtures";
import { DEMO_ACTIVE_PATIENT } from "@/data/demo/workspace";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getPatient, listPatientIds } from "./redis";
import { captureDegradedFallback } from "@/server/observability/sentry";

const fallbackPatients = [DEMO_ACTIVE_PATIENT, ...PATIENT_FIXTURES];

export async function listPatients(): Promise<PatientRecord[]> {
  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const ids = await listPatientIds();
      const patients = await Promise.all(ids.map((id) => getPatient(id)));
      const available = patients.filter((patient): patient is PatientRecord => Boolean(patient));
      if (available.length > 0) return available;
    } catch (error) {
      console.warn("[cortex-patients] Redis unavailable; using fixtures", error);
      captureDegradedFallback("Redis unavailable; using fixtures", { area: "patients.list", cause: error });
    }
  }
  return fallbackPatients;
}

export async function findPatient(id: string): Promise<PatientRecord | null> {
  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const patient = await getPatient(id);
      if (patient) return patient;
    } catch (error) {
      console.warn("[cortex-patients] Redis lookup failed; using fixtures", error);
      captureDegradedFallback("Redis lookup failed; using fixtures", { area: "patients.find", cause: error });
    }
  }
  return fallbackPatients.find((patient) => patient.id === id) ?? null;
}
