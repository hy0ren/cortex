import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { findPatient } from "@/server/persistence/patient-repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRequestSession();
    const { id } = await context.params;
    const patient = await findPatient(id);
    if (!patient) return fail("NOT_FOUND", "Patient not found", 404);
    return ok({ patient });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error, { route: "patients.get" });
  }
}
