import { randomUUID } from "crypto";
import type { UploadedAsset } from "@/data/contracts";
import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { getMemoryStore } from "@/server/persistence/memory-store";

export async function POST(request: Request) {
  try {
    const session = await requireRequestSession();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("INVALID_FILE", "A file is required");
    if (file.size > 25 * 1024 * 1024) return fail("FILE_TOO_LARGE", "Files must be 25MB or smaller");

    const kind: UploadedAsset["kind"] = file.type.startsWith("audio/")
      ? "audio"
      : /\.(csv|xlsx?|json)$/i.test(file.name)
        ? "scores"
        : "document";
    const asset: UploadedAsset = {
      id: randomUUID(),
      name: file.name,
      kind,
      size: file.size,
      status: kind === "audio" ? "parsed" : "uploaded",
      detail:
        kind === "audio"
          ? "Ready for transcription"
          : "Validated and attached; structured parsing is pending",
    };
    const uploads = getMemoryStore().uploads.get(session.user.id) ?? [];
    getMemoryStore().uploads.set(session.user.id, [...uploads, asset]);
    return ok({ asset }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
