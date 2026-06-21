import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { getEncounter, storeEncounter } from "@/server/persistence/redis/encounter-store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRequestSession();
    const { id } = await params;
    const encounter = await getEncounter(id);
    if (!encounter) return fail("NOT_FOUND", "Encounter not found", 404);
    return ok({ encounter });
  } catch (error) {
    return routeError(error, { route: "encounters.get" });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRequestSession();
    const { id } = await params;
    const encounter = await getEncounter(id);
    if (!encounter) return fail("NOT_FOUND", "Encounter not found", 404);

    if (encounter.clinicianId !== "system" && encounter.clinicianId !== session.user.id) {
        return fail("FORBIDDEN", "Encounter does not belong to this session", 403);
    }

    const body = await request.json();
    
    // Update fields
    if (body.testBattery) {
        encounter.testBattery = body.testBattery;
    }
    if (body.transcript !== undefined) {
        encounter.transcript = body.transcript;
    }
    if (body.status) {
        encounter.status = body.status;
    }

    encounter.updatedAt = new Date().toISOString();
    await storeEncounter(encounter);

    return ok({ encounter });
  } catch (error) {
    return routeError(error, { route: "encounters.patch" });
  }
}
