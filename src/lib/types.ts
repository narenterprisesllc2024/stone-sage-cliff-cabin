export const LCARS_SWATCHES = [
  "orange",
  "peach",
  "gold",
  "lilac",
  "blue",
  "eggplant",
] as const;

export type LcarsSwatch = (typeof LCARS_SWATCHES)[number];

export type AlertStatus = "normal" | "red" | "blue";

export type Journal = {
  id: string;
  name: string;
  code: string;
  color: LcarsSwatch;
  createdAt: number;
};

export type LogKind = "standard" | "supplemental";

export type LogEntry = {
  id: string;
  journalId: string;
  stardate: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  body: string;
  kind: LogKind;
  hasAudio: boolean;
  durationMs: number;
  status: "draft" | "filed";
};

export type Settings = {
  officerName: string;
  rank: string;
  vessel: string;
  registry: string;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  alert: AlertStatus;
  booted: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  officerName: "",
  rank: "Captain",
  vessel: "USS Horizon",
  registry: "NCC-2187",
  soundEnabled: true,
  voiceEnabled: true,
  alert: "normal",
  booted: false,
};
