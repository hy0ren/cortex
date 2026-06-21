export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      const { initArizeTracing } = await import("@/server/observability/arize");
      initArizeTracing();
    }
  }
}
