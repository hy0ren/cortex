import admin from "firebase-admin";
import "server-only";
import { getEnv } from "@/server/config/env";

let initialized = false;

/** Server-side Firebase Admin — Auth verification + Firestore drafts. */
export function getFirebaseAdmin() {
  if (!initialized) {
    const { firebase } = getEnv();
    const serviceAccount = JSON.parse(firebase.serviceAccountJson) as admin.ServiceAccount;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebase.projectId,
      });
    }
    initialized = true;
  }

  return admin;
}

export function getAdminAuth() {
  return getFirebaseAdmin().auth();
}

/** Firestore instance — ONLY for live report drafts / session state. */
export function getDraftsFirestore() {
  return getFirebaseAdmin().firestore();
}

export const FirestoreCollections = {
  reportDrafts: "report_drafts",
  sessions: "sessions",
} as const;
