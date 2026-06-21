import "server-only";
import type { Encounter } from "@/data/contracts";
import { connectRedis, RedisKeys } from "./client";

/** Persist an encounter record to Redis. */
export async function storeEncounter(encounter: Encounter): Promise<void> {
  const redis = await connectRedis();
  await redis
    .multi()
    .set(RedisKeys.encounter(encounter.id), JSON.stringify(encounter))
    .sadd(RedisKeys.patientEncounters(encounter.patientId), encounter.id)
    .exec();
}

/** Retrieve an encounter record by ID. */
export async function getEncounter(id: string): Promise<Encounter | null> {
  const redis = await connectRedis();
  const raw = await redis.get(RedisKeys.encounter(id));
  if (!raw) return null;
  return JSON.parse(raw) as Encounter;
}

/** List all encounters for a given patient. */
export async function listEncountersForPatient(patientId: string): Promise<Encounter[]> {
  const redis = await connectRedis();
  const encounterIds = await redis.smembers(RedisKeys.patientEncounters(patientId));
  if (encounterIds.length === 0) return [];
  
  const rawEncounters = await redis.mget(...encounterIds.map((id) => RedisKeys.encounter(id)));
  return rawEncounters
    .filter((raw): raw is string => Boolean(raw))
    .map((raw) => JSON.parse(raw) as Encounter)
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
}
