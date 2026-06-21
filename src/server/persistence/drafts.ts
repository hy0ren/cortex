import "server-only";
import type { ReportDraft } from "@/data/contracts";
import {
  FirestoreCollections,
  getDraftsFirestore,
} from "@/server/auth/firebase-admin";

const drafts = () => getDraftsFirestore().collection(FirestoreCollections.reportDrafts);

/** Create or update a live report draft in Firestore (never patient history). */
export async function upsertReportDraft(draft: ReportDraft): Promise<void> {
  await drafts().doc(draft.id).set(
    {
      ...draft,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function getReportDraft(id: string): Promise<ReportDraft | null> {
  const snap = await drafts().doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as ReportDraft;
}

export async function listDraftsForClinician(
  clinicianId: string
): Promise<ReportDraft[]> {
  const snap = await drafts()
    .where("clinicianId", "==", clinicianId)
    .orderBy("updatedAt", "desc")
    .limit(20)
    .get();

  return snap.docs.map((doc) => doc.data() as ReportDraft);
}

export async function deleteReportDraft(id: string): Promise<void> {
  await drafts().doc(id).delete();
}
