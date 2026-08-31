import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-BQkc94eH.mjs";
import { d as seedEntries, f as uid, i as authMiddleware, n as DEFAULT_SETTINGS, t as DEFAULT_JOURNALS } from "./types-Dkfc3GeK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/log-api-DoK53v_e.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function mapJournal(row) {
	return {
		id: row.id,
		name: row.name,
		code: row.code,
		color: row.color,
		createdAt: Number(row.created_at)
	};
}
function mapEntry(row) {
	return {
		id: row.id,
		journalId: row.journal_id,
		stardate: row.stardate,
		title: row.title,
		body: row.body,
		kind: row.kind === "supplemental" ? "supplemental" : "standard",
		status: row.status === "filed" ? "filed" : "draft",
		hasAudio: Boolean(row.has_audio),
		durationMs: Number(row.duration_ms),
		createdAt: Number(row.created_at),
		updatedAt: Number(row.updated_at)
	};
}
function mapSettings(row) {
	const alert = row.alert === "red" || row.alert === "blue" ? row.alert : "normal";
	return {
		officerName: row.officer_name,
		rank: row.rank,
		vessel: row.vessel,
		registry: row.registry,
		soundEnabled: Boolean(row.sound_enabled),
		voiceEnabled: Boolean(row.voice_enabled),
		alert,
		booted: Boolean(row.booted)
	};
}
async function seedUser(userId) {
	const sql = await getSql();
	const idMap = /* @__PURE__ */ new Map();
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
		await sql`
      insert into log_entries (
        id, user_id, journal_id, stardate, title, body, kind, status,
        has_audio, duration_ms, created_at, updated_at
      ) values (
        ${uid("e")}, ${userId}, ${journalId}, ${e.stardate}, ${e.title}, ${e.body},
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
var fetchLogState_createServerFn_handler = createServerRpc({
	id: "4771bf0cb50e6cc7ff894d46b3f7f8945ca676eb728464a377b5ba40e58dcaf4",
	name: "fetchLogState",
	filename: "src/lib/log-api.ts"
}, (opts) => fetchLogState.__executeServer(opts));
var fetchLogState = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(fetchLogState_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	let journals = (await sql`
        select id, name, code, color, created_at
        from journals where user_id = ${context.userId}
        order by created_at asc
      `).map(mapJournal);
	if (journals.length === 0) {
		await seedUser(context.userId);
		journals = (await sql`
          select id, name, code, color, created_at
          from journals where user_id = ${context.userId}
          order by created_at asc
        `).map(mapJournal);
	}
	const entries = (await sql`
        select id, journal_id, stardate, title, body, kind, status,
               has_audio, duration_ms, created_at, updated_at
        from log_entries where user_id = ${context.userId}
        order by created_at desc
      `).map(mapEntry);
	const settingsRows = await sql`
      select officer_name, rank, vessel, registry, sound_enabled, voice_enabled, alert, booted
      from log_settings where user_id = ${context.userId}
    `;
	const settings = settingsRows[0] ? mapSettings(settingsRows[0]) : DEFAULT_SETTINGS;
	return {
		journals,
		entries,
		settings
	};
});
var saveJournalFn_createServerFn_handler = createServerRpc({
	id: "7190b96abcfbc71b6c0170ca5aa2a16073471f6216490f00dbf88d3527c5c04a",
	name: "saveJournalFn",
	filename: "src/lib/log-api.ts"
}, (opts) => saveJournalFn.__executeServer(opts));
var saveJournalFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveJournalFn_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
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
var deleteJournalFn_createServerFn_handler = createServerRpc({
	id: "0d502325c3bec84bc846a02aafe77d56bb15ab6770748840200bdca69a2da05f",
	name: "deleteJournalFn",
	filename: "src/lib/log-api.ts"
}, (opts) => deleteJournalFn.__executeServer(opts));
var deleteJournalFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(deleteJournalFn_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	await sql`delete from log_audio where user_id = ${context.userId} and entry_id in (select id from log_entries where user_id = ${context.userId} and journal_id = ${id})`;
	await sql`delete from log_entries where user_id = ${context.userId} and journal_id = ${id}`;
	await sql`delete from journals where user_id = ${context.userId} and id = ${id}`;
});
var saveEntryFn_createServerFn_handler = createServerRpc({
	id: "697dc241999c23faf5b89b55d3c6fbc7da994e265148570c88fb5fc125855b18",
	name: "saveEntryFn",
	filename: "src/lib/log-api.ts"
}, (opts) => saveEntryFn.__executeServer(opts));
var saveEntryFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveEntryFn_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
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
var deleteEntryFn_createServerFn_handler = createServerRpc({
	id: "6bba668daf5ca28c294757ec0c4cf209fc21bee8c4b0435a250cf700ba3b5f59",
	name: "deleteEntryFn",
	filename: "src/lib/log-api.ts"
}, (opts) => deleteEntryFn.__executeServer(opts));
var deleteEntryFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(deleteEntryFn_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	await sql`delete from log_audio where user_id = ${context.userId} and entry_id = ${id}`;
	await sql`delete from log_entries where user_id = ${context.userId} and id = ${id}`;
});
var saveSettingsFn_createServerFn_handler = createServerRpc({
	id: "04514e1a7d0d25c41838ab683aa7a11c57a9f6f461d6ec7973cb02b2621a4b58",
	name: "saveSettingsFn",
	filename: "src/lib/log-api.ts"
}, (opts) => saveSettingsFn.__executeServer(opts));
var saveSettingsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveSettingsFn_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
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
var MAX_AUDIO = 8388608;
var saveAudioFn_createServerFn_handler = createServerRpc({
	id: "fb0f6083a9842aa002caf6a9326421d4e89e42c8a04c9e0c36818b4ee945f3f9",
	name: "saveAudioFn",
	filename: "src/lib/log-api.ts"
}, (opts) => saveAudioFn.__executeServer(opts));
var saveAudioFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveAudioFn_createServerFn_handler, async ({ context, data }) => {
	if (data.data.length > MAX_AUDIO * 1.4) throw new Error("Voice file exceeds storage allotment.");
	const sql = await getSql();
	if (!(await sql`
      select id from log_entries where id = ${data.entryId} and user_id = ${context.userId}
    `)[0]) throw new Error("Log not on file.");
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
var loadAudioFn_createServerFn_handler = createServerRpc({
	id: "6d8fa0e80c55360f7558906bbb536877aab17c854a5a3f85d6f2da51c7a22584",
	name: "loadAudioFn",
	filename: "src/lib/log-api.ts"
}, (opts) => loadAudioFn.__executeServer(opts));
var loadAudioFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((entryId) => entryId).handler(loadAudioFn_createServerFn_handler, async ({ context, data: entryId }) => {
	return (await (await getSql())`
      select mime, data from log_audio where entry_id = ${entryId} and user_id = ${context.userId}
    `)[0] ?? null;
});
//#endregion
export { deleteEntryFn_createServerFn_handler, deleteJournalFn_createServerFn_handler, fetchLogState_createServerFn_handler, loadAudioFn_createServerFn_handler, saveAudioFn_createServerFn_handler, saveEntryFn_createServerFn_handler, saveJournalFn_createServerFn_handler, saveSettingsFn_createServerFn_handler };
