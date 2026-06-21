# Cortex

Documentation copilot for neuropsychologists — turns patient visits (voice transcript + structured test scores) into clinically-structured neuropsychological reports.

This repo contains the Cortex frontend prototype plus server infrastructure.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) + TypeScript | Vercel deploy target |
| Styling | Tailwind CSS v4 + shadcn/ui | UI primitives (in `src/client/components/ui/`) |
| LLM | Anthropic Claude Sonnet | Four-agent pipeline |
| Speech | Deepgram Nova-2 Medical | Visit audio → transcript |
| Memory | Redis | Patient history + vector retrieval |
| Auth | Firebase Auth | Clinician login |
| Drafts | Firestore | Live report drafts / session state only |
| Observability | Arize (OTLP) + Sentry | Agent eval + error monitoring |

## Data lanes (keep separate)

```
Redis          → patient records, history, prior reports, vector search
Firestore      → live report drafts, session state (never patient history)
Fixtures       → synthetic patients only (no real PHI)
```

## Project structure

```
src/
├── app/              # Next.js routes and global styles
├── client/           # Browser-safe UI, feature state, and client SDKs
│   ├── components/   # Shared UI primitives
│   ├── features/     # Product features grouped by workflow
│   └── lib/          # Browser-only adapters and helpers
├── data/             # Shared contracts, synthetic fixtures, and demo view data
│   ├── contracts/    # Types shared across client and server
│   ├── demo/         # Deterministic frontend presentation data
│   └── fixtures/     # Synthetic patient records
├── server/           # Server-only AI, auth, persistence, speech, and telemetry
│   ├── ai/           # Claude client and agent prompts
│   ├── auth/         # Firebase Admin
│   ├── persistence/  # Firestore drafts and Redis patient memory
│   ├── speech/       # Deepgram transcription
│   ├── observability/# Arize tracing and Sentry helpers
│   └── config/       # Validated private environment config
└── instrumentation.ts
scripts/
└── seed-redis.ts     # Seed fixtures into Redis
```

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

The app is usable before credentials are added:

- Sign in with any valid email and a password of at least 6 characters.
- Sessions, drafts, pipeline state, and uploads use an in-memory development store.
- Synthetic patient records and deterministic report content remain behind the same APIs used in configured mode.

Add credentials incrementally. Cortex automatically switches each service from
`demo` to `configured` mode:

```bash
npm run seed:redis          # after REDIS_URL is configured
npm run typecheck
```

### Seed Redis

```bash
# Start Redis (Docker example)
docker run -d -p 6379:6379 redis:7

npm run seed:redis
npm run seed:redis -- --clear   # wipe + re-seed
```

### Synthetic patients

| ID | Name | Referral |
|----|------|----------|
| `pat-001` | Alex Rivera | Post-TBI cognitive changes |
| `pat-002` | Jordan Chen | Progressive memory decline |
| `pat-003` | Sam Okonkwo | ADHD diagnostic clarification |
| `pat-004` | Morgan Walsh | Post-chemo cognitive impairment |

## Agent pipeline (infrastructure)

Single-responsibility agents with focused prompts live in `src/server/ai/agents/`:

- **Wernicke** — ingests transcript + patient data
- **Norm** — interprets test scores against normative data
- **Broca** — drafts report sections
- **Glia** — QA: consistency, completeness, uncertainty flags
- **Band** — shared room protocol used by the pipeline service

Each agent exports a system prompt, input/output types, and a `build*UserMessage()`
helper. The pipeline service sequences work, records agent events, supports
pause/resume, and switches to Anthropic generation when credentials are present.

## Environment variables

See [`.env.example`](.env.example) for all required keys:

- `ANTHROPIC_API_KEY` — Claude agents
- `DEEPGRAM_API_KEY` — speech-to-text
- `REDIS_URL` — patient memory layer
- `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_SERVICE_ACCOUNT_JSON` — auth + drafts
- `ARIZE_SPACE_ID` + `ARIZE_API_KEY` — agent observability
- `SENTRY_DSN` — error monitoring

## Implemented API surface

| Route | Purpose |
|-------|---------|
| `GET /api/health` | Runtime capability and readiness check |
| `GET/POST/DELETE /api/auth/session` | Cookie-backed clinician sessions |
| `GET /api/patients` | Patient index (Redis with fixture fallback) |
| `GET /api/patients/:id` | Patient record |
| `GET /api/workspace` | Patient, draft, QA, pipeline, and capability state |
| `GET/PATCH /api/drafts/:id` | Draft save, flag resolution, and finalization |
| `POST /api/pipeline` | Start a report pipeline |
| `GET/PATCH /api/pipeline/:id` | Read, advance, pause, or resume a run |
| `POST /api/uploads` | Validate and attach session files |
| `POST /api/transcribe` | Deepgram transcription with deterministic fallback |

Firebase Auth provides identity when configured. The server exchanges the Firebase
ID token for an HTTP-only Cortex session, stored in Redis when available.

## Next steps

1. Add production file parsing for PDF/XLSX score sheets.
2. Add organization membership and role-based access controls.
3. Add durable pipeline jobs/queues for multi-instance deployments.
4. Add integration and browser tests to CI.
