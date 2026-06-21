# Cortex

Documentation copilot for neuropsychologists — turns patient visits (voice transcript + structured test scores) into clinically-structured neuropsychological reports.

This repo currently contains **infrastructure only**. Frontend routes and API handlers are built separately.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) + TypeScript | Vercel deploy target |
| Styling | Tailwind CSS v4 + shadcn/ui | UI primitives (in `src/components/ui/`) |
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
├── agents/           # Wernicke, Norm, Broca, Glia, Band — prompts + types
├── data/fixtures/    # 4 synthetic patients with full test batteries
├── lib/
│   ├── anthropic.ts  # Claude client wrapper
│   ├── deepgram/     # Speech-to-text
│   ├── firebase/     # Auth (client) + drafts (Firestore admin)
│   ├── redis/        # Patient store + vector search
│   ├── observability/# Arize tracing + Sentry helpers
│   └── env.ts        # Validated environment config
├── types/            # Shared domain types
└── instrumentation.ts
scripts/
└── seed-redis.ts     # Seed fixtures into Redis
```

## Quick start

```bash
cp .env.example .env
# Fill in keys (REDIS_URL required for seeding)

npm install
npm run seed:redis          # requires Redis running locally
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

Four single-responsibility agents with focused prompts in `src/agents/`:

- **Wernicke** — ingests transcript + patient data
- **Norm** — interprets test scores against normative data
- **Broca** — drafts report sections
- **Glia** — QA: consistency, completeness, uncertainty flags
- **Band** — shared room orchestrator (stub; wire in API layer)

Each agent exports a system prompt, input/output types, and a `build*UserMessage()` helper. Orchestration and `/api/generate-report` streaming are **not included** in this infrastructure layer.

## Environment variables

See [`.env.example`](.env.example) for all required keys:

- `ANTHROPIC_API_KEY` — Claude agents
- `DEEPGRAM_API_KEY` — speech-to-text
- `REDIS_URL` — patient memory layer
- `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_SERVICE_ACCOUNT_JSON` — auth + drafts
- `ARIZE_SPACE_ID` + `ARIZE_API_KEY` — agent observability
- `SENTRY_DSN` — error monitoring

## Next steps (not in this layer)

1. Port `./design` HTML into Next.js routes/components
2. Build `/api/generate-report` with Band orchestration + SSE streaming
3. Wire Pipeline view to agent status events
4. Connect Firebase Auth login flow
