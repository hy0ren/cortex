import { context, trace, SpanStatusCode, type Span } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  type SpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import "server-only";
import type { AgentId } from "@/data/contracts";
import { getEnv } from "@/server/config/env";
import {
  createSentryOtlpExporter,
  isSentryOtlpConfigured,
} from "@/server/observability/sentry-otlp";

let provider: BasicTracerProvider | null = null;

function arizeConfig() {
  const { arize } = getEnv();
  const { spaceId, apiKey } = arize;
  if (!spaceId || !apiKey) return null;

  return arize;
}

/** True when Arize OTLP credentials are present. */
export function isArizeConfigured(): boolean {
  return arizeConfig() !== null;
}

function buildSpanProcessors(): SpanProcessor[] {
  const processors: SpanProcessor[] = [];

  const arize = arizeConfig();
  if (arize) {
    processors.push(
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: "https://otlp.arize.com/v1/traces",
          headers: {
            space_id: arize.spaceId,
            api_key: arize.apiKey,
          },
        })
      )
    );
  }

  const sentryExporter = createSentryOtlpExporter();
  if (sentryExporter) {
    processors.push(new BatchSpanProcessor(sentryExporter));
  }

  return processors;
}

/** Initialize OpenTelemetry agent tracing (Arize and/or Sentry OTLP). */
export function initArizeTracing(): BasicTracerProvider | null {
  if (provider) return provider;

  const spanProcessors = buildSpanProcessors();
  if (spanProcessors.length === 0) return null;

  const { arize } = getEnv();
  const resource = resourceFromAttributes({
    "service.name": "cortex",
    "model_id": arize.modelId,
    "model_version": arize.modelVersion,
    ...(isSentryOtlpConfigured() && { "telemetry.backend.sentry": true }),
    ...(isArizeConfigured() && { "telemetry.backend.arize": true }),
  });

  const nodeProvider = new NodeTracerProvider({
    resource,
    spanProcessors,
  });

  nodeProvider.register();
  provider = nodeProvider;
  return provider;
}

export function getAgentTracer() {
  if (!provider) initArizeTracing();
  const version = process.env.ARIZE_MODEL_VERSION ?? "0.1.0";
  return trace.getTracer("cortex-agents", version);
}

export type AgentSpanAttributes = {
  agent: AgentId;
  sessionId: string;
  patientId: string;
  promptTokens?: number;
  completionTokens?: number;
  model?: string;
};

/** Wrap an agent call with an Arize-instrumented span for eval/observability. */
export async function withAgentSpan<T>(
  name: string,
  attributes: AgentSpanAttributes,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const tracer = getAgentTracer();
  return tracer.startActiveSpan(name, async (span) => {
    span.setAttributes({
      "agent.id": attributes.agent,
      "session.id": attributes.sessionId,
      "patient.id": attributes.patientId,
      "llm.model": attributes.model ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
    });

    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/** Record LLM generation metadata on the active span. */
export function recordGeneration(
  input: string,
  output: string,
  meta?: { latencyMs?: number; promptTokens?: number; completionTokens?: number }
) {
  const span = trace.getActiveSpan();
  if (!span) return;
  const { arize } = getEnv();

  span.setAttributes({
    "llm.input_length": input.length,
    "llm.output_length": output.length,
    "openinference.span.kind": "LLM",
    "input.mime_type": "application/json",
    "output.mime_type": "application/json",
    ...(arize.captureContent && {
      "llm.input": input.slice(0, 2000),
      "llm.output": output.slice(0, 2000),
      "input.value": input.slice(0, 2000),
      "output.value": output.slice(0, 2000),
    }),
    ...(meta?.latencyMs !== undefined && { "llm.latency_ms": meta.latencyMs }),
    ...(meta?.promptTokens !== undefined && { "llm.prompt_tokens": meta.promptTokens }),
    ...(meta?.completionTokens !== undefined && {
      "llm.completion_tokens": meta.completionTokens,
    }),
  });
}

/** Flush pending spans — call before process exit in scripts. */
export async function flushArizeTracing(): Promise<void> {
  if (provider) {
    await provider.forceFlush();
  }
}

export { context, trace };
