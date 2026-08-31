import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { BootScreen, IdentifyingScreen } from "@/components/boot-screen";
import { Console } from "@/components/console";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useLogStore } from "@/stores/log-store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useLogStore((s) => s.hydrated);
  const booted = useLogStore((s) => s.settings.booted);
  const hydrate = useLogStore((s) => s.hydrate);
  const reset = useLogStore((s) => s.reset);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      reset();
      return;
    }
    void hydrate();
  }, [userId, hydrate, reset]);

  if (isPending || (user && !hydrated)) {
    return (
      <IdentifyingScreen message={isPending ? "Identifying officer…" : "Accessing data banks…"} />
    );
  }
  if (!user) return <RedirectToSignIn />;

  return <main>{booted ? <Console /> : <BootScreen />}</main>;
}
