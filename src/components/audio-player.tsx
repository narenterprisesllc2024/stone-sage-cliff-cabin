import { useEffect, useRef, useState } from "react";
import { loadAudioFn } from "@/lib/log-api";
import { play } from "@/lib/fx";
import { base64ToBlob } from "@/lib/utils";
import { LcarsButton } from "@/components/lcars";

export function AudioPlayer({ entryId, durationMs }: { entryId: string; durationMs: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let dead = false;
    setReady(false);
    setMissing(false);
    setPlaying(false);
    setProgress(0);
    void loadAudioFn({ data: entryId }).then((row) => {
      if (dead) return;
      if (!row) {
        setMissing(true);
        return;
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const blob = base64ToBlob(row.data, row.mime);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const el = new Audio(url);
      el.addEventListener("timeupdate", () => {
        if (el.duration) setProgress(el.currentTime / el.duration);
      });
      el.addEventListener("ended", () => {
        setPlaying(false);
        setProgress(0);
      });
      audioRef.current = el;
      setReady(true);
    });
    return () => {
      dead = true;
      audioRef.current?.pause();
      audioRef.current = null;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, [entryId]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      play("tap");
    } else {
      void el.play();
      setPlaying(true);
      play("chirp");
    }
  }

  const secs = Math.round((durationMs || 0) / 1000);
  const stamp = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  if (missing) {
    return <p className="lcars-label text-sm text-lcars-lilac">Voice channel not on file</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0">
        <LcarsButton tone={playing ? "gold" : "blue"} shape="pill" tall="sm" onClick={toggle} disabled={!ready}>
          {playing ? "Pause" : "Play"}
        </LcarsButton>
      </div>
      <div className="relative h-3 flex-1 bg-lcars-eggplant">
        <div
          className="h-full bg-lcars-orange transition-[width] duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <span className="lcars-label w-12 text-right text-sm text-lcars-gold tabular-nums">{stamp}</span>
    </div>
  );
}
