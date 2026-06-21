import "server-only";
import type { ReportDraft } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getMemoryStore } from "./memory-store";
import {
  FirestoreCollections,
  getDraftsFirestore,
} from "@/server/auth/firebase-admin";
import { captureDegradedFallback } from "@/server/observability/sentry";

const drafts = () => getDraftsFirestore().collection(FirestoreCollections.reportDrafts);

function memoryDraft(id: string): ReportDraft | null {
  return getMemoryStore().drafts.get(id) ?? null;
}

function memoryDraftsForClinician(clinicianId: string): ReportDraft[] {
  return [...getMemoryStore().drafts.values()]
    .filter((draft) => draft.clinicianId === clinicianId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function reportFirestoreFallback(area: string, error: unknown) {
  console.warn(`[cortex-drafts] ${area}; using memory fallback`, error);
  captureDegradedFallback(`${area}; using memory fallback`, {
    area: `drafts.${area}`,
    cause: error,
  });
}

/** Create or update a live report draft in Firestore (never patient history). */
export async function upsertReportDraft(draft: ReportDraft): Promise<void> {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  if (getRuntimeCapabilities().firebase === "configured") {
    try {
      await drafts().doc(draft.id).set(next, { merge: true });
      return;
    } catch (error) {
      reportFirestoreFallback("Firestore draft write failed", error);
    }
  }
  getMemoryStore().drafts.set(next.id, next);
}

export async function getReportDraft(id: string): Promise<ReportDraft | null> {
  if (getRuntimeCapabilities().firebase !== "configured") {
    return memoryDraft(id);
  }
  try {
    const snap = await drafts().doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as ReportDraft;
  } catch (error) {
    reportFirestoreFallback("Firestore draft read failed", error);
    return memoryDraft(id);
  }
}

export async function listDraftsForClinician(
  clinicianId: string
): Promise<ReportDraft[]> {
  if (getRuntimeCapabilities().firebase !== "configured") {
    return memoryDraftsForClinician(clinicianId);
  }
  try {
    const snap = await drafts()
      .where("clinicianId", "==", clinicianId)
      .orderBy("updatedAt", "desc")
      .limit(20)
      .get();

    return snap.docs.map((doc) => doc.data() as ReportDraft);
  } catch (error) {
    reportFirestoreFallback("Firestore draft list failed", error);
    return memoryDraftsForClinician(clinicianId);
  }
}

export async function deleteReportDraft(id: string): Promise<void> {
  if (getRuntimeCapabilities().firebase !== "configured") {
    getMemoryStore().drafts.delete(id);
    return;
  }
  try {
    await drafts().doc(id).delete();
  } catch (error) {
    reportFirestoreFallback("Firestore draft delete failed", error);
    getMemoryStore().drafts.delete(id);
  }
}
