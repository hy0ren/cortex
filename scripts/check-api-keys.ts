/**
 * Smoke-test configured API keys from .env.local.
 * Usage: npm run check:keys
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type CheckResult = {
  name: string;
  status: "ok" | "fail" | "skip";
  detail: string;
};

const results: CheckResult[] = [];

function record(name: string, status: CheckResult["status"], detail: string) {
  results.push({ name, status, detail });
}

function hasConfiguredValue(value: string | undefined): value is string {
  return Boolean(value && !value.includes("your-"));
}

async function checkAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY ?? process.env.TOKENROUTER_API_KEY;
  if (!hasConfiguredValue(key)) {
    record("Anthropic (TokenRouter)", "skip", "Anthropic API key not set");
    return;
  }

  try {
    const { getAnthropicClient, getAnthropicModel } = await import(
      "@/server/ai/anthropic"
    );
    const client = getAnthropicClient();
    const model = getAnthropicModel();
    const response = await client.messages.create({
      model,
      max_tokens: 8,
      messages: [{ role: "user", content: "Reply with only: ok" }],
    });
    const block = response.content.find((candidate) => candidate.type === "text");
    const text = block?.type === "text" ? block.text : "";
    record(
      "Anthropic (TokenRouter)",
      "ok",
      `model=${model}, reply="${text.slice(0, 40)}"`
    );
  } catch (error) {
    record(
      "Anthropic (TokenRouter)",
      "fail",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkDeepgram() {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!hasConfiguredValue(key)) {
    record("Deepgram", "skip", "DEEPGRAM_API_KEY not set");
    return;
  }

  try {
    const response = await fetch("https://api.deepgram.com/v1/projects", {
      headers: { Authorization: `Token ${key}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const body = await response.text();
      record("Deepgram", "fail", `HTTP ${response.status}: ${body.slice(0, 120)}`);
      return;
    }
    const data = (await response.json()) as { projects?: unknown[] };
    record(
      "Deepgram",
      "ok",
      `${data.projects?.length ?? 0} project(s) accessible`
    );
  } catch (error) {
    record(
      "Deepgram",
      "fail",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkRedis() {
  const configured =
    hasConfiguredValue(process.env.REDIS_URL) ||
    (hasConfiguredValue(process.env.REDIS_CLOUD_ACCOUNT_KEY) &&
      hasConfiguredValue(process.env.REDIS_CLOUD_SECRET_KEY));
  if (!configured) {
    record("Redis", "skip", "Redis connection credentials not set");
    return;
  }

  try {
    const { connectRedis, disconnectRedis } = await import(
      "@/server/persistence/redis"
    );
    const client = await connectRedis();
    const pong = await client.ping();
    await disconnectRedis();
    record("Redis", "ok", `PING → ${pong}`);
  } catch (error) {
    record("Redis", "fail", error instanceof Error ? error.message : String(error));
  }
}

async function checkFirebaseClient() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!hasConfiguredValue(apiKey) || !hasConfiguredValue(projectId)) {
    record("Firebase (client)", "skip", "NEXT_PUBLIC_FIREBASE_* not set");
    return;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "key-check@cortex.local",
          password: "invalid-password-for-smoke-test",
          returnSecureToken: true,
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );
    const data = (await response.json()) as {
      error?: { message?: string };
    };
    const message = data.error?.message ?? "";
    const validKeyMessages = [
      "INVALID_LOGIN_CREDENTIALS",
      "EMAIL_NOT_FOUND",
      "INVALID_PASSWORD",
      "USER_DISABLED",
    ];
    if (validKeyMessages.some((code) => message.includes(code))) {
      record(
        "Firebase (client)",
        "ok",
        `API key valid for Auth (project=${projectId})`
      );
      return;
    }
    if (message.includes("API_KEY_INVALID")) {
      record("Firebase (client)", "fail", message);
      return;
    }
    record(
      "Firebase (client)",
      message ? "fail" : "ok",
      message || `HTTP ${response.status}`
    );
  } catch (error) {
    record(
      "Firebase (client)",
      "fail",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkFirebaseAdmin() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!hasConfiguredValue(json)) {
    record("Firebase Admin", "skip", "FIREBASE_SERVICE_ACCOUNT_JSON not set");
    return;
  }

  try {
    const { getFirebaseAdmin } = await import("@/server/auth/firebase-admin");
    getFirebaseAdmin();
    record("Firebase Admin", "ok", "initialized");
  } catch (error) {
    record(
      "Firebase Admin",
      "fail",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkAgentTracing() {
  const arizeConfigured =
    hasConfiguredValue(process.env.ARIZE_SPACE_ID) &&
    hasConfiguredValue(process.env.ARIZE_API_KEY);
  const sentryConfigured =
    hasConfiguredValue(process.env.SENTRY_OTLP_ENDPOINT) &&
    hasConfiguredValue(
      process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
    );

  if (!arizeConfigured && !sentryConfigured) {
    record("Agent tracing", "skip", "Arize/Sentry OTLP credentials not set");
    return;
  }

  try {
    const { initArizeTracing, getAgentTracer, flushArizeTracing } = await import(
      "@/server/observability/arize"
    );
    const provider = initArizeTracing();
    if (!provider) {
      record("Agent tracing", "fail", "Tracing provider was not initialized");
      return;
    }
    const tracer = getAgentTracer();
    await tracer.startActiveSpan("cortex-key-check", async (span) => {
      span.setAttribute("check", "api-key-smoke-test");
      span.end();
    });
    await flushArizeTracing();
    const backends = [
      arizeConfigured ? "Arize" : "",
      sentryConfigured ? "Sentry" : "",
    ].filter(Boolean);
    record("Agent tracing", "ok", `test span exported to ${backends.join(" + ")}`);
  } catch (error) {
    record(
      "Agent tracing",
      "fail",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkSentryAuthToken() {
  const token = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT ?? "cortex";
  if (!hasConfiguredValue(token)) {
    record("Sentry (auth token)", "skip", "SENTRY_AUTH_TOKEN not set");
    return;
  }
  if (!hasConfiguredValue(org)) {
    record("Sentry (auth token)", "skip", "SENTRY_ORG not set");
    return;
  }

  try {
    const endpoints = [
      `https://sentry.io/api/0/organizations/${org}/`,
      `https://sentry.io/api/0/projects/${org}/${project}/`,
    ];
    let lastError = "";
    for (const url of endpoints) {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      });
      if (response.ok) {
        const data = (await response.json()) as { slug?: string; name?: string };
        record(
          "Sentry (auth token)",
          "ok",
          `token valid (${data.slug ?? data.name ?? org})`
        );
        return;
      }
      lastError = `HTTP ${response.status}: ${(await response.text()).slice(0, 120)}`;
    }
    record(
      "Sentry (auth token)",
      "fail",
      `${lastError} — token may be release-only without API read scope`
    );
  } catch (error) {
    record(
      "Sentry (auth token)",
      "fail",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkSentryDsn() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!hasConfiguredValue(dsn)) {
    record("Sentry (DSN)", "skip", "SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN not set");
    return;
  }

  try {
    const url = new URL(dsn);
    const valid = Boolean(url.username && url.hostname && url.pathname !== "/");
    record(
      "Sentry (DSN)",
      valid ? "ok" : "fail",
      valid ? `valid DSN for ${url.hostname}` : "Incomplete DSN URL"
    );
  } catch {
    record("Sentry (DSN)", "fail", "Invalid DSN URL");
  }
}

async function checkNormativeCorpus() {
  if (!hasConfiguredValue(process.env.REDIS_URL) &&
      !(hasConfiguredValue(process.env.REDIS_CLOUD_ACCOUNT_KEY) &&
        hasConfiguredValue(process.env.REDIS_CLOUD_SECRET_KEY))) {
    record("Normative corpus", "skip", "Redis not configured");
    return;
  }

  try {
    const { countNormativeChunks, seedNormativeCorpus } = await import(
      "@/server/persistence/redis"
    );
    let count = await countNormativeChunks();
    if (count === 0) {
      count = await seedNormativeCorpus();
    }
    record("Normative corpus", "ok", `${count} chunk(s) indexed`);
  } catch (error) {
    record(
      "Normative corpus",
      "fail",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkBand() {
  const hasAnyBand =
    hasConfiguredValue(process.env.BAND_WERNICKE_AGENT_ID) ||
    hasConfiguredValue(process.env.BAND_API_KEY);
  if (!hasAnyBand) {
    record("Band", "skip", "Band credentials not set");
    return;
  }

  try {
    const { isBandConfigured } = await import("@/server/band/room-client");
    if (!isBandConfigured()) {
      record("Band", "fail", "Remote agent ids/keys or BAND_SYNC_SECRET incomplete");
      return;
    }

    const restUrl = process.env.THENVOI_REST_URL ?? "https://app.band.ai/api/v1/agent";
    const wernickeKey =
      process.env.BAND_WERNICKE_API_KEY ?? process.env.BAND_API_KEY ?? "";
    const response = await fetch(`${restUrl.replace(/\/$/, "")}/me`, {
      headers: { "X-API-Key": wernickeKey, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      const profile = (await response.json()) as { handle?: string; name?: string };
      record(
        "Band",
        "ok",
        `remote agents configured${profile.handle ? ` (@${profile.handle})` : ""}`
      );
      return;
    }

    record(
      "Band",
      "fail",
      `Wernicke agent auth failed (${response.status}) — check BAND_WERNICKE_API_KEY`
    );
  } catch (error) {
    record("Band", "fail", error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  await checkAnthropic();
  await checkDeepgram();
  await checkRedis();
  await checkNormativeCorpus();
  await checkFirebaseClient();
  await checkFirebaseAdmin();
  await checkAgentTracing();
  await checkSentryAuthToken();
  await checkSentryDsn();
  await checkBand();

  console.log("\nAPI key check results:\n");
  for (const { name, status, detail } of results) {
    const icon = status === "ok" ? "✓" : status === "skip" ? "–" : "✗";
    console.log(`  ${icon} ${name}: ${detail}`);
  }

  const failed = results.filter((result) => result.status === "fail").length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
