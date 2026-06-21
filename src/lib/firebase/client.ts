import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getPublicFirebaseConfig } from "@/lib/env";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/** Client-side Firebase app for clinician authentication. */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const config = getPublicFirebaseConfig();
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
