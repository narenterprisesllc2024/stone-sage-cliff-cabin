import { create } from "zustand";
import type { AlertStatus, Journal, LcarsSwatch, LogEntry, LogKind, Settings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { uid } from "@/lib/utils";
import { formatStardate } from "@/lib/stardate";
import { DEFAULT_JOURNALS } from "@/lib/seed";
import {
  deleteEntryFn,
  deleteJournalFn,
  fetchLogState,
  saveEntryFn,
  saveJournalFn,
  saveSettingsFn,
} from "@/lib/log-api";

type LogState = {
  hydrated: boolean;
  journals: Journal[];
  entries: LogEntry[];
  settings: Settings;
  selectedJournalId: string;
  selectedEntryId: string | null;
  query: string;
  hydrate: () => Promise<void>;
  reset: () => void;
  selectJournal: (id: string) => void;
  selectEntry: (id: string | null) => void;
  setQuery: (q: string) => void;
  createJournal: (name: string, color: LcarsSwatch) => Promise<Journal>;
  deleteJournal: (id: string) => Promise<void>;
  createEntry: (opts?: { kind?: LogKind; body?: string; title?: string }) => Promise<LogEntry>;
  updateEntry: (id: string, patch: Partial<LogEntry>) => void;
  fileEntry: (id: string) => void;
  deleteEntry: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => void;
};

export const useLogStore = create<LogState>((set, get) => ({
  hydrated: false,
  journals: DEFAULT_JOURNALS,
  entries: [],
  settings: DEFAULT_SETTINGS,
  selectedJournalId: "",
  selectedEntryId: null,
  query: "",

  hydrate: async () => {
    try {
      const { journals, entries, settings } = await fetchLogState();
      const selectedJournalId = journals[0]?.id ?? "";
      const first = entries.find((e) => e.journalId === selectedJournalId);
      set({
        journals,
        entries,
        settings,
        selectedJournalId,
        selectedEntryId: first?.id ?? null,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  reset: () => {
    set({
      hydrated: false,
      journals: DEFAULT_JOURNALS,
      entries: [],
      settings: DEFAULT_SETTINGS,
      selectedJournalId: "",
      selectedEntryId: null,
      query: "",
    });
  },

  selectJournal: (id) => {
    const { entries } = get();
    const first = entries.find((e) => e.journalId === id);
    set({ selectedJournalId: id, selectedEntryId: first?.id ?? null, query: "" });
  },

  selectEntry: (id) => set({ selectedEntryId: id }),

  setQuery: (q) => set({ query: q }),

  createJournal: async (name, color) => {
    const journal: Journal = {
      id: uid("j"),
      name: name.trim() || "Untitled Log",
      code: `USR-${Math.floor(Math.random() * 90 + 10)}`,
      color,
      createdAt: Date.now(),
    };
    const journals = [...get().journals, journal];
    set({ journals, selectedJournalId: journal.id, selectedEntryId: null });
    await saveJournalFn({ data: journal });
    return journal;
  },

  deleteJournal: async (id) => {
    const { journals, entries, selectedJournalId } = get();
    if (journals.length <= 1) return;
    const nextJ = journals.filter((j) => j.id !== id);
    const nextE = entries.filter((e) => e.journalId !== id);
    const nextSelected = selectedJournalId === id ? nextJ[0].id : selectedJournalId;
    const first = nextE.find((e) => e.journalId === nextSelected);
    set({
      journals: nextJ,
      entries: nextE,
      selectedJournalId: nextSelected,
      selectedEntryId: first?.id ?? null,
    });
    await deleteJournalFn({ data: id });
  },

  createEntry: async (opts) => {
    const { selectedJournalId, entries } = get();
    const now = new Date();
    const log: LogEntry = {
      id: uid("e"),
      journalId: selectedJournalId,
      stardate: formatStardate(now),
      createdAt: now.getTime(),
      updatedAt: now.getTime(),
      title: opts?.title ?? "",
      body: opts?.body ?? "",
      kind: opts?.kind ?? "standard",
      hasAudio: false,
      durationMs: 0,
      status: "draft",
    };
    set({ entries: [log, ...entries], selectedEntryId: log.id });
    await saveEntryFn({ data: log });
    return log;
  },

  updateEntry: (id, patch) => {
    const entries = get().entries.map((e) =>
      e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e,
    );
    set({ entries });
    const next = entries.find((e) => e.id === id);
    if (next) void saveEntryFn({ data: next });
  },

  fileEntry: (id) => {
    get().updateEntry(id, { status: "filed" });
  },

  deleteEntry: async (id) => {
    const { entries, selectedEntryId, selectedJournalId } = get();
    const next = entries.filter((e) => e.id !== id);
    const fallback =
      selectedEntryId === id
        ? (next.find((e) => e.journalId === selectedJournalId)?.id ?? null)
        : selectedEntryId;
    set({ entries: next, selectedEntryId: fallback });
    await deleteEntryFn({ data: id });
  },

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    void saveSettingsFn({ data: settings });
  },
}));

export function visibleEntries(
  entries: LogEntry[],
  journalId: string,
  query: string,
): LogEntry[] {
  const q = query.trim().toLowerCase();
  return entries
    .filter((e) => e.journalId === journalId)
    .filter((e) => {
      if (!q) return true;
      return (
        e.body.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.stardate.includes(q)
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function patchAlert(alert: AlertStatus) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.alert = alert === "normal" ? "" : alert;
}
