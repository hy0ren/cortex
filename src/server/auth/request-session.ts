import "server-only";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE } from "./session-store";

export async function getRequestSession() {
  const cookieStore = await cookies();
  return getSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireRequestSession() {
  const session = await getRequestSession();
  if (!session) throw new Error("Authentication required");
  return session;
}
