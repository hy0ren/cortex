import "server-only";
import { getEnv } from "@/server/config/env";

function isConfiguredValue(value: string): boolean {
  return Boolean(value && !value.includes("your-"));
}

export function isTeracConfigured(): boolean {
  const { terac } = getEnv();
  return (
    isConfiguredValue(terac.apiKey) &&
    isConfiguredValue(terac.projectId) &&
    isConfiguredValue(terac.reviewSecret)
  );
}
