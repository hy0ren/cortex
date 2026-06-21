import * as Sentry from "@sentry/nextjs";

export async function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    debug: false,
  });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      const { initArizeTracing } = await import("@/server/observability/arize");
      // Exports agent spans to Arize and/or Sentry OTLP when configured.
      initArizeTracing();
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
