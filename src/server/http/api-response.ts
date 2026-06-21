import "server-only";
import { NextResponse } from "next/server";
import type { ApiFailure, ApiSuccess } from "@/data/contracts";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, init);
}

export function fail(
  code: string,
  message: string,
  status = 400
) {
  return NextResponse.json<ApiFailure>(
    { ok: false, error: { code, message } },
    { status }
  );
}

export function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  if (message === "Authentication required") {
    return fail("UNAUTHORIZED", message, 401);
  }
  console.error("[cortex-api]", error);
  return fail(
    "INTERNAL_ERROR",
    process.env.NODE_ENV === "production" ? "Unexpected server error" : message,
    500
  );
}
