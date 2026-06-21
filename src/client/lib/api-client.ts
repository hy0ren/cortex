import type { ApiResponse } from "@/data/contracts";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  const payload = await response.json() as ApiResponse<T>;
  if (!payload.ok) {
    throw new ApiClientError(payload.error.message, payload.error.code, response.status);
  }
  return payload.data;
}
