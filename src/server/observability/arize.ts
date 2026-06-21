import { context, trace, SpanStatusCode, type Span } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BasicTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import "server-only";
import type { AgentId } from "@/data/contracts";

let provider: BasicTracerProvider | null = null;

function arizeConfig() {
  const spaceId = process.env.ARIZE_SPACE_ID;
  const apiKey = process.env.ARIZE_API_KEY;
  if (!spaceId || !apiKey) return null;

  return {
    spaceId,
    apiKey,
    modelId: process.env.ARIZE_MODEL_ID ?? "cortex-agents",
    modelVersion: process.env.ARIZE_MODEL_VERSION ?? "0.1.0",
  };
}

/** True when Arize OTLP credentials are present. */
export function isArizeConfigured(): boolean {
  return arizeConfig() !== null;
}

/** Initialize OpenTelemetry exporter pointed at Arize Phoenix/AX. No-op if unconfigured. */
export function initArizeTracing(): BasicTracerProvider | null {
  if (provider) return provider;

  const arize = arizeConfig();
  if (!arize) return null;

  const exporter = new OTLPTraceExporter({
    url: "https://otlp.arize.com/v1/traces",
    headers: {
      space_id: arize.spaceId,
      api_key: arize.apiKey,
    },
  });

  const resource = resourceFromAttributes({
    "service.name": "cortex",
    "model_id": arize.modelId,
    "model_version": arize.modelVersion,
  });

  const nodeProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
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

  span.setAttributes({
    "llm.input": input.slice(0, 2000),
    "llm.output": output.slice(0, 2000),
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
