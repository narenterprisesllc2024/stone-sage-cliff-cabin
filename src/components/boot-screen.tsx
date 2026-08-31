import { useEffect, useState } from "react";
import { play, speak, unlockAudio } from "@/lib/fx";
import { formatStardate } from "@/lib/stardate";
import { useLogStore } from "@/stores/log-store";
import { LcarsButton } from "@/components/lcars";

export function IdentifyingScreen({ message = "Identifying officer…" }: { message?: string }) {
  return (
    <div className="flex min-h-dvh flex-col bg-void p-3 sm:p-5">
      <div className="flex items-stretch gap-1">
        <div className="flex h-16 w-20 shrink-0 items-end justify-end bg-lcars-orange px-2 py-1 sm:h-20 sm:w-32">
          <span className="lcars-label text-sm text-void">47-21</span>
        </div>
        <div className="flex min-w-0 flex-1 items-end justify-between rounded-r-hand bg-lcars-orange px-4 py-2">
          <span className="lcars-label text-2xl text-void sm:text-4xl">LCARS</span>
          <span className="lcars-label hidden text-lg text-void sm:inline">Access</span>
        </div>
      </div>
      <div className="mt-1 flex min-h-0 flex-1">
        <div className="flex w-20 shrink-0 flex-col gap-1 sm:w-32">
          <div className="relative h-12 bg-lcars-orange">
            <div className="absolute right-0 bottom-0 h-8 w-8 rounded-tl-pit bg-void" />
          </div>
          <div className="flex-1 bg-lcars-lilac" />
          <div className="h-12 rounded-bl-lcars bg-lcars-gold" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center pl-4 sm:pl-8">
          <p className="lcars-label text-xs tracking-[0.18em] text-lcars-blue sm:text-sm">
            Restricted — authorized officers only
          </p>
          <h1 className="lcars-label mt-2 text-4xl text-lcars-peach sm:text-6xl">Captain's Log</h1>
          <p className="lcars-label rec-pulse mt-8 text-2xl text-lcars-orange">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function BootScreen() {
  const updateSettings = useLogStore((s) => s.updateSettings);
  const settings = useLogStore((s) => s.settings);
  const [phase, setPhase] = useState<"idle" | "booting">("idle");

  useEffect(() => {
    if (phase !== "booting") return;
    play("boot");
    const t = window.setTimeout(() => {
      speak("Log system online.");
      updateSettings({ booted: true });
    }, 1400);
    return () => window.clearTimeout(t);
  }, [phase, updateSettings]);

  async function initialize() {
    await unlockAudio();
    setPhase("booting");
  }

  const sd = formatStardate();

  return (
    <div className="flex min-h-dvh flex-col bg-void p-3 sm:p-5">
      <div className="flex items-stretch gap-1">
        <div className="flex h-16 w-20 shrink-0 items-end justify-end bg-lcars-orange px-2 py-1 sm:h-24 sm:w-36">
          <span className="lcars-label text-sm text-void sm:text-base">47-21</span>
        </div>
        <div className="flex min-w-0 flex-1 items-end justify-between bg-lcars-orange lcars-hand-right px-4 py-2 sm:px-6">
          <span className="lcars-label text-3xl text-void sm:text-5xl md:text-6xl">LCARS</span>
          <span className="lcars-label hidden text-lg text-void sm:inline">Sys 47.3</span>
        </div>
      </div>

      <div className="mt-1 flex min-h-0 flex-1">
        <div className="flex w-20 shrink-0 flex-col gap-1 sm:w-36">
          <div className="relative h-14 bg-lcars-orange sm:h-20">
            <div className="absolute right-0 bottom-0 h-10 w-10 rounded-tl-pit bg-void sm:h-14 sm:w-14" />
          </div>
          <div className="flex min-h-16 flex-1 items-end justify-end bg-lcars-lilac px-2 py-1">
            <span className="lcars-label text-sm text-void">02-184</span>
          </div>
          <div className="flex h-14 items-end justify-end bg-lcars-gold px-2 py-1 sm:h-20">
            <span className="lcars-label text-sm text-void">09-330</span>
          </div>
          <div className="flex h-12 items-end justify-end rounded-bl-lcars bg-lcars-peach px-2 py-1">
            <span className="lcars-label text-sm text-void">11-005</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col pl-4 sm:pl-8">
          <div className="h-14 sm:h-20" />
          <div className="flex min-h-0 flex-1 flex-col justify-center pb-6">
            <p className="lcars-label text-lcars-blue text-xs tracking-[0.18em] sm:text-sm">
              Library Computer Access and Retrieval
            </p>
            <h1 className="lcars-label mt-2 text-5xl leading-none text-lcars-peach sm:text-7xl md:text-8xl text-balance">
              Captain's Log
            </h1>
            <p className="mt-4 font-display text-base uppercase tracking-wide text-lcars-gold sm:text-xl">
              Personal log system · {settings.vessel} · {settings.registry}
            </p>
            <p className="mt-1 font-display text-base uppercase text-lcars-lilac tabular-nums sm:text-lg">
              Stardate {sd}
            </p>

            <div className="mt-8 max-w-xl space-y-1">
              <div className="boot-bar h-3.5 bg-lcars-orange lcars-hand-right" />
              <div
                className="boot-bar h-3.5 w-4/5 bg-lcars-peach lcars-hand-right"
                style={{ animationDelay: "80ms" }}
              />
              <div
                className="boot-bar h-3.5 w-2/3 bg-lcars-lilac lcars-hand-right"
                style={{ animationDelay: "160ms" }}
              />
              <div
                className="boot-bar h-3.5 w-1/2 bg-lcars-gold lcars-hand-right"
                style={{ animationDelay: "240ms" }}
              />
            </div>

            <div className="mt-10 w-full max-w-sm">
              {phase === "idle" ? (
                <LcarsButton
                  tone="orange"
                  shape="pill"
                  tall="lg"
                  onClick={() => void initialize()}
                >
                  Touch to initialize
                </LcarsButton>
              ) : (
                <p className="lcars-label text-2xl text-lcars-orange rec-pulse">
                  Accessing data banks…
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
