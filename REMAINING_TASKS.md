# Cortex remaining tasks

Last audited: June 20, 2026.

## P0 — deployment blockers

- [ ] Restore Redis database responsiveness.
  - Redis Cloud management authentication and database discovery succeed.
  - The public endpoint accepts TCP connections but Redis commands time out from
    the current environment.
  - Verify the database with Redis Insight or `redis-cli`, reset/recreate the
    database password if needed, then prefer a deployment `REDIS_URL`.
  - Run `npm run seed:redis` and confirm all four synthetic patients are stored.
- [ ] Add `ANTHROPIC_API_KEY` to enable generated report sections. Until then,
  the pipeline deliberately retains deterministic demo report content.
- [ ] Add `FIREBASE_SERVICE_ACCOUNT_JSON` for Firebase Admin authentication and
  Firestore draft persistence. Confirm the required
  `clinicianId ASC, updatedAt DESC` Firestore composite index.
- [ ] Add Sentry DSN, org, project, and auth token if production error reporting
  and source-map uploads are required.
- [ ] Rotate credentials that have been shared outside the deployment secret
  manager before production release. Keep all replacements out of Git.
- [ ] Complete the clinical security/compliance review: provider BAAs, PHI data
  flow, retention/deletion policy, encryption, access audit log, incident
  response, and minimum-necessary telemetry.

## P1 — production functionality

- [ ] Implement real CSV/XLSX/PDF score-sheet parsing with schema validation,
  test-name normalization, duplicate detection, and clinician review before
  values enter the report.
- [ ] Persist uploaded files in approved encrypted object storage. Upload
  metadata currently survives only in the in-memory process.
- [ ] Replace browser-driven pipeline advancement and in-memory run state with a
  durable queue/worker, idempotent steps, retry policy, cancellation, and
  restart recovery.
- [ ] Run Wernicke, Norm, and Glia as real structured model calls. Today the
  lifecycle and observability spans exist, Engram performs retrieval, and Broca
  can generate content, but the other agent outputs remain deterministic.
- [ ] Add organization membership, patient-level authorization, clinician roles,
  and an admin/auditor role. Current ownership checks isolate drafts and runs by
  clinician, but there is no organization tenant model.
- [ ] Add integration tests for auth, ownership boundaries, Redis fallback,
  uploads, transcription, pipeline completion, and draft finalization.
- [ ] Add browser tests for registration/sign-in, intake, pause/resume,
  flag resolution, finalization, and export; run lint, typecheck, build, and
  tests in CI.

## P2 — product completion and maintenance

- [ ] Replace upload-after-recording with Deepgram streaming transcription and
  show recoverable microphone/network errors in the intake UI.
- [ ] Add a report editor with debounced autosave, revision history, conflict
  handling, and explicit unsaved-change state. The current report is read-only.
- [ ] Export a properly formatted DOCX/PDF instead of plain text.
- [ ] Replace demo-only history/activity content with API-backed encounters,
  reports, and pipeline events.
- [ ] Decide and document whether Arize may receive prompt/output content.
  `ARIZE_CAPTURE_CONTENT` is intentionally `false` by default; only lengths and
  operational metadata are exported.
- [ ] Review the 34 moderate `npm audit` findings. Available remediations require
  coordinated major upgrades of Next.js, Sentry, OpenTelemetry, and Firebase;
  upgrade in a dedicated branch with regression testing.
- [ ] Add service-level readiness checks and alerting so `/api/health` can
  distinguish “credential configured” from “provider reachable.”
