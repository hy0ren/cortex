# Railway deployment

Cortex runs as three Railway services in one project:

1. **cortex-web** — the Next.js application and API routes.
2. **band-workers** — the five persistent Band polling workers.
3. **Redis** — sessions, patient data, encounters, normative data, and pipeline state.

Firestore remains the report-draft store. Anthropic, Deepgram, Sentry, and Arize
remain externally hosted integrations.

## 1. Create the services

Connect this GitHub repository to two Railway services.

For `cortex-web`, set the config file path to `/railway.web.json`.

For `band-workers`, set the config file path to `/railway.worker.json`.

Both services can track `main`. Suggested watch paths:

- `cortex-web`: `/src/**`, `/public/**`, `/scripts/**`, `/package.json`,
  `/package-lock.json`, `/next.config.ts`, `/railway.web.json`
- `band-workers`: `/services/band-workers/**`, `/railway.worker.json`

Add Redis from Railway's database templates in the same project and keep its
volume attached. Reference its private `REDIS_URL` from the web service.

## 2. Configure the web service

Set these required variables:

```text
REDIS_URL=${{Redis.REDIS_URL}}
ANTHROPIC_API_KEY=...
ANTHROPIC_BASE_URL=...
ANTHROPIC_MODEL=...
DEEPGRAM_API_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
NEXT_PUBLIC_APP_URL=https://your-public-domain
ALLOW_DEMO_AUTH=false
```

Also configure the Band variables when Band orchestration is enabled:

```text
BAND_SYNC_SECRET=...
BAND_AGENT_HANDLE_PREFIX=...
BAND_WERNICKE_AGENT_ID=...
BAND_WERNICKE_API_KEY=...
BAND_NORM_AGENT_ID=...
BAND_NORM_API_KEY=...
BAND_ENGRAM_AGENT_ID=...
BAND_ENGRAM_API_KEY=...
BAND_BROCA_AGENT_ID=...
BAND_BROCA_API_KEY=...
BAND_GLIA_AGENT_ID=...
BAND_GLIA_API_KEY=...
```

Add Arize and Sentry variables only after confirming whether clinical content
may be sent to those vendors. Keep `ARIZE_CAPTURE_CONTENT=false` by default.

The pre-deploy validation rejects missing required variables, non-HTTPS app
URLs, invalid inline Firebase service-account JSON, and production demo auth.
The `/api/health` readiness check rejects a release when Redis is unavailable.

## 3. Configure the worker service

Copy all `BAND_*` variables and `THENVOI_*` overrides to `band-workers`. Set:

```text
NEXT_PUBLIC_APP_URL=https://your-public-domain
BAND_SYNC_SECRET=<same value as cortex-web>
```

The worker service has no public domain and uses restart policy `Always`.

## 4. Seed and protect Redis

From a shell with the production `REDIS_URL`:

```bash
npm run seed:redis
npm run seed:norms
```

Keep the Redis volume attached. Configure Railway volume backups or an external
backup/export process appropriate to the required recovery point and retention
period. Test restoration before storing production data.

## 5. Configure Firebase

In Firebase Authentication:

1. Enable Google as a sign-in provider.
2. Add the Railway public hostname and custom production hostname under
   **Authentication → Settings → Authorized domains**.
3. Verify Firestore rules and indexes for the `report_drafts` collection.

Use inline JSON for `FIREBASE_SERVICE_ACCOUNT_JSON`; do not commit the service
account file.

## 6. Deepgram live transcription

The browser endpoint only returns a five-minute restricted temporary key.
There is no fallback that exposes the primary Deepgram API key. The Deepgram
key therefore needs project-management permission to create temporary keys.
Prerecorded upload transcription continues to run server-side.

## 7. PHI production gate

Before real patient data is used:

- Execute required BAAs and verify eligible services with Railway, Firebase /
  Google Cloud, Anthropic, Deepgram, Redis hosting, Sentry, and Arize.
- Confirm region, encryption, retention, deletion, backup, access-control, and
  audit-log requirements with the responsible compliance and security owners.
- Disable prompt/content telemetry unless explicitly approved.
- Use synthetic data until this review is complete.

This repository configuration improves deployment safety but is not itself a
HIPAA compliance determination.
