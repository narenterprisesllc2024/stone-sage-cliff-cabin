import { useEffect, useRef, useState } from "react";
import { getRecognitionCtor, pickRecorderMime, play, speak, unlockAudio } from "@/lib/fx";
import { saveAudioFn } from "@/lib/log-api";
import { formatShipTime } from "@/lib/stardate";
import { blobToBase64, cn } from "@/lib/utils";
import { useLogStore } from "@/stores/log-store";
import { LcarsButton } from "@/components/lcars";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function Recorder({ open, onClose }: Props) {
  const journals = useLogStore((s) => s.journals);
  const selectedJournalId = useLogStore((s) => s.selectedJournalId);
  const createEntry = useLogStore((s) => s.createEntry);
  const updateEntry = useLogStore((s) => s.updateEntry);
  const fileEntry = useLogStore((s) => s.fileEntry);
  const settings = useLogStore((s) => s.settings);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [levels, setLevels] = useState<number[]>(() => Array(16).fill(0));
  const [error, setError] = useState<string | null>(null);
  const [micOk, setMicOk] = useState(false);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recgRef = useRef<SpeechRecognition | null>(null);
  const rafRef = useRef<number>(0);
  const startedRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const finalRef = useRef("");

  const journal = journals.find((j) => j.id === selectedJournalId);

  useEffect(() => {
    if (!open) return;
    void begin();
    return () => teardown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed(Date.now() - startedRef.current);
    }, 200);
    return () => window.clearInterval(id);
  }, [running]);

  async function begin() {
    setError(null);
    setFinalText("");
    setInterim("");
    finalRef.current = "";
    setElapsed(0);
    chunksRef.current = [];
    await unlockAudio();
    play("recordOn");
    speak("Recording.");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicOk(true);

      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const actx = new Ctor();
      audioCtxRef.current = actx;
      const src = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 32;
      src.connect(analyser);
      analyserRef.current = analyser;
      pumpMeters();

      const mime = pickRecorderMime();
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recRef.current = rec;
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.start(250);
    } catch {
      setMicOk(false);
      setError("Audio input unavailable. Speak if dictation is online, or enter the log manually.");
    }

    const Recg = getRecognitionCtor();
    if (Recg) {
      const recg = new Recg();
      recg.continuous = true;
      recg.interimResults = true;
      recg.lang = "en-US";
      recg.onresult = (ev) => {
        let nextFinal = finalRef.current;
        let nextInterim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const piece = ev.results[i][0]?.transcript ?? "";
          if (ev.results[i].isFinal) {
            nextFinal = `${nextFinal}${nextFinal ? " " : ""}${piece}`.replace(/\s+/g, " ").trim();
          } else {
            nextInterim += piece;
          }
        }
        finalRef.current = nextFinal;
        setFinalText(nextFinal);
        setInterim(nextInterim);
      };
      recg.onerror = () => {
        /* keep recording audio even if dictation drops */
      };
      recg.onend = () => {
        if (recRef.current && recRef.current.state !== "inactive") {
          try {
            recg.start();
          } catch {
            /* already started */
          }
        }
      };
      recgRef.current = recg;
      try {
        recg.start();
      } catch {
        /* ignore */
      }
    } else if (!error) {
      setError("Live dictation is not available in this browser. Audio will still be stored.");
    }

    startedRef.current = Date.now();
    setRunning(true);
  }

  function pumpMeters() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const bars: number[] = [];
      const step = Math.max(1, Math.floor(data.length / 16));
      for (let i = 0; i < 16; i++) {
        bars.push((data[i * step] ?? 0) / 255);
      }
      setLevels(bars);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function teardown() {
    cancelAnimationFrame(rafRef.current);
    try {
      recgRef.current?.abort();
    } catch {
      /* ignore */
    }
    recgRef.current = null;
    if (recRef.current && recRef.current.state !== "inactive") {
      try {
        recRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    recRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    setRunning(false);
  }

  async function fileLog() {
    const rec = recRef.current;
    const mime = rec?.mimeType || pickRecorderMime() || "audio/webm";
    const done = new Promise<Blob | null>((resolve) => {
      if (!rec || rec.state === "inactive") {
        resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type: mime }) : null);
        return;
      }
      rec.onstop = () => {
        resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type: mime }) : null);
      };
      try {
        rec.stop();
      } catch {
        resolve(null);
      }
    });
    try {
      recgRef.current?.stop();
    } catch {
      /* ignore */
    }

    const blob = await done;
    const durationMs = Date.now() - startedRef.current;
    const body = `${finalRef.current}${interim ? ` ${interim}` : ""}`.trim();
    const title = body.split(/\s+/).slice(0, 6).join(" ");
    const entry = await createEntry({
      body,
      title: title.length > 40 ? `${title.slice(0, 37)}…` : title,
    });
    if (blob && blob.size > 0) {
      const data = await blobToBase64(blob);
      await saveAudioFn({ data: { entryId: entry.id, mime: blob.type || mime, data } });
      updateEntry(entry.id, { hasAudio: true, durationMs, status: "filed" });
    } else {
      fileEntry(entry.id);
    }
    teardown();
    play("success");
    speak(`Log recorded. Stardate ${entry.stardate}.`);
    onClose();
  }

  function discard() {
    teardown();
    play("recordOff");
    onClose();
  }

  if (!open) return null;

  const mm = String(Math.floor(elapsed / 60000)).padStart(2, "0");
  const ss = String(Math.floor((elapsed / 1000) % 60)).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-void p-3 sm:p-5">
      <div className="flex items-stretch gap-1">
        <div className="h-14 w-16 bg-lcars-alert sm:w-24" />
        <div className="flex flex-1 items-end justify-between bg-lcars-alert lcars-hand-right px-4 py-2">
          <span className="lcars-label rec-pulse text-xl text-lcars-canary sm:text-3xl">Recording</span>
          <span className="lcars-label tabular-nums text-xl text-void sm:text-3xl">
            {mm}:{ss}
          </span>
        </div>
      </div>

      <div className="mt-1 flex min-h-0 flex-1 gap-1">
        <div className="hidden w-24 shrink-0 flex-col gap-1 sm:flex">
          <div className="relative h-10 bg-lcars-alert">
            <div className="absolute right-0 bottom-0 h-7 w-7 rounded-tl-pit bg-void" />
          </div>
          <div className="flex-1 bg-lcars-eggplant" />
          <div className="h-12 bg-lcars-orange rounded-bl-lcars" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-void pl-0 sm:pl-4">
          <p className="lcars-label text-sm text-lcars-gold">
            {journal?.name ?? "Log"} · {settings.vessel} · {formatShipTime()}
          </p>
          {error ? (
            <p className="mt-2 font-display text-sm uppercase text-lcars-alert">{error}</p>
          ) : (
            <p className="mt-2 font-display text-sm uppercase text-lcars-lilac">
              {micOk ? "Voice channel open · dictation live" : "Waiting for audio channel"}
            </p>
          )}

          <div className="mt-4 flex h-16 items-end gap-1">
            {levels.map((v, i) => (
              <div
                key={i}
                className={cn(
                  "w-full rounded-t-sm",
                  i % 3 === 0 ? "bg-lcars-orange" : i % 3 === 1 ? "bg-lcars-peach" : "bg-lcars-gold",
                )}
                style={{ height: `${Math.max(8, v * 100)}%` }}
              />
            ))}
          </div>

          <div className="lcars-scroll mt-5 min-h-0 flex-1 overflow-auto">
            <p className="font-body text-lg leading-relaxed text-lcars-peach text-pretty md:text-2xl">
              {finalText || interim ? (
                <>
                  {finalText}
                  {interim ? <span className="text-lcars-lilac"> {interim}</span> : null}
                </>
              ) : (
                <span className="text-lcars-eggplant">Awaiting voice input…</span>
              )}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-md">
            <LcarsButton tone="gold" shape="pill" tall="lg" onClick={discard}>
              Discard
            </LcarsButton>
            <LcarsButton tone="orange" shape="pill" tall="lg" onClick={() => void fileLog()}>
              File log
            </LcarsButton>
          </div>
        </div>
      </div>
    </div>
  );
}
