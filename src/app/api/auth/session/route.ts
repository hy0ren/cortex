import { NextRequest } from "next/server";
import { authenticateCredential } from "@/server/auth/authenticate";
import { getRequestSession } from "@/server/auth/request-session";
import {
  createSession,
  deleteSession,
  SESSION_COOKIE,
} from "@/server/auth/session-store";
import { fail, ok, routeError } from "@/server/http/api-response";

export async function GET() {
  const session = await getRequestSession();
  return ok({ session });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      idToken?: string;
      email?: string;
      password?: string;
    };
    const user = await authenticateCredential(body);
    const session = await createSession(user);
    const response = ok({ session });
    response.cookies.set(SESSION_COOKIE, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expiresAt),
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in";
    return fail("AUTH_FAILED", message, 401);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await deleteSession(request.cookies.get(SESSION_COOKIE)?.value);
    const response = ok({ signedOut: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (error) {
    return routeError(error);
  }
}
