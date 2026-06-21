import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { storeEncounter } from "@/server/persistence/redis/encounter-store";
import type { Encounter } from "@/data/contracts";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRequestSession();
    const body = await request.json();
    
    if (!body.patientId) {
      return fail("INVALID_REQUEST", "patientId is required");
    }

    const encounter: Encounter = {
      id: randomUUID(),
      patientId: body.patientId,
      clinicianId: session.user.id,
      status: "scheduled",
      appointmentDate: new Date().toISOString(),
      referralReason: "Routine Evaluation",
      transcript: "",
      testBattery: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storeEncounter(encounter);

    return ok({ encounter }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error, { route: "encounters.create" });
  }
}
