export {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  RedisKeys,
} from "./client";
export {
  clearPatientStore,
  cosineSimilarity,
  embedPatientText,
  getPatient,
  listPatientIds,
  searchPatientHistory,
  seedPatients,
  storePatient,
} from "./patient-store";
export {
  clearNormativeStore,
  countNormativeChunks,
  searchNormativeContext,
  seedNormativeCorpus,
} from "./normative-store";
export type { NormativeSearchFilters } from "./normative-store";
