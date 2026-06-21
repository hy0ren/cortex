import * as xlsx from "xlsx";
import { parse as csvParse } from "csv-parse/sync";
import type { TestScore } from "@/data/contracts";

type ScoreRow = Record<string, unknown>;

function mapRowToTestScore(row: ScoreRow): TestScore | null {
  const normalized = Object.keys(row).reduce((acc, key) => {
    acc[key.toLowerCase().trim()] = row[key];
    return acc;
  }, {} as ScoreRow);

  const testName = normalized["test"] || normalized["measure"] || normalized["test name"];
  const subtest = normalized["subtest"] || normalized["subtest name"];
  const standardScoreStr = normalized["standard score"] || normalized["ss"] || normalized["score"];
  const percentileStr = normalized["percentile"] || normalized["%ile"];
  const classification = normalized["classification"] || normalized["category"];

  if (!testName || !standardScoreStr) return null;

  const standardScore = Number.parseFloat(String(standardScoreStr));
  const percentile = Number.parseFloat(String(percentileStr ?? ""));

  if (isNaN(standardScore)) return null;

  return {
    test: String(testName),
    subtest: subtest ? String(subtest) : undefined,
    standardScore,
    percentile: isNaN(percentile) ? 50 : percentile,
    classification: classification ? String(classification) : "Average",
  };
}

export async function parseFileToTestScores(file: File): Promise<TestScore[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.toLowerCase();

  if (filename.endsWith(".csv")) {
    const records: unknown[] = csvParse(buffer, {
      columns: true,
      skip_empty_lines: true,
    });
    return records
      .filter((row): row is ScoreRow => typeof row === "object" && row !== null)
      .map(mapRowToTestScore)
      .filter((score): score is TestScore => score !== null);
  } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = xlsx.utils.sheet_to_json<ScoreRow>(firstSheet);
    return records.map(mapRowToTestScore).filter((s): s is TestScore => s !== null);
  } else if (filename.endsWith(".json")) {
    const str = buffer.toString("utf-8");
    try {
      const parsed: unknown = JSON.parse(str);
      const scores =
        typeof parsed === "object" && parsed !== null && "scores" in parsed
          ? (parsed as { scores?: unknown }).scores
          : undefined;
      const rows = Array.isArray(parsed)
        ? parsed
        : Array.isArray(scores)
          ? scores
          : [];
      return rows
        .filter((row): row is ScoreRow => typeof row === "object" && row !== null)
        .map(mapRowToTestScore)
        .filter((score): score is TestScore => score !== null);
    } catch {
      return [];
    }
  } else if (filename.endsWith(".pdf")) {
    // PDF score extraction is intentionally deferred for clinician review.
    return [];
  }

  return [];
}
