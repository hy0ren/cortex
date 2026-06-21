import { fail, ok, routeError } from "@/server/http/api-response";
import { getEncounter, storeEncounter } from "@/server/persistence/redis/encounter-store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const encounter = await getEncounter(id);
    if (!encounter) return fail("NOT_FOUND", "Encounter not found", 404);

    const body = await request.json();
    if (!body.concerns) {
        return fail("INVALID_REQUEST", "Concerns are required");
    }

    encounter.intake = {
        concerns: body.concerns,
        symptoms: body.symptoms || [],
        currentMedications: body.currentMedications || [],
        notes: body.notes || "",
    };
    encounter.updatedAt = new Date().toISOString();

    await storeEncounter(encounter);

    return ok({ success: true });
  } catch (error) {
    return routeError(error, { route: "encounters.intake.post" });
  }
}
