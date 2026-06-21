/**
 * Validated environment variables for Cortex infrastructure.
 * Call `getEnv()` at runtime — never import raw `process.env` in client modules.
 */

export type CortexEnv = {
  anthropic: {
    apiKey: string;
    model: string;
  };
  deepgram: {
    apiKey: string;
  };
  redis: {
    url: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    serviceAccountJson: string;
  };
  arize: {
    spaceId: string;
    apiKey: string;
    modelId: string;
    modelVersion: string;
  };
  sentry: {
    dsn: string;
    org: string;
    project: string;
    authToken: string;
  };
  app: {
    url: string;
  };
};

function requireEnv(key: string, fallback?: string, strict = true): string {
  const value = process.env[key] ?? fallback;
  if (!value && strict) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

function optionalEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

let cached: { env: CortexEnv; strict: boolean } | null = null;

/** Returns validated env. Throws if required server vars are missing (strict in production). */
export function getEnv(options?: { strict?: boolean }): CortexEnv {
  const strict = options?.strict ?? process.env.NODE_ENV === "production";
  if (cached && cached.strict === strict) return cached.env;

  const env: CortexEnv = {
    anthropic: {
      apiKey: requireEnv("ANTHROPIC_API_KEY", undefined, strict),
      model: optionalEnv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"),
    },
    deepgram: {
      apiKey: requireEnv("DEEPGRAM_API_KEY", undefined, strict),
    },
    redis: {
      url: optionalEnv("REDIS_URL", "redis://localhost:6379"),
    },
    firebase: {
      apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY", undefined, strict),
      authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", undefined, strict),
      projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", undefined, strict),
      storageBucket: requireEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", undefined, strict),
      messagingSenderId: requireEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", undefined, strict),
      appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID", undefined, strict),
      serviceAccountJson: requireEnv("FIREBASE_SERVICE_ACCOUNT_JSON", undefined, strict),
    },
    arize: {
      spaceId: requireEnv("ARIZE_SPACE_ID", undefined, strict),
      apiKey: requireEnv("ARIZE_API_KEY", undefined, strict),
      modelId: optionalEnv("ARIZE_MODEL_ID", "cortex-agents"),
      modelVersion: optionalEnv("ARIZE_MODEL_VERSION", "0.1.0"),
    },
    sentry: {
      dsn: optionalEnv("SENTRY_DSN", optionalEnv("NEXT_PUBLIC_SENTRY_DSN")),
      org: optionalEnv("SENTRY_ORG"),
      project: optionalEnv("SENTRY_PROJECT", "cortex"),
      authToken: optionalEnv("SENTRY_AUTH_TOKEN"),
    },
    app: {
      url: optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    },
  };

  cached = { env, strict };
  return env;
}

/** Safe subset for client-side Firebase init (public keys only). */
export function getPublicFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

/** Reset cache — useful in tests. */
export function resetEnvCache() {
  cached = null;
}
