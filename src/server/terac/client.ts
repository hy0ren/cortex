import "server-only";
import { getEnv, requireEnvValue } from "@/server/config/env";

function teracHeaders(): HeadersInit {
  const { terac } = getEnv();
  return {
    Authorization: `Bearer ${requireEnvValue(terac.apiKey, "TERAC_API_KEY")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function teracBase(): string {
  return getEnv().terac.baseUrl.replace(/\/$/, "");
}

async function teracRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  const response = await fetch(`${teracBase()}${path}`, {
    method: init.method ?? "GET",
    headers: teracHeaders(),
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Terac request failed (${response.status}) ${path}: ${text.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

export type TeracScreeningQuestionInput = {
  key: string;
  text: string;
  pick: "one" | "many";
  answers: Array<{ text: string; qualify_logic: "qualify" | "reject" | "may" | "must" }>;
};

export type TeracTaskInput = {
  sequence: number;
  task_type: string;
  review_type: "auto_approve" | "manual";
  task_url: string;
  duration_minutes: number;
};

export type CreateOpportunityInput = {
  title: string;
  project_id: string;
  num_participants: number;
  business_type: "b2c" | "b2b";
  tasks: TeracTaskInput[];
  description?: string;
  screening_questions?: TeracScreeningQuestionInput[];
  expected_days_to_complete?: number;
};

export type TeracOpportunity = {
  id: string;
  title: string;
  status: string;
  num_participants: number;
  created_at: string;
  updated_at: string;
  launched_at?: string | null;
};

export type TeracSubmission = {
  id: string;
  opportunity_id: string;
  status: "in_progress" | "awaiting_review" | "approved" | "rejected";
  participant_id: string;
  created_at: string;
  updated_at: string;
};

export async function createOpportunity(input: CreateOpportunityInput): Promise<TeracOpportunity> {
  return teracRequest<TeracOpportunity>("/opportunities", { method: "POST", body: input });
}

export async function launchOpportunity(opportunityId: string): Promise<TeracOpportunity> {
  return teracRequest<TeracOpportunity>(`/opportunities/${opportunityId}/launch`, { method: "POST" });
}

export async function listSubmissions(
  opportunityId: string,
  options: { status?: TeracSubmission["status"]; cursor?: string } = {}
): Promise<{ data: TeracSubmission[]; pagination: { next_cursor: string | null; has_more: boolean } }> {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.cursor) params.set("cursor", options.cursor);
  const query = params.toString() ? `?${params.toString()}` : "";
  return teracRequest(`/opportunities/${opportunityId}/submissions${query}`);
}

export async function getSubmission(submissionId: string): Promise<TeracSubmission> {
  return teracRequest<TeracSubmission>(`/submissions/${submissionId}`);
}

export async function approveSubmission(submissionId: string): Promise<TeracSubmission> {
  return teracRequest<TeracSubmission>(`/submissions/${submissionId}/approve`, { method: "POST" });
}

export async function rejectSubmission(submissionId: string): Promise<TeracSubmission> {
  return teracRequest<TeracSubmission>(`/submissions/${submissionId}/reject`, { method: "POST" });
}
