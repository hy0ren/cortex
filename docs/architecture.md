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
