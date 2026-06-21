import "server-only";
import type { AuthUser } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getAdminAuth } from "./firebase-admin";

export async function authenticateCredential(input: {
  idToken?: string;
  demo?: boolean;
}): Promise<AuthUser> {
  const capabilities = getRuntimeCapabilities();

  if (input.idToken && capabilities.firebase === "configured") {
    const token = await getAdminAuth().verifyIdToken(input.idToken);
    return {
      id: token.uid,
      email: token.email ?? "clinician@cortex.local",
      displayName: token.name ?? token.email?.split("@")[0] ?? "Clinician",
      role: "clinician",
    };
  }

  if (input.demo && capabilities.demoAuth) {
    return {
      id: "demo-lena-okafor-cortex-local",
      email: "lena.okafor@cortex.local",
      displayName: "Lena Okafor",
      role: "clinician",
    };
  }

  throw new Error("A valid Google sign-in is required");
}
