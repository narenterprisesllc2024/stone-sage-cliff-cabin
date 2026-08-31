import { useState } from "react";
import { LcarsBar, LcarsButton, LcarsField, LcarsInput, ModalScrim } from "@/components/lcars";
import { play, setSoundEnabled, setVoiceEnabled, speak } from "@/lib/fx";
import { patchAlert, useLogStore } from "@/stores/log-store";
import type { AlertStatus, LcarsSwatch } from "@/lib/types";
import { LCARS_SWATCHES } from "@/lib/types";
import { SWATCH_BG } from "@/components/lcars";
import { cn } from "@/lib/utils";
import { UserButton } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const settings = useLogStore((s) => s.settings);
  const updateSettings = useLogStore((s) => s.updateSettings);
  const createJournal = useLogStore((s) => s.createJournal);
  const journals = useLogStore((s) => s.journals);
  const deleteJournal = useLogStore((s) => s.deleteJournal);
  const [signingOut, setSigningOut] = useState(false);

  const [name, setName] = useState("");
  const [color, setColor] = useState<LcarsSwatch>("orange");

  function setAlert(alert: AlertStatus) {
    play("open");
    updateSettings({ alert });
    patchAlert(alert);
    if (alert === "red") speak("Red alert.");
    else if (alert === "blue") speak("Blue alert.");
    else speak("Condition green.");
  }

  function addJournal() {
    if (!name.trim()) return;
    void createJournal(name, color);
    play("confirm");
    speak(`${name} file created.`);
    setName("");
  }

  function endShift() {
    if (signingOut) return;
    setSigningOut(true);
    play("open");
    void signOut().catch(() => setSigningOut(false));
  }

  return (
    <ModalScrim onClose={onClose}>
      <div className="bg-void">
        <div className="flex gap-1">
          <div className="h-12 w-10 bg-lcars-lilac" />
          <LcarsBar tone="lilac" className="h-12 flex-1 text-2xl">
            Library config
          </LcarsBar>
        </div>
        <div className="flex">
          <div className="w-10 bg-lcars-lilac">
            <div className="relative h-8 bg-lcars-lilac">
              <div className="absolute right-0 bottom-0 h-6 w-6 rounded-tl-pit bg-void" />
            </div>
          </div>
          <div className="flex-1 space-y-5 p-4">
            <div>
              <p className="lcars-label mb-2 text-sm text-lcars-orange">Duty officer</p>
              <div className="bg-lcars-eggplant px-3 py-2 text-lcars-peach [&_button]:font-display [&_button]:uppercase [&_button]:tracking-wide [&_button]:text-lcars-alert [&_span]:font-display [&_span]:uppercase">
                <UserButton />
              </div>
              <div className="mt-2 max-w-xs">
                <LcarsButton
                  tone="alert"
                  shape="pill"
                  tall="sm"
                  disabled={signingOut}
                  onClick={endShift}
                >
                  {signingOut ? "Signing out…" : "End shift"}
                </LcarsButton>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <LcarsField label="Rank">
                <LcarsInput
                  value={settings.rank}
                  onChange={(e) => updateSettings({ rank: e.target.value })}
                />
              </LcarsField>
              <LcarsField label="Officer">
                <LcarsInput
                  value={settings.officerName}
                  onChange={(e) => updateSettings({ officerName: e.target.value })}
                  placeholder="Name"
                />
              </LcarsField>
              <LcarsField label="Vessel">
                <LcarsInput
                  value={settings.vessel}
                  onChange={(e) => updateSettings({ vessel: e.target.value })}
                />
              </LcarsField>
              <LcarsField label="Registry">
                <LcarsInput
                  value={settings.registry}
                  onChange={(e) => updateSettings({ registry: e.target.value })}
                />
              </LcarsField>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <LcarsButton
                tone={settings.soundEnabled ? "orange" : "eggplant"}
                shape="pill"
                tall="sm"
                onClick={() => {
                  const next = !settings.soundEnabled;
                  setSoundEnabled(next);
                  updateSettings({ soundEnabled: next });
                  if (next) play("tap");
                }}
              >
                Sound {settings.soundEnabled ? "on" : "off"}
              </LcarsButton>
              <LcarsButton
                tone={settings.voiceEnabled ? "peach" : "eggplant"}
                shape="pill"
                tall="sm"
                onClick={() => {
                  const next = !settings.voiceEnabled;
                  setVoiceEnabled(next);
                  updateSettings({ voiceEnabled: next });
                  play("tap");
                }}
              >
                Computer voice {settings.voiceEnabled ? "on" : "off"}
              </LcarsButton>
            </div>

            <div>
              <p className="lcars-label mb-2 text-sm text-lcars-orange">Alert status</p>
              <div className="grid grid-cols-3 gap-2">
                <LcarsButton tone="gold" shape="pill" tall="sm" active={settings.alert === "normal"} onClick={() => setAlert("normal")}>
                  Green
                </LcarsButton>
                <LcarsButton tone="blue" shape="pill" tall="sm" active={settings.alert === "blue"} onClick={() => setAlert("blue")}>
                  Blue
                </LcarsButton>
                <LcarsButton tone="alert" shape="pill" tall="sm" active={settings.alert === "red"} onClick={() => setAlert("red")}>
                  Red
                </LcarsButton>
              </div>
            </div>

            <div>
              <p className="lcars-label mb-2 text-sm text-lcars-orange">New log bank</p>
              <div className="flex gap-2">
                <LcarsInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Science officer's log"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addJournal();
                  }}
                />
                <div className="w-28 shrink-0">
                  <LcarsButton tone="orange" shape="pill" tall="sm" onClick={addJournal}>
                    Create
                  </LcarsButton>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LCARS_SWATCHES.map((sw) => (
                  <button
                    key={sw}
                    type="button"
                    aria-label={sw}
                    onClick={() => setColor(sw)}
                    className={cn(
                      "size-7 lcars-pill",
                      SWATCH_BG[sw],
                      color === sw && "ring-2 ring-lcars-canary",
                    )}
                  />
                ))}
              </div>
            </div>

            {journals.length > 1 ? (
              <div>
                <p className="lcars-label mb-2 text-sm text-lcars-orange">Purge bank</p>
                <div className="flex flex-wrap gap-2">
                  {journals.map((j) => (
                    <LcarsButton
                      key={j.id}
                      tone={j.color}
                      shape="pill"
                      tall="sm"
                      className="w-auto px-4"
                      onClick={() => {
                        void deleteJournal(j.id);
                        play("error");
                      }}
                    >
                      Delete {j.name}
                    </LcarsButton>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end">
              <div className="w-36">
                <LcarsButton tone="blue" shape="pill" onClick={onClose}>
                  Close
                </LcarsButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalScrim>
  );
}
