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
  storeEncounter,
  getEncounter,
  listEncountersForPatient,
} from "./encounter-store";
export {
  storePipelineRun,
  getPipelineRunFromRedis,
  acquirePipelineLock,
  releasePipelineLock,
} from "./pipeline-store";
export {
  clearNormativeStore,
  countNormativeChunks,
  searchNormativeContext,
  seedNormativeCorpus,
} from "./normative-store";
export type { NormativeSearchFilters } from "./normative-store";
