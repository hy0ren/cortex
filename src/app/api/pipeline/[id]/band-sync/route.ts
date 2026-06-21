import { fail, ok, routeError } from "@/server/http/api-response";
import {
  executePipelineAgent,
  verifyBandSyncSecret,
} from "@/server/pipeline/band-sync-service";
import type { AgentId } from "@/data/contracts";
import { getPipelineRun } from "@/server/pipeline/pipeline-service";

const VALID_AGENTS: AgentId[] = ["wernicke", "norm", "engram", "broca", "glia"];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyBandSyncSecret(request)) {
      return fail("UNAUTHORIZED", "Invalid band sync secret");
    }

    const { id } = await context.params;
    const body = (await request.json()) as { agent?: AgentId; action?: string };
    const agent = body.agent;
    if (!agent || !VALID_AGENTS.includes(agent)) {
      return fail("INVALID_AGENT", "A valid agent id is required");
    }

    const run = await executePipelineAgent(id, agent);
    return ok({ run });
  } catch (error) {
    return routeError(error, { route: "pipeline.band-sync" });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyBandSyncSecret(request)) {
      return fail("UNAUTHORIZED", "Invalid band sync secret");
    }

    const { id } = await context.params;
    const run = getPipelineRun(id);
    if (!run) return fail("NOT_FOUND", "Pipeline run not found");
    return ok({ run });
  } catch (error) {
    return routeError(error, { route: "pipeline.band-sync.get" });
  }
}
