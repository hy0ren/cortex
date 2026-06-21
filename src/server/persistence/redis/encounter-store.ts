import "server-only";
import type { Encounter } from "@/data/contracts";
import { connectRedis, RedisKeys } from "./client";
import { getRuntimeCapabilities } from "@/server/config/capabilities";
import { getMemoryStore } from "@/server/persistence/memory-store";

/** Persist an encounter record to Redis. */
export async function storeEncounter(encounter: Encounter): Promise<void> {
  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const redis = await connectRedis();
      await redis
        .multi()
        .set(RedisKeys.encounter(encounter.id), JSON.stringify(encounter))
        .sadd(RedisKeys.patientEncounters(encounter.patientId), encounter.id)
        .exec();
      return;
    } catch (e) {
      console.warn("[cortex-redis] Failed to store encounter in Redis, falling back to memory", e);
    }
  }
  getMemoryStore().encounters.set(encounter.id, encounter);
}

/** Retrieve an encounter record by ID. */
export async function getEncounter(id: string): Promise<Encounter | null> {
  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const redis = await connectRedis();
      const raw = await redis.get(RedisKeys.encounter(id));
      if (raw) return JSON.parse(raw) as Encounter;
    } catch (e) {
      console.warn("[cortex-redis] Failed to get encounter from Redis, falling back to memory", e);
    }
  }
  return getMemoryStore().encounters.get(id) ?? null;
}

/** List all encounters for a given patient. */
export async function listEncountersForPatient(patientId: string): Promise<Encounter[]> {
  if (getRuntimeCapabilities().redis === "configured") {
    try {
      const redis = await connectRedis();
      const encounterIds = await redis.smembers(RedisKeys.patientEncounters(patientId));
      if (encounterIds.length > 0) {
        const rawEncounters = await redis.mget(...encounterIds.map((id) => RedisKeys.encounter(id)));
        return rawEncounters
          .filter((raw): raw is string => Boolean(raw))
          .map((raw) => JSON.parse(raw) as Encounter)
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
      }
    } catch (e) {
      console.warn("[cortex-redis] Failed to list encounters from Redis, falling back to memory", e);
    }
  }
  return Array.from(getMemoryStore().encounters.values())
    .filter(e => e.patientId === patientId)
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
}
