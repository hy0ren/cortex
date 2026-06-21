import * as Sentry from "@sentry/nextjs";

export function initSentryServer() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    debug: false,
  });
}

export function captureAgentError(
  error: unknown,
  context: { agent: string; sessionId?: string; patientId?: string }
) {
  Sentry.withScope((scope) => {
    scope.setTag("agent", context.agent);
    if (context.sessionId) scope.setTag("session_id", context.sessionId);
    if (context.patientId) scope.setTag("patient_id", context.patientId);
    Sentry.captureException(error);
  });
}

export { Sentry };
