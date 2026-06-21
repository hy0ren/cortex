export type CortexScreen = "intake" | "pipeline" | "report" | "history";

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

export type NavStyle = {
  bg: string;
  bar: string;
  col: string;
};
