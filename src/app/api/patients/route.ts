import { listPatients, createPatient } from "@/server/persistence/patient-repository";
import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { randomUUID } from "crypto";
import type { PatientRecord } from "@/data/contracts";

export async function GET() {
  try {
    await requireRequestSession();
    return ok({ patients: await listPatients() });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error, { route: "patients.list" });
  }
}

export async function POST(request: Request) {
  try {
    await requireRequestSession();
    const body = await request.json();
    
    if (!body.name || !body.sex || !body.dateOfBirth) {
      return fail("INVALID_REQUEST", "Name, sex, and date of birth are required");
    }

    let mappedSex: "M" | "F" | "X" = "X";
    if (body.sex === "Male") mappedSex = "M";
    if (body.sex === "Female") mappedSex = "F";

    const patient: PatientRecord = {
      id: randomUUID(),
      mrn: body.mrn || `MRN-${Math.floor(Math.random() * 1000000)}`,
      demographics: {
        name: body.name,
        sex: mappedSex,
        dateOfBirth: body.dateOfBirth,
        education: body.education || "Unknown",
        handedness: body.handedness || "Right",
        referralReason: "Initial Evaluation",
      },
      history: {
        medical: [],
        psychiatric: [],
        medications: [],
        priorEvaluations: [],
      },
      priorReports: [],
    };

    await createPatient(patient);
    return ok({ patient }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error, { route: "patients.create" });
  }
}
