import { useEffect, useMemo, useState } from "react";
import { formatEarthDate, formatShipTime, formatStardate } from "@/lib/stardate";
import { play, setSoundEnabled, setVoiceEnabled, speak } from "@/lib/fx";
import { patchAlert, useLogStore, visibleEntries } from "@/stores/log-store";
import { LcarsBar, LcarsButton, LcarsInput, LcarsTextarea } from "@/components/lcars";
import { SWATCH_BG } from "@/components/lcars";
import { Recorder } from "@/components/recorder";
import { SettingsPanel } from "@/components/settings-panel";
import { AudioPlayer } from "@/components/audio-player";
import { cn } from "@/lib/utils";
import type { LcarsSwatch } from "@/lib/types";

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

const NAV_TALL = ["lg", "md", "md", "sm", "lg", "md"] as const;

export function Console() {
  const now = useNow();
  const journals = useLogStore((s) => s.journals);
  const entries = useLogStore((s) => s.entries);
  const settings = useLogStore((s) => s.settings);
  const selectedJournalId = useLogStore((s) => s.selectedJournalId);
  const selectedEntryId = useLogStore((s) => s.selectedEntryId);
  const query = useLogStore((s) => s.query);
  const selectJournal = useLogStore((s) => s.selectJournal);
  const selectEntry = useLogStore((s) => s.selectEntry);
  const setQuery = useLogStore((s) => s.setQuery);
  const createEntry = useLogStore((s) => s.createEntry);
  const updateEntry = useLogStore((s) => s.updateEntry);
  const fileEntry = useLogStore((s) => s.fileEntry);
  const deleteEntry = useLogStore((s) => s.deleteEntry);

  const [recording, setRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [listOpen, setListOpen] = useState(true);

  const journal = journals.find((j) => j.id === selectedJournalId) ?? journals[0];
  const accent: LcarsSwatch = journal?.color ?? "orange";
  const list = useMemo(
    () => visibleEntries(entries, selectedJournalId, query),
    [entries, selectedJournalId, query],
  );
  const entry = entries.find((e) => e.id === selectedEntryId) ?? null;

  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
    setVoiceEnabled(settings.voiceEnabled);
    patchAlert(settings.alert);
  }, [settings.soundEnabled, settings.voiceEnabled, settings.alert]);

  useEffect(() => {
    if (list.length === 0) return;
    if (!list.some((e) => e.id === selectedEntryId)) {
      selectEntry(list[0].id);
    }
  }, [list, selectedEntryId, selectEntry]);

  function onNav(id: string) {
    play("tap");
    selectJournal(id);
    setListOpen(true);
  }

  function startVoice() {
    play("chirp");
    setRecording(true);
  }

  function newTextLog() {
    play("open");
    void createEntry().then(() => {
      speak("New log.");
      setListOpen(false);
    });
  }

  function saveLog() {
    if (!entry) return;
    fileEntry(entry.id);
    play("confirm");
    speak("Log filed.");
  }

  function toggleSupplemental() {
    if (!entry) return;
    updateEntry(entry.id, { kind: entry.kind === "supplemental" ? "standard" : "supplemental" });
    play("tap");
  }

  async function removeLog() {
    if (!entry) return;
    await deleteEntry(entry.id);
    setConfirmDelete(false);
    play("error");
    speak("Log deleted.");
  }

  const officer =
    [settings.rank, settings.officerName].filter(Boolean).join(" ") || settings.rank;

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-void p-2 sm:p-3">
      <header className="flex items-stretch gap-1">
        <div className={cn("hidden h-20 w-[8.75rem] shrink-0 sm:block", SWATCH_BG[accent])} />
        <div
          className={cn(
            "flex min-h-16 min-w-0 flex-1 items-end justify-between px-3 py-2 sm:min-h-20 sm:px-5",
            "rounded-r-hand",
            SWATCH_BG[accent],
          )}
        >
          <div className="min-w-0 pr-3">
            <p className="lcars-label truncate text-2xl leading-none text-void sm:text-4xl md:text-5xl">
              {journal?.name ?? "Captain's Log"}
            </p>
            <p className="mt-1 truncate font-display text-xs uppercase tracking-wide text-void/75 sm:text-sm">
              {officer} · {settings.vessel} · {settings.registry}
            </p>
          </div>
          <div className="text-right">
            <p className="lcars-label text-xl leading-none text-void tabular-nums sm:text-3xl">
              {formatStardate(now)}
            </p>
            <p className="font-display text-[0.65rem] uppercase text-void/70 sm:text-xs">Stardate</p>
          </div>
        </div>
        <LcarsBar tone="gold" className="hidden w-28 shrink-0 rounded-r-hand sm:flex md:w-32">
          <span className="text-lg tabular-nums">{formatShipTime(now)}</span>
        </LcarsBar>
        <div className="hidden w-8 shrink-0 rounded-r-hand bg-lcars-lilac md:block" />
      </header>

      <div className="mt-1 flex min-h-0 flex-1 flex-col gap-1 sm:flex-row">
        <aside className="flex shrink-0 flex-col gap-1 sm:w-[8.75rem]">
          <div className={cn("relative hidden h-12 sm:block", SWATCH_BG[accent])}>
            <div className="absolute right-0 bottom-0 h-10 w-10 rounded-tl-pit bg-void" />
          </div>

          <nav className="flex gap-1 overflow-x-auto lcars-scroll sm:flex-col sm:overflow-visible">
            {journals.map((j, i) => (
              <LcarsButton
                key={j.id}
                tone={j.id === selectedJournalId ? "canary" : j.color}
                shape="block"
                tall={NAV_TALL[i % NAV_TALL.length]}
                className="w-auto min-w-36 shrink-0 sm:w-full sm:min-w-0"
                onClick={() => onNav(j.id)}
              >
                <span className="flex w-full flex-col items-end">
                  <span className="text-[0.65rem] opacity-70">{j.code}</span>
                  <span>{j.name}</span>
                </span>
              </LcarsButton>
            ))}
          </nav>

          <div className="hidden min-h-8 flex-1 bg-lcars-eggplant sm:block" />

          <div className="hidden flex-col gap-1 sm:flex">
            <LcarsButton tone="alert" shape="block" tall="xl" onClick={startVoice}>
              Record
            </LcarsButton>
            <LcarsButton tone="peach" shape="block" onClick={newTextLog}>
              New log
            </LcarsButton>
            <LcarsButton
              tone="blue"
              shape="block"
              onClick={() => {
                play("open");
                setSettingsOpen(true);
              }}
            >
              Config
            </LcarsButton>
            <div className="flex h-10 items-end justify-end rounded-bl-lcars bg-lcars-gold px-2 py-1">
              <span className="lcars-label text-xs text-void">{journal?.code}</span>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="hidden h-12 items-end justify-between px-1 sm:flex">
            <span className="lcars-label text-sm text-lcars-blue">
              {journal?.code} · {list.length} on file
            </span>
            <span className="font-display text-xs uppercase text-lcars-lilac">
              {formatEarthDate(now)}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 overflow-hidden rounded-tl-pit">
            <div
              className={cn(
                "min-h-0 flex-col sm:w-72 sm:shrink-0 lg:w-[19rem]",
                listOpen ? "flex w-full sm:w-72" : "hidden sm:flex",
              )}
            >
              <div className="p-2">
                <LcarsInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search data banks"
                  aria-label="Search logs"
                />
              </div>
              <div className="lcars-scroll min-h-0 flex-1 overflow-auto px-2 pb-2">
                {list.length === 0 ? (
                  <p className="px-1 py-6 font-display text-sm uppercase text-lcars-lilac">
                    No logs on file. Record to begin.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {list.map((item, i) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            play("tap");
                            selectEntry(item.id);
                            setListOpen(false);
                          }}
                          className={cn(
                            "grid w-full gap-0.5 px-3 py-2.5 text-left",
                            i % 2 === 0 ? "rounded-r-hand" : "rounded-none",
                            item.id === selectedEntryId
                              ? "bg-lcars-orange text-void"
                              : "bg-lcars-eggplant text-lcars-peach",
                          )}
                        >
                          <span className="lcars-label text-sm tabular-nums">
                            SD {item.stardate}
                            {item.kind === "supplemental" ? " · supp" : ""}
                          </span>
                          <span className="truncate font-body text-sm">
                            {item.title || item.body.slice(0, 48) || "Untitled draft"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div
              className={cn(
                "min-h-0 min-w-0 flex-1 flex-col border-lcars-orange sm:border-l-4",
                listOpen ? "hidden sm:flex" : "flex",
              )}
            >
              {entry ? (
                <Editor
                  key={entry.id}
                  stardate={entry.stardate}
                  journalName={journal?.name ?? "Log"}
                  kind={entry.kind}
                  title={entry.title}
                  body={entry.body}
                  status={entry.status}
                  hasAudio={entry.hasAudio}
                  durationMs={entry.durationMs}
                  entryId={entry.id}
                  color={accent}
                  onTitle={(title) => updateEntry(entry.id, { title })}
                  onBody={(body) => updateEntry(entry.id, { body })}
                  onSupplemental={toggleSupplemental}
                  onSave={saveLog}
                  onDelete={() => setConfirmDelete(true)}
                  onBack={() => setListOpen(true)}
                />
              ) : (
                <div className="flex flex-1 flex-col items-start justify-center gap-4 p-6">
                  <p className="lcars-label text-3xl text-lcars-peach sm:text-5xl">No file selected</p>
                  <p className="max-w-md font-body text-base text-lcars-gold text-pretty">
                    Open an archived log, dictate a new voice log, or begin a written entry.
                  </p>
                  <div className="flex w-full max-w-sm flex-col gap-2">
                    <LcarsButton tone="alert" shape="pill" tall="lg" onClick={startVoice}>
                      Begin voice log
                    </LcarsButton>
                    <LcarsButton tone="peach" shape="pill" onClick={newTextLog}>
                      Begin written log
                    </LcarsButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-1 hidden items-stretch gap-1 sm:flex">
        <div className="h-6 w-[8.75rem] rounded-tr-pit bg-lcars-gold" />
        <div className="h-6 flex-1 bg-lcars-orange" />
        <div className="h-6 w-24 bg-lcars-peach" />
        <div className="h-6 w-16 rounded-r-hand bg-lcars-lilac" />
      </footer>

      <div className="mt-1 grid grid-cols-3 gap-1 sm:hidden">
        <LcarsButton tone="alert" shape="pill" onClick={startVoice}>
          Record
        </LcarsButton>
        <LcarsButton tone="peach" shape="pill" onClick={newTextLog}>
          New
        </LcarsButton>
        <LcarsButton
          tone="blue"
          shape="pill"
          onClick={() => {
            play("open");
            setSettingsOpen(true);
          }}
        >
          Config
        </LcarsButton>
      </div>

      {recording ? <Recorder open={recording} onClose={() => setRecording(false)} /> : null}
      {settingsOpen ? <SettingsPanel onClose={() => setSettingsOpen(false)} /> : null}
      {confirmDelete ? (
        <ConfirmDelete onCancel={() => setConfirmDelete(false)} onConfirm={() => void removeLog()} />
      ) : null}
    </div>
  );
}

function Editor({
  stardate,
  journalName,
  kind,
  title,
  body,
  status,
  hasAudio,
  durationMs,
  entryId,
  color,
  onTitle,
  onBody,
  onSupplemental,
  onSave,
  onDelete,
  onBack,
}: {
  stardate: string;
  journalName: string;
  kind: "standard" | "supplemental";
  title: string;
  body: string;
  status: "draft" | "filed";
  hasAudio: boolean;
  durationMs: number;
  entryId: string;
  color: LcarsSwatch;
  onTitle: (v: string) => void;
  onBody: (v: string) => void;
  onSupplemental: () => void;
  onSave: () => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            className="lcars-label mb-1 text-sm text-lcars-blue sm:hidden"
            onClick={onBack}
          >
            Archive
          </button>
          <h2 className="lcars-label text-xl leading-none text-lcars-peach sm:text-3xl text-balance">
            {journalName}
            {kind === "supplemental" ? ", supplemental" : ""}
          </h2>
          <p className="mt-1 lcars-label text-base text-lcars-gold tabular-nums">Stardate {stardate}</p>
        </div>
        <span
          className={cn(
            "lcars-label shrink-0 px-3 py-1 text-sm text-void",
            status === "filed" ? "bg-lcars-blue rounded-r-hand" : "bg-lcars-gold rounded-r-hand",
          )}
        >
          {status === "filed" ? "Filed" : "Draft"}
        </span>
      </div>

      {hasAudio ? (
        <div className="mb-3">
          <AudioPlayer entryId={entryId} durationMs={durationMs} />
        </div>
      ) : null}

      <LcarsInput
        value={title}
        onChange={(e) => onTitle(e.target.value)}
        placeholder="Subject"
        aria-label="Log title"
        className="mb-3"
      />

      <LcarsTextarea
        value={body}
        onChange={(e) => onBody(e.target.value)}
        placeholder="Computer, begin log…"
        aria-label="Log body"
        className="min-h-0 flex-1"
      />

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <LcarsButton tone={color} shape="hand-right" tall="sm" onClick={onSupplemental}>
          {kind === "supplemental" ? "Standard" : "Supplemental"}
        </LcarsButton>
        <LcarsButton tone="orange" shape="hand-right" tall="sm" onClick={onSave}>
          File
        </LcarsButton>
        <LcarsButton
          tone="blue"
          shape="hand-right"
          tall="sm"
          onClick={() => {
            play("open");
            speak(body || "This log is empty.");
          }}
        >
          Read back
        </LcarsButton>
        <LcarsButton tone="alert" shape="hand-right" tall="sm" onClick={onDelete}>
          Delete
        </LcarsButton>
      </div>
    </div>
  );
}

function ConfirmDelete({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-void/80 p-4">
      <div className="w-full max-w-sm bg-void fade-rise">
        <LcarsBar tone="alert" className="h-12 rounded-r-hand text-xl">
          Confirm purge
        </LcarsBar>
        <p className="p-4 font-body text-lcars-peach text-pretty">
          Remove this log from the data banks? Voice recordings will be purged as well.
        </p>
        <div className="grid grid-cols-2 gap-2 p-4 pt-0">
          <LcarsButton tone="gold" shape="pill" onClick={onCancel}>
            Abort
          </LcarsButton>
          <LcarsButton tone="alert" shape="pill" onClick={onConfirm}>
            Delete
          </LcarsButton>
        </div>
      </div>
    </div>
  );
}
