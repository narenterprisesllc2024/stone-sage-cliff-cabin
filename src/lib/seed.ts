import type { Journal, LogEntry } from "@/lib/types";
import { formatStardate } from "@/lib/stardate";

export const DEFAULT_JOURNALS: Journal[] = [
  { id: "j-captain", name: "Captain's Log", code: "CAP-01", color: "orange", createdAt: 0 },
  { id: "j-personal", name: "Personal Log", code: "PER-07", color: "peach", createdAt: 0 },
  { id: "j-science", name: "Science Log", code: "SCI-12", color: "blue", createdAt: 0 },
  { id: "j-medical", name: "Medical Log", code: "MED-04", color: "lilac", createdAt: 0 },
  { id: "j-engineering", name: "Engineering Log", code: "ENG-09", color: "gold", createdAt: 0 },
];

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86400000);
}

function entry(
  partial: Omit<LogEntry, "status" | "hasAudio" | "durationMs" | "kind" | "updatedAt"> &
    Partial<Pick<LogEntry, "kind">>,
): LogEntry {
  return {
    hasAudio: false,
    durationMs: 0,
    status: "filed",
    kind: "standard",
    updatedAt: partial.createdAt,
    ...partial,
  };
}

export function seedEntries(): LogEntry[] {
  const d1 = daysAgo(4);
  const d2 = daysAgo(2);
  const d3 = daysAgo(1);
  return [
    entry({
      id: "e-seed-1",
      journalId: "j-captain",
      stardate: formatStardate(d1),
      createdAt: d1.getTime(),
      title: "Departure",
      body: "We have cleared spacedock and set a heading for the outer patrol corridor. All departments report ready. The crew is in good spirits — I intend to keep it that way.\n\nScience has flagged a faint particle bloom two light-years off the port bow. We will have a look, then resume the assigned route.",
    }),
    entry({
      id: "e-seed-2",
      journalId: "j-captain",
      stardate: formatStardate(d2),
      createdAt: d2.getTime(),
      title: "Nebula survey",
      kind: "supplemental",
      body: "Supplemental. The bloom resolved into a thin hydrogen filament, harmless and oddly beautiful on the viewer. I authorized two extra hours on station at science's request. Sometimes the job is simply to look.",
    }),
    entry({
      id: "e-seed-3",
      journalId: "j-personal",
      stardate: formatStardate(d3),
      createdAt: d3.getTime(),
      title: "Quiet watch",
      body: "The night watch is my favorite. The corridor lights dim, the hull talks a little, and for a few minutes nobody needs a decision.\n\nI keep meaning to write letters. Tonight I am writing this instead.",
    }),
    entry({
      id: "e-seed-4",
      journalId: "j-science",
      stardate: formatStardate(d2),
      createdAt: d2.getTime() + 3600000,
      title: "Filament composition",
      body: "Preliminary spectrography: ionized hydrogen with trace silicates. No baryonic density worth a detour, but the filament's helical twist is unusual. Logged for stellar cartography. Recommend a follow-up pass on the return leg.",
    }),
  ];
}
