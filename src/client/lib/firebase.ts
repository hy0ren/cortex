import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import {
  isPublicFirebaseConfigured,
  publicFirebaseConfig,
} from "@/client/config/public-env";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;
let analyticsInit: Promise<Analytics | null> | null = null;

function toFirebaseOptions(): FirebaseOptions {
  const { measurementId, ...rest } = publicFirebaseConfig;
  return measurementId ? { ...rest, measurementId } : rest;
}

/** Client-side Firebase app for Auth + Analytics. */
export function getFirebaseApp(): FirebaseApp {
  if (!isPublicFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* variables in .env"
    );
  }

  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(toFirebaseOptions());
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

/** Initialize Firebase app on the client. Returns null when env vars are missing. */
export function initFirebaseClient(): FirebaseApp | null {
  if (!isPublicFirebaseConfigured()) return null;
  return getFirebaseApp();
}

/**
 * Firebase Analytics — browser only.
 * Uses isSupported() before init (SSR, privacy mode, etc.).
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !isPublicFirebaseConfigured()) {
    return null;
  }
  if (analytics) return analytics;
  if (!analyticsInit) {
    analyticsInit = isSupported().then((supported) => {
      if (!supported) return null;
      analytics = getAnalytics(getFirebaseApp());
      return analytics;
    });
  }
  return analyticsInit;
}

export { isPublicFirebaseConfigured };
