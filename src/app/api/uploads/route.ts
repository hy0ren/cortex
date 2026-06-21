import { randomUUID } from "crypto";
import type { UploadedAsset } from "@/data/contracts";
import { requireRequestSession } from "@/server/auth/request-session";
import { fail, ok, routeError } from "@/server/http/api-response";
import { getMemoryStore } from "@/server/persistence/memory-store";
import { parseFileToTestScores } from "@/server/data/file-parser";

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
    const asset: UploadedAsset & { parsedScores?: any[] } = {
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

    if (kind === "scores") {
      try {
        const scores = await parseFileToTestScores(file);
        asset.status = "parsed";
        asset.detail = `Successfully parsed ${scores.length} scores. Awaiting review.`;
        asset.parsedScores = scores;
      } catch (err) {
        asset.status = "error";
        asset.detail = "Failed to parse file format.";
      }
    }

    const uploads = getMemoryStore().uploads.get(session.user.id) ?? [];
    getMemoryStore().uploads.set(session.user.id, [...uploads, asset]);
    return ok({ asset }, { status: 201 });
  } catch (error) {
    return routeError(error, { route: "uploads.create" });
  }
}
