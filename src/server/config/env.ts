/**
 * Validated environment variables for Cortex infrastructure.
 * Call `getEnv()` at runtime — never import raw `process.env` in client modules.
 */
import "server-only";

export type CortexEnv = {
  anthropic: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  deepgram: {
    apiKey: string;
  };
  redis: {
    url: string;
    cloudAccountKey: string;
    cloudSecretKey: string;
    cloudSubscriptionId: string;
    cloudDatabaseId: string;
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
    captureContent: boolean;
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

function optionalEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

let cached: CortexEnv | null = null;

/** Returns server environment values. Each integration validates its own required fields. */
export function getEnv(): CortexEnv {
  if (cached) return cached;

  const env: CortexEnv = {
    anthropic: {
      apiKey: optionalEnv("ANTHROPIC_API_KEY", optionalEnv("TOKENROUTER_API_KEY")),
      baseUrl: optionalEnv("ANTHROPIC_BASE_URL", optionalEnv("TOKENROUTER_BASE_URL")),
      model: optionalEnv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"),
    },
    deepgram: {
      apiKey: optionalEnv("DEEPGRAM_API_KEY"),
    },
    redis: {
      url: optionalEnv("REDIS_URL"),
      cloudAccountKey: optionalEnv("REDIS_CLOUD_ACCOUNT_KEY"),
      cloudSecretKey: optionalEnv("REDIS_CLOUD_SECRET_KEY"),
      cloudSubscriptionId: optionalEnv("REDIS_CLOUD_SUBSCRIPTION_ID"),
      cloudDatabaseId: optionalEnv("REDIS_CLOUD_DATABASE_ID"),
    },
    firebase: {
      apiKey: optionalEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
      authDomain: optionalEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
      projectId: optionalEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
      storageBucket: optionalEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: optionalEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
      appId: optionalEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
      serviceAccountJson: optionalEnv("FIREBASE_SERVICE_ACCOUNT_JSON"),
    },
    arize: {
      spaceId: optionalEnv("ARIZE_SPACE_ID"),
      apiKey: optionalEnv("ARIZE_API_KEY"),
      modelId: optionalEnv("ARIZE_MODEL_ID", "cortex-agents"),
      modelVersion: optionalEnv("ARIZE_MODEL_VERSION", "0.1.0"),
      captureContent: optionalEnv("ARIZE_CAPTURE_CONTENT") === "true",
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

  cached = env;
  return env;
}

export function requireEnvValue(value: string, key: string): string {
  if (!value || value.includes("your-")) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/** Reset cache — useful in tests. */
export function resetEnvCache() {
  cached = null;
}
