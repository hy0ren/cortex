import { listPatients } from "@/server/persistence/patient-repository";
import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";

export async function GET() {
  try {
    await requireRequestSession();
    return ok({ patients: await listPatients() });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return fail("UNAUTHORIZED", error.message, 401);
    }
    return routeError(error);
  }
}
