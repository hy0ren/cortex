# Cortex architecture

Cortex uses three top-level application layers with one-way dependencies:

```text
client ──────► data ◄────── server
   │                         │
   └──── Next.js app routes ─┘
```

## Client

`src/client` contains code that is safe to ship to the browser: feature components,
UI state, public environment values, Firebase Auth, and shared presentation helpers.
Client modules may import `src/data`, but must not import `src/server`.

## Server

`src/server` owns private credentials and external infrastructure: AI agents,
Anthropic, Deepgram, Firebase Admin, Redis, Firestore drafts, and observability.
Entry modules use `server-only` so accidental client imports fail at build time.

Server integrations sit behind credential-aware services. Each service reports
`configured` or `demo` mode through `/api/health`:

- Firebase Admin verifies production ID tokens and persists report drafts.
- Redis stores server sessions and patient history.
- Anthropic generates report content at pipeline completion.
- Deepgram transcribes uploaded visit audio.
- In-memory adapters provide the same contracts when credentials are absent.

## Data

`src/data/contracts` is the shared language between browser and server.
`src/data/fixtures` contains synthetic domain records, while `src/data/demo`
contains deterministic presentation data for the current prototype. Neither
folder performs I/O.

## Frontend feature shape

The Cortex feature keeps its app shell, routing component, state model, reusable
feature components, and screens separate:

```text
src/client/features/cortex/
├── components/
├── model/
├── screens/
├── cortex-app.tsx
└── cortex-screen.tsx
```

New behavior should enter through the feature model or a typed data contract,
not through direct infrastructure calls from a screen component.

## Authentication flow

```text
Login
  ├─ Google OAuth → Firebase ID token
  └─ Explicit demo access → synthetic clinician identity
          ↓
POST /api/auth/session
          ↓
HTTP-only Cortex session cookie
          ↓
Redis session store or in-memory fallback
```

Client components never receive Redis credentials or Firebase Admin credentials.

## Persistence lanes

- Redis: authenticated sessions, patient records, history, and retrieval.
- Firestore: live report drafts and review state only.
- Memory fallback: development-only sessions, drafts, runs, and upload metadata.
- Fixtures/demo: synthetic records and deterministic report content only.
