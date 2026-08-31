import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-void p-4">
      <div className="flex items-stretch gap-1">
        <div className="h-14 w-16 bg-lcars-alert" />
        <div className="flex flex-1 items-end bg-lcars-alert px-4 py-2 rounded-r-hand">
          <h1 className="lcars-label text-2xl text-void sm:text-3xl">Malfunction</h1>
        </div>
      </div>
      <p className="mt-8 max-w-lg font-body text-base break-words text-lcars-peach">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
    </main>
  );
}
