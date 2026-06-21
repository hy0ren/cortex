import admin from "firebase-admin";
import "server-only";
import { readFileSync } from "fs";
import { resolve } from "path";
import { getEnv, requireEnvValue } from "@/server/config/env";

let initialized = false;

function parseServiceAccount(value: string): admin.ServiceAccount {
  const configured = requireEnvValue(value, "FIREBASE_SERVICE_ACCOUNT_JSON");
  const serialized = configured.trim().startsWith("{")
    ? configured
    : readFileSync(resolve(process.cwd(), configured), "utf8");
  return JSON.parse(serialized) as admin.ServiceAccount;
}

/** Server-side Firebase Admin — Auth verification + Firestore drafts. */
export function getFirebaseAdmin() {
  if (!initialized) {
    const { firebase } = getEnv();
    const serviceAccount = parseServiceAccount(firebase.serviceAccountJson);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: requireEnvValue(
          firebase.projectId,
          "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        ),
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
