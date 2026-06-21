import type { PatientRecord, ReportDraft } from "@/data/contracts";

export type EncounterRow = {
  id: string;
  date: string;
  badge: string;
  badgeStyle: { color: string; bg: string; border: string };
  title: string;
  summary: string;
  moca?: number;
  active?: boolean;
  extra?: string;
  actions: Array<"openDraft" | "compare" | "openReport" | "openNote">;
};

function parseMoca(summary: string): number | undefined {
  const match = summary.match(/MoCA\s+(\d+)\s*\/\s*30/i);
  return match ? Number(match[1]) : undefined;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildEncounterTimeline(
  patient: PatientRecord,
  draft?: ReportDraft | null
): EncounterRow[] {
  const rows: EncounterRow[] = [];

  if (draft && draft.status !== "finalized") {
    rows.push({
      id: `draft-${draft.id}`,
      date: formatDate(draft.updatedAt),
      badge: draft.status === "review" ? "Review" : "Draft",
      badgeStyle: {
        color: "var(--cortex-warn)",
        bg: "var(--cortex-warn-bg)",
        border: "var(--cortex-warn-border)",
      },
      title: "Comprehensive Neuropsychological Evaluation",
      summary: "Live pipeline draft in progress for the current session.",
      active: true,
      extra: "Today",
      actions: ["openDraft", "compare"],
    });
  }

  for (const report of patient.priorReports) {
    rows.push({
      id: `report-${report.date}-${report.type}`,
      date: formatDate(report.date),
      badge: "Final",
      badgeStyle: {
        color: "var(--cortex-teal-dark)",
        bg: "var(--cortex-teal-tint)",
        border: "transparent",
      },
      title: report.type,
      summary: report.summary,
      moca: parseMoca(report.summary),
      actions: ["openReport", "compare"],
    });
  }

  for (const evaluation of patient.history.priorEvaluations) {
    rows.push({
      id: `eval-${evaluation.date}`,
      date: formatDate(evaluation.date),
      badge: "Intake",
      badgeStyle: {
        color: "var(--cortex-fg-subtle)",
        bg: "var(--cortex-chip-bg)",
        border: "transparent",
      },
      title: evaluation.setting,
      summary: evaluation.summary,
      moca: parseMoca(evaluation.summary),
      actions: ["openNote", "compare"],
    });
  }

  return rows.sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    if (a.active) return -1;
    if (b.active) return 1;
    return bTime - aTime;
  });
}

export function patientInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function patientAgeAndSex(patient: PatientRecord): string {
  const birth = new Date(patient.demographics.dateOfBirth);
  const age = Number.isNaN(birth.getTime())
    ? "?"
    : Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${age}${patient.demographics.sex} · MRN ${patient.mrn}`;
}
