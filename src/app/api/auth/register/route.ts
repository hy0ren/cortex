import { NextRequest } from "next/server";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getAdminAuth } from "@/server/auth/firebase-admin";
import { registerDemoUser } from "@/server/auth/user-store";
import { createSession, SESSION_COOKIE } from "@/server/auth/session-store";
import { fail, ok } from "@/server/http/api-response";
import type { AuthUser } from "@/data/contracts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      displayName?: string;
      email?: string;
      password?: string;
      idToken?: string;
    };

    let user: AuthUser;
    if (body.idToken && getRuntimeCapabilities().firebase === "configured") {
      const token = await getAdminAuth().verifyIdToken(body.idToken);
      user = {
        id: token.uid,
        email: token.email ?? body.email ?? "",
        displayName: token.name ?? body.displayName?.trim() ?? "Clinician",
        role: "clinician",
      };
    } else {
      if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_AUTH !== "true") {
        return fail("REGISTRATION_UNAVAILABLE", "Firebase authentication is not configured", 503);
      }
      if (!body.displayName || !body.email || !body.password) {
        return fail("INVALID_REQUEST", "Name, email, and password are required");
      }
      user = await registerDemoUser({
        displayName: body.displayName,
        email: body.email,
        password: body.password,
      });
    }

    const session = await createSession(user);
    const response = ok({ session }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expiresAt),
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account";
    const status = /already exists/i.test(message) ? 409 : 400;
    return fail("REGISTRATION_FAILED", message, status);
  }
}
