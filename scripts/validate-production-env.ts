const required = [
  "REDIS_URL",
  "ANTHROPIC_API_KEY",
  "DEEPGRAM_API_KEY",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "NEXT_PUBLIC_APP_URL",
] as const;

function isConfigured(value: string | undefined): boolean {
  return Boolean(value?.trim() && !value.includes("your-"));
}

const missing = required.filter((key) => !isConfigured(process.env[key]));
const errors: string[] = [];

if (missing.length > 0) {
  errors.push(`Missing production variables: ${missing.join(", ")}`);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (isConfigured(appUrl) && !appUrl?.startsWith("https://")) {
  errors.push("NEXT_PUBLIC_APP_URL must use https:// in production");
}

if (process.env.ALLOW_DEMO_AUTH === "true") {
  errors.push("ALLOW_DEMO_AUTH must not be true in production");
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (isConfigured(serviceAccount)) {
  try {
    const parsed = JSON.parse(serviceAccount ?? "") as {
      project_id?: string;
      private_key?: string;
      client_email?: string;
    };
    if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
      errors.push("FIREBASE_SERVICE_ACCOUNT_JSON is missing required service-account fields");
    }
  } catch {
    errors.push("FIREBASE_SERVICE_ACCOUNT_JSON must be an inline JSON object on Railway");
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[production-env] ${error}`);
  process.exit(1);
}

console.log("[production-env] Required production configuration is present");
