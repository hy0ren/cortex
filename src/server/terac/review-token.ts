import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { getEnv, requireEnvValue } from "@/server/config/env";

function sign(payload: string): string {
  const secret = requireEnvValue(getEnv().terac.reviewSecret, "TERAC_REVIEW_SECRET");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Mints an opaque, expiring token for a Terac reviewer to access one pipeline run's packet. */
export function mintReviewToken(pipelineRunId: string, expiresInMs = 14 * 24 * 60 * 60 * 1000): string {
  const expiresAt = Date.now() + expiresInMs;
  const payload = `${pipelineRunId}.${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifyReviewToken(token: string): { pipelineRunId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [pipelineRunId, expiresAtRaw, signature] = decoded.split(".");
    if (!pipelineRunId || !expiresAtRaw || !signature) return null;

    const expected = sign(`${pipelineRunId}.${expiresAtRaw}`);
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(signature);
    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    if (Date.now() > Number(expiresAtRaw)) return null;
    return { pipelineRunId };
  } catch {
    return null;
  }
}
