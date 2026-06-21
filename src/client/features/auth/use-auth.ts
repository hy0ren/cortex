"use client";

import { useCallback, useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
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

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      let idToken: string | undefined;
      if (capabilities?.firebase === "configured") {
        const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        idToken = await credential.user.getIdToken();
      }
      const result = await apiRequest<{ session: AuthSession }>("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ email, password, idToken }),
      });
      setSession(result.session);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to sign in";
      setError(message);
      throw cause;
    } finally {
      setLoading(false);
    }
  }, [capabilities]);

  const signOut = useCallback(async () => {
    await apiRequest<{ signedOut: boolean }>("/api/auth/session", { method: "DELETE" });
    setSession(null);
  }, []);

  return { session, capabilities, loading, error, signIn, signOut };
}
