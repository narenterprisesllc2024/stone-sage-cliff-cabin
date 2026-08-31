import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { IdentifyingScreen } from "@/components/boot-screen";
import { LcarsButton, LcarsField, LcarsInput } from "@/components/lcars";
import { play } from "@/lib/fx";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [showSocial, setShowSocial] = useState(false);

  useEffect(() => {
    setShowSocial(/grok\.(me|com)|grok-sandbox/.test(window.location.hostname));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!authEnabled) return;
    setError(null);
    setBusy(true);
    play("tap");
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.trim(),
          callbackURL: "/",
        });
        if (err) throw new Error(err.message || "Clearance denied.");
      } else {
        const { error: err } = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/",
        });
        if (err) throw new Error(err.message || "Access denied.");
      }
      play("confirm");
      await navigate({ to: "/" });
    } catch (err) {
      play("error");
      setError(err instanceof Error ? err.message : "Access denied.");
    } finally {
      setBusy(false);
    }
  }

  if (isPending) return <IdentifyingScreen />;
  if (user) return <Navigate to="/" />;

  return (
    <main className="flex min-h-dvh flex-col bg-void p-3 sm:p-5">
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
          <p className="mt-2 font-display text-base uppercase text-lcars-gold">
            Identify to open personal data banks
          </p>

          {!authEnabled ? (
            <p className="mt-8 font-body text-lcars-lilac">Sign-in is disabled.</p>
          ) : (
            <form className="mt-8 w-full max-w-md space-y-4" onSubmit={(e) => void submit(e)}>
              <div className="flex gap-2">
                <LcarsButton
                  type="button"
                  tone={mode === "in" ? "orange" : "eggplant"}
                  shape="pill"
                  tall="sm"
                  className="w-auto px-5"
                  onClick={() => setMode("in")}
                >
                  Sign in
                </LcarsButton>
                <LcarsButton
                  type="button"
                  tone={mode === "up" ? "peach" : "eggplant"}
                  shape="pill"
                  tall="sm"
                  className="w-auto px-5"
                  onClick={() => setMode("up")}
                >
                  Request clearance
                </LcarsButton>
              </div>

              {mode === "up" ? (
                <LcarsField label="Officer name">
                  <LcarsInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="A. Solari"
                  />
                </LcarsField>
              ) : null}

              <LcarsField label="Officer ID (email)">
                <LcarsInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </LcarsField>
              <LcarsField label="Access code">
                <LcarsInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  minLength={8}
                  required
                />
              </LcarsField>

              {error ? (
                <p className="font-display text-sm uppercase text-lcars-alert">{error}</p>
              ) : null}

              <LcarsButton type="submit" tone="orange" shape="pill" tall="lg" disabled={busy}>
                {busy ? "Working…" : mode === "up" ? "Create clearance" : "Authorize"}
              </LcarsButton>

              {showSocial ? (
                <div className="grid gap-2 pt-2">
                  <p className="lcars-label text-sm text-lcars-lilac">Or continue via</p>
                  {GROK_PROVIDERS.map((p) => (
                    <LcarsButton
                      key={p.providerId}
                      type="button"
                      tone={p.idp === "google" ? "blue" : "gold"}
                      shape="pill"
                      onClick={() => {
                        play("open");
                        void signIn(p.providerId, { callbackURL: "/" });
                      }}
                    >
                      Continue with {p.label}
                    </LcarsButton>
                  ))}
                </div>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
