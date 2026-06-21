import "server-only";
import type { ReportDraft } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getMemoryStore } from "./memory-store";
import {
  FirestoreCollections,
  getDraftsFirestore,
} from "@/server/auth/firebase-admin";

const drafts = () => getDraftsFirestore().collection(FirestoreCollections.reportDrafts);

/** Create or update a live report draft in Firestore (never patient history). */
export async function upsertReportDraft(draft: ReportDraft): Promise<void> {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  if (getRuntimeCapabilities().firebase === "configured") {
    await drafts().doc(draft.id).set(next, { merge: true });
    return;
  }
  getMemoryStore().drafts.set(next.id, next);
}

export async function getReportDraft(id: string): Promise<ReportDraft | null> {
  if (getRuntimeCapabilities().firebase !== "configured") {
    return getMemoryStore().drafts.get(id) ?? null;
  }
  const snap = await drafts().doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as ReportDraft;
}

export async function listDraftsForClinician(
  clinicianId: string
): Promise<ReportDraft[]> {
  if (getRuntimeCapabilities().firebase !== "configured") {
    return [...getMemoryStore().drafts.values()]
      .filter((draft) => draft.clinicianId === clinicianId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const snap = await drafts()
    .where("clinicianId", "==", clinicianId)
    .orderBy("updatedAt", "desc")
    .limit(20)
    .get();

  return snap.docs.map((doc) => doc.data() as ReportDraft);
}

export async function deleteReportDraft(id: string): Promise<void> {
  if (getRuntimeCapabilities().firebase !== "configured") {
    getMemoryStore().drafts.delete(id);
    return;
  }
  await drafts().doc(id).delete();
}
