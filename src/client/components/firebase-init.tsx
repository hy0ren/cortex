"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics, initFirebaseClient } from "@/client/lib/firebase";

/** Mount once to initialize Firebase App + Analytics on the client. */
export function FirebaseInit() {
  useEffect(() => {
    try {
      initFirebaseClient();
      void getFirebaseAnalytics().catch((error) => {
        console.warn("[cortex-firebase] Analytics initialization skipped", error);
      });
    } catch (error) {
      console.warn("[cortex-firebase] Client initialization skipped", error);
    }
  }, []);

  return null;
}
