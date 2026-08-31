import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { uid } from "@/lib/utils";
import { DEFAULT_JOURNALS, seedEntries } from "@/lib/seed";
import { DEFAULT_SETTINGS } from "@/lib/types";
import type { Journal, LcarsSwatch, LogEntry, LogKind, Settings } from "@/lib/types";

type JournalRow = {
  id: string;
  name: string;
  code: string;
  color: string;
  created_at: number;
};

type EntryRow = {
  id: string;
  journal_id: string;
  stardate: string;
  title: string;
  body: string;
  kind: string;
  status: string;
  has_audio: boolean;
  duration_ms: number;
  created_at: number;
  updated_at: number;
};

type SettingsRow = {
  officer_name: string;
  rank: string;
  vessel: string;
  registry: string;
  sound_enabled: boolean;
  voice_enabled: boolean;
  alert: string;
  booted: boolean;
};

function mapJournal(row: JournalRow): Journal {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    color: row.color as LcarsSwatch,
    createdAt: Number(row.created_at),
  };
}

function mapEntry(row: EntryRow): LogEntry {
  return {
    id: row.id,
    journalId: row.journal_id,
    stardate: row.stardate,
    title: row.title,
    body: row.body,
    kind: (row.kind === "supplemental" ? "supplemental" : "standard") as LogKind,
    status: row.status === "filed" ? "filed" : "draft",
    hasAudio: Boolean(row.has_audio),
    durationMs: Number(row.duration_ms),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function mapSettings(row: SettingsRow): Settings {
  const alert = row.alert === "red" || row.alert === "blue" ? row.alert : "normal";
  return {
    officerName: row.officer_name,
    rank: row.rank,
    vessel: row.vessel,
    registry: row.registry,
    soundEnabled: Boolean(row.sound_enabled),
    voiceEnabled: Boolean(row.voice_enabled),
    alert,
    booted: Boolean(row.booted),
  };
}

async function seedUser(userId: string) {
  const sql = await getSql();
  const idMap = new Map<string, string>();
  const now = Date.now();
  for (const j of DEFAULT_JOURNALS) {
    const id = uid("j");
    idMap.set(j.id, id);
    await sql`
      insert into journals (id, user_id, name, code, color, created_at)
      values (${id}, ${userId}, ${j.name}, ${j.code}, ${j.color}, ${now})
    `;
  }
  const seeds = seedEntries();
  for (const e of seeds) {
    const journalId = idMap.get(e.journalId);
    if (!journalId) continue;
    const id = uid("e");
    await sql`
      insert into log_entries (
        id, user_id, journal_id, stardate, title, body, kind, status,
        has_audio, duration_ms, created_at, updated_at
      ) values (
        ${id}, ${userId}, ${journalId}, ${e.stardate}, ${e.title}, ${e.body},
        ${e.kind}, ${e.status}, ${e.hasAudio}, ${e.durationMs},
        ${e.createdAt}, ${e.updatedAt}
      )
    `;
  }
  const s = DEFAULT_SETTINGS;
  await sql`
    insert into log_settings (
      user_id, officer_name, rank, vessel, registry,
      sound_enabled, voice_enabled, alert, booted
    ) values (
      ${userId}, ${s.officerName}, ${s.rank}, ${s.vessel}, ${s.registry},
      ${s.soundEnabled}, ${s.voiceEnabled}, ${s.alert}, ${s.booted}
    )
    on conflict (user_id) do nothing
  `;
}

export const fetchLogState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    let journals = (
      await sql<JournalRow>`
        select id, name, code, color, created_at
        from journals where user_id = ${context.userId}
        order by created_at asc
      `
    ).map(mapJournal);

    if (journals.length === 0) {
      await seedUser(context.userId);
      journals = (
        await sql<JournalRow>`
          select id, name, code, color, created_at
          from journals where user_id = ${context.userId}
          order by created_at asc
        `
      ).map(mapJournal);
    }

    const entries = (
      await sql<EntryRow>`
        select id, journal_id, stardate, title, body, kind, status,
               has_audio, duration_ms, created_at, updated_at
        from log_entries where user_id = ${context.userId}
        order by created_at desc
      `
    ).map(mapEntry);

    const settingsRows = await sql<SettingsRow>`
      select officer_name, rank, vessel, registry, sound_enabled, voice_enabled, alert, booted
      from log_settings where user_id = ${context.userId}
    `;
    const settings = settingsRows[0] ? mapSettings(settingsRows[0]) : DEFAULT_SETTINGS;

    return { journals, entries, settings };
  });

export const saveJournalFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: Journal) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into journals (id, user_id, name, code, color, created_at)
      values (${data.id}, ${context.userId}, ${data.name}, ${data.code}, ${data.color}, ${data.createdAt})
      on conflict (id) do update set
        name = excluded.name,
        code = excluded.code,
        color = excluded.color
      where journals.user_id = ${context.userId}
    `;
    return data;
  });

export const deleteJournalFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from log_audio where user_id = ${context.userId} and entry_id in (select id from log_entries where user_id = ${context.userId} and journal_id = ${id})`;
    await sql`delete from log_entries where user_id = ${context.userId} and journal_id = ${id}`;
    await sql`delete from journals where user_id = ${context.userId} and id = ${id}`;
  });

export const saveEntryFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: LogEntry) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into log_entries (
        id, user_id, journal_id, stardate, title, body, kind, status,
        has_audio, duration_ms, created_at, updated_at
      ) values (
        ${data.id}, ${context.userId}, ${data.journalId}, ${data.stardate},
        ${data.title}, ${data.body}, ${data.kind}, ${data.status},
        ${data.hasAudio}, ${data.durationMs}, ${data.createdAt}, ${data.updatedAt}
      )
      on conflict (id) do update set
        title = excluded.title,
        body = excluded.body,
        kind = excluded.kind,
        status = excluded.status,
        has_audio = excluded.has_audio,
        duration_ms = excluded.duration_ms,
        updated_at = excluded.updated_at
      where log_entries.user_id = ${context.userId}
    `;
    return data;
  });

export const deleteEntryFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from log_audio where user_id = ${context.userId} and entry_id = ${id}`;
    await sql`delete from log_entries where user_id = ${context.userId} and id = ${id}`;
  });

export const saveSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: Settings) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into log_settings (
        user_id, officer_name, rank, vessel, registry,
        sound_enabled, voice_enabled, alert, booted
      ) values (
        ${context.userId}, ${data.officerName}, ${data.rank}, ${data.vessel}, ${data.registry},
        ${data.soundEnabled}, ${data.voiceEnabled}, ${data.alert}, ${data.booted}
      )
      on conflict (user_id) do update set
        officer_name = excluded.officer_name,
        rank = excluded.rank,
        vessel = excluded.vessel,
        registry = excluded.registry,
        sound_enabled = excluded.sound_enabled,
        voice_enabled = excluded.voice_enabled,
        alert = excluded.alert,
        booted = excluded.booted
    `;
  });

const MAX_AUDIO = 8 * 1024 * 1024;

export const saveAudioFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { entryId: string; mime: string; data: string }) => data)
  .handler(async ({ context, data }) => {
    if (data.data.length > MAX_AUDIO * 1.4) {
      throw new Error("Voice file exceeds storage allotment.");
    }
    const sql = await getSql();
    const owned = await sql<{ id: string }>`
      select id from log_entries where id = ${data.entryId} and user_id = ${context.userId}
    `;
    if (!owned[0]) throw new Error("Log not on file.");
    await sql`
      insert into log_audio (entry_id, user_id, mime, data)
      values (${data.entryId}, ${context.userId}, ${data.mime}, ${data.data})
      on conflict (entry_id) do update set mime = excluded.mime, data = excluded.data
      where log_audio.user_id = ${context.userId}
    `;
    await sql`
      update log_entries set has_audio = true, updated_at = ${Date.now()}
      where id = ${data.entryId} and user_id = ${context.userId}
    `;
  });

export const loadAudioFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((entryId: string) => entryId)
  .handler(async ({ context, data: entryId }) => {
    const sql = await getSql();
    const rows = await sql<{ mime: string; data: string }>`
      select mime, data from log_audio where entry_id = ${entryId} and user_id = ${context.userId}
    `;
    return rows[0] ?? null;
  });
