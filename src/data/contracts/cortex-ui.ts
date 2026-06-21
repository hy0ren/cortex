export type FlagSeverity = "verify" | "note";

export type GliaFlag = {
  id: string;
  section: string;
  severity: FlagSeverity;
  title: string;
  detail: string;
};

export type WaveBar = {
  h: string;
  d: string;
  c: string;
};

export type TestResult = {
  measure: string;
  score: number;
  percentile: number;
  classification: string;
  highlight: boolean;
  warn?: boolean;
  alert?: boolean;
};
