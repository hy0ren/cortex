import { NextRequest } from "next/server";
import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { getEncounter, storeEncounter } from "@/server/persistence/redis/encounter-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRequestSession();
    const { id } = await params;
    const body = await request.json();
    
    if (typeof body.transcript !== "string") {
      return fail("INVALID_REQUEST", "Transcript must be a string");
    }

    const encounter = await getEncounter(id);
    if (!encounter) {
      return fail("NOT_FOUND", "Encounter not found", 404);
    }

    encounter.transcript = body.transcript;
    await storeEncounter(encounter);

    return ok({ encounter });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error, { route: "encounters.transcript.update" });
  }
}
