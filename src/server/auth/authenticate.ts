import "server-only";
import type { AuthUser } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getAdminAuth } from "./firebase-admin";
import { authenticateDemoUser } from "./user-store";

export async function authenticateCredential(input: {
  idToken?: string;
  email?: string;
  password?: string;
}): Promise<AuthUser> {
  if (input.idToken && getRuntimeCapabilities().firebase === "configured") {
    const token = await getAdminAuth().verifyIdToken(input.idToken);
    return {
      id: token.uid,
      email: token.email ?? "clinician@cortex.local",
      displayName: token.name ?? token.email?.split("@")[0] ?? "Clinician",
      role: "clinician",
    };
  }

  if (!input.email || !input.password) {
    throw new Error("Email and password are required");
  }
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_AUTH !== "true") {
    throw new Error("Firebase authentication is not configured");
  }
  return authenticateDemoUser(input.email, input.password);
}
