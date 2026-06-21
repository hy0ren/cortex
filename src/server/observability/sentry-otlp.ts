import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import "server-only";
import { getEnv } from "@/server/config/env";

function configured(value: string | undefined): boolean {
  return Boolean(value && !value.includes("your-"));
}

/** True when Sentry OTLP endpoint + DSN are present for agent trace export. */
export function isSentryOtlpConfigured(): boolean {
  const { sentry } = getEnv();
  return configured(sentry.otlpEndpoint) && configured(sentry.dsn);
}

/** Public key embedded in the Sentry DSN (used for OTLP auth). */
export function getSentryPublicKeyFromDsn(dsn: string): string {
  return new URL(dsn).username;
}

/** Normalize base OTLP URL to the traces signal path expected by Sentry. */
export function getSentryOtlpTracesUrl(endpoint: string): string {
  const normalized = endpoint.replace(/\/$/, "");
  if (normalized.endsWith("/v1/traces")) return normalized;
  return `${normalized}/v1/traces`;
}

export function createSentryOtlpExporter(): OTLPTraceExporter | null {
  const { sentry } = getEnv();
  if (!isSentryOtlpConfigured()) return null;

  return new OTLPTraceExporter({
    url: getSentryOtlpTracesUrl(sentry.otlpEndpoint),
    headers: {
      "x-sentry-auth": `sentry sentry_key=${getSentryPublicKeyFromDsn(sentry.dsn)}`,
    },
  });
}
