export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initArizeTracing } = await import("@/server/observability/arize");
    initArizeTracing();
  }
}
