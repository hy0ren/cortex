"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as signOutFirebase,
} from "firebase/auth";
import type { AuthSession, RuntimeCapabilities } from "@/data/contracts";
import { apiRequest } from "@/client/lib/api-client";
import { getFirebaseAuth } from "@/client/lib/firebase";

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [capabilities, setCapabilities] = useState<RuntimeCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiRequest<{ session: AuthSession | null }>("/api/auth/session"),
      apiRequest<{ capabilities: RuntimeCapabilities }>("/api/health"),
    ])
      .then(([auth, health]) => {
        setSession(auth.session);
        setCapabilities(health.capabilities);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to initialize"))
      .finally(() => setLoading(false));
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (capabilities?.firebase !== "configured") {
        throw new Error("Google sign-in is not configured yet");
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(getFirebaseAuth(), provider);
      const idToken = await credential.user.getIdToken();
      const result = await apiRequest<{ session: AuthSession }>("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      setSession(result.session);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to sign in with Google";
      setError(message);
      throw cause;
    } finally {
      setLoading(false);
    }
  }, [capabilities]);

  const enterDemo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!capabilities?.demoAuth) {
        throw new Error("Demo access is not enabled");
      }

      const result = await apiRequest<{ session: AuthSession }>("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ demo: true }),
      });
      setSession(result.session);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to enter the demo";
      setError(message);
      throw cause;
    } finally {
      setLoading(false);
    }
  }, [capabilities]);

  const signOut = useCallback(async () => {
    try {
      await apiRequest<{ signedOut: boolean }>("/api/auth/session", { method: "DELETE" });
    } finally {
      if (capabilities?.firebase === "configured") {
        await signOutFirebase(getFirebaseAuth()).catch(() => undefined);
      }
      setSession(null);
    }
  }, [capabilities]);

  return {
    session,
    capabilities,
    loading,
    error,
    signInWithGoogle,
    enterDemo,
    signOut,
  };
}
