import "server-only";
import { randomUUID } from "crypto";
import type { AuthSession, AuthUser } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getMemoryStore } from "@/server/persistence/memory-store";
import { connectRedis } from "@/server/persistence/redis/client";

export const SESSION_COOKIE = "cortex_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function sessionKey(id: string) {
  return `cortex:session:${id}`;
}

export async function createSession(user: AuthUser): Promise<AuthSession> {
  const now = Date.now();
  const session: AuthSession = {
    id: randomUUID(),
    user,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_SECONDS * 1000).toISOString(),
  };

  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const redis = await connectRedis();
      await redis.set(sessionKey(session.id), JSON.stringify(session), "EX", SESSION_TTL_SECONDS);
      return session;
    } catch (error) {
      console.warn("[cortex-auth] Redis unavailable; using memory session store", error);
    }
  }

  getMemoryStore().sessions.set(session.id, session);
  return session;
}

export async function getSession(id: string | undefined): Promise<AuthSession | null> {
  if (!id) return null;

  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const redis = await connectRedis();
      const raw = await redis.get(sessionKey(id));
      if (raw) return JSON.parse(raw) as AuthSession;
    } catch (error) {
      console.warn("[cortex-auth] Redis session read failed; checking memory", error);
    }
  }

  const session = getMemoryStore().sessions.get(id) ?? null;
  if (session && new Date(session.expiresAt).getTime() <= Date.now()) {
    getMemoryStore().sessions.delete(id);
    return null;
  }
  return session;
}

export async function deleteSession(id: string | undefined): Promise<void> {
  if (!id) return;
  getMemoryStore().sessions.delete(id);
  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const redis = await connectRedis();
      await redis.del(sessionKey(id));
    } catch (error) {
      console.warn("[cortex-auth] Redis session delete failed", error);
    }
  }
}
