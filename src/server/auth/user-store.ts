import "server-only";

import { promisify } from "util";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import type { AuthUser } from "@/data/contracts";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getMemoryStore } from "@/server/persistence/memory-store";
import { connectRedis } from "@/server/persistence/redis/client";

const scrypt = promisify(scryptCallback);

type StoredUser = AuthUser & {
  passwordHash: string;
  createdAt: string;
};

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function userKey(email: string) {
  return `cortex:user:${normalizeEmail(email)}`;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [salt, hash] = encoded.split(":");
  if (!salt || !hash) return false;
  const derived = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

async function readUser(email: string): Promise<StoredUser | null> {
  const normalized = normalizeEmail(email);
  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const redis = await connectRedis();
      const raw = await redis.get(userKey(normalized));
      if (raw) return JSON.parse(raw) as StoredUser;
    } catch (error) {
      console.warn("[cortex-auth] Redis user lookup failed; checking memory", error);
    }
  }
  return getMemoryStore().users.get(normalized) ?? null;
}

async function writeUser(user: StoredUser): Promise<void> {
  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const redis = await connectRedis();
      await redis.set(userKey(user.email), JSON.stringify(user));
      return;
    } catch (error) {
      console.warn("[cortex-auth] Redis user write failed; using memory", error);
    }
  }
  getMemoryStore().users.set(user.email, user);
}

export async function registerDemoUser(input: {
  displayName: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const email = normalizeEmail(input.email);
  const displayName = input.displayName.trim();
  if (!displayName) throw new Error("Name is required");
  if (!email.includes("@")) throw new Error("A valid email is required");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters");
  if (await readUser(email)) throw new Error("An account with this email already exists");

  const user: StoredUser = {
    id: randomUUID(),
    email,
    displayName,
    role: "clinician",
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  await writeUser(user);
  return toAuthUser(user);
}

export async function authenticateDemoUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const normalized = normalizeEmail(email);

  // Keep the documented development account available before registration.
  if (normalized === "lena.okafor@cortex.local" && password === "cortex-demo") {
    return {
      id: "demo-lena-okafor-cortex-local",
      email: normalized,
      displayName: "Lena Okafor",
      role: "clinician",
    };
  }

  const user = await readUser(normalized);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }
  return toAuthUser(user);
}
