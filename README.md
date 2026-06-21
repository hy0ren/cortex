# Cortex

Documentation copilot for neuropsychologists — turns patient visits (voice transcript + structured test scores) into clinically-structured neuropsychological reports.

This repo contains the Cortex frontend prototype plus server infrastructure.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) + TypeScript | Vercel deploy target |
| Styling | Tailwind CSS v4 + shadcn/ui | UI primitives (in `src/client/components/ui/`) |
| LLM | Anthropic Claude Sonnet | Five-agent pipeline |
| Speech | Deepgram Nova-2 Medical | Visit audio → transcript |
| Memory | Redis | Patient history + vector retrieval |
| Auth | Firebase Auth + Google OAuth | Clinician login |
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

- Enter the synthetic demo workspace without creating an account.
- Sessions, drafts, pipeline state, and uploads use an in-memory development store.
- Synthetic patient records and deterministic report content remain behind the same APIs used in configured mode.

Add credentials incrementally. Cortex automatically switches each service from
`demo` to `configured` mode:

```bash
npm run seed:redis          # after REDIS_URL is configured
npm run seed:norms          # normative RAG corpus for Norm
npm run check:keys
npm run typecheck
```

### Band remote agents

Register five **External Agents** on [app.band.ai](https://app.band.ai). Copy each agent UUID and `band_a_*` key into `.env.local`. **You do not need to add an AI provider in the Band dashboard** — workers authenticate with `band_a_*` keys only; Cortex runs all Claude/TokenRouter inference.

Set `BAND_AGENT_HANDLE_PREFIX` to your Band handle namespace (e.g. `dylancc5`) and generate a random `BAND_SYNC_SECRET`.

Then run Cortex and the remote agent workers in separate terminals:

```bash
# Terminal 1 — Next.js app (creates Band rooms, executes pipeline steps)
npm run dev

# Terminal 2 — five Band remote agents (listen for @mentions, trigger Cortex)
npm run band:workers
```

When Band is configured, the app creates a room via Wernicke's agent key and workers drive the pipeline through `@dylancc5/wernicke` → `@dylancc5/norm` → … handoffs.

### Glia eval (Arize)

```bash
EVAL_VARIANT=glia-on GLIA_ENABLED=true npm run eval:glia
EVAL_VARIANT=glia-off GLIA_ENABLED=false npm run eval:glia
```

### Seed Redis

```bash
# Start Redis (Docker example)
docker run -d -p 6379:6379 redis:7

npm run seed:redis
npm run seed:norms
npm run seed:redis -- --clear   # wipe + re-seed patients
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
- **Engram** — retrieves relevant prior patient history
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

## Arize agent skills (Cursor)

This repo can use the [Arize skills](https://github.com/Arize-ai/arize-skills) plugin
for trace export, experiments, evaluators, and instrumentation workflows via the
`ax` CLI. Skills install locally and are gitignored under `.agents/`.

```bash
# Install all 12 skills (Cursor auto-detected)
npx skills add Arize-ai/arize-skills --skill "*" --yes

# Update later
npx skills update
```

Authenticate the `ax` CLI once (uses the same Arize API key as the app):

```bash
uv tool install arize-ax-cli   # or: pipx install arize-ax-cli
ax profiles create --api-key "$ARIZE_API_KEY"
export ARIZE_SPACE="$ARIZE_SPACE_ID"   # space name or base64 ID from .env.local
```

Useful prompts after install:

- **Instrument tracing:** follow https://arize.com/docs/PROMPT.md (or invoke `arize-instrumentation`)
- **Debug traces:** `use the arize-trace skill to export and analyze recent traces from my project`

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

Firebase Google OAuth provides identity when configured. The server verifies the
Firebase ID token and exchanges it for an HTTP-only Cortex session, stored in
Redis when available. Demo access is available in development and can be enabled
for a deployed judging environment with `ALLOW_DEMO_AUTH=true`.

Before deploying, enable **Google** under Firebase Console → Authentication →
Sign-in method, then add the deployment hostname under Authentication →
Settings → Authorized domains. Keep `ALLOW_DEMO_AUTH=false` for a normal
production deployment.

## Next steps

See [`REMAINING_TASKS.md`](REMAINING_TASKS.md) for the prioritized, actionable
production backlog from the latest repository audit.
