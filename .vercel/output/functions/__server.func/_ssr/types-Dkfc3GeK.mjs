import { n as createMiddleware } from "./ssr.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/types-Dkfc3GeK.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-B40BzJxt.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-DmAkJzPS.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = String(reader.result ?? "");
			const i = result.indexOf(",");
			resolve(i >= 0 ? result.slice(i + 1) : result);
		};
		reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("Could not read audio."));
		reader.readAsDataURL(blob);
	});
}
function base64ToBlob(data, mime) {
	const binary = atob(data);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new Blob([bytes], { type: mime || "audio/webm" });
}
/** TNG-era stardate: map Earth year +338 so 2026 reads as 2364 (SD 41xxx.x). */
var TNG_YEAR_OFFSET = 338;
var TNG_EPOCH_YEAR = 2364;
var TNG_EPOCH_SD = 41e3;
function toStardate(date = /* @__PURE__ */ new Date()) {
	const tngYear = date.getFullYear() + TNG_YEAR_OFFSET;
	const start = Date.UTC(date.getFullYear(), 0, 1);
	const dayFraction = (date.getTime() - start) / 315576e5;
	return TNG_EPOCH_SD + (tngYear - TNG_EPOCH_YEAR) * 1e3 + dayFraction * 1e3;
}
function formatStardate(date = /* @__PURE__ */ new Date()) {
	return toStardate(date).toFixed(1);
}
function formatShipTime(date = /* @__PURE__ */ new Date()) {
	return `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}.${String(date.getSeconds()).padStart(2, "0")}`;
}
function formatEarthDate(date = /* @__PURE__ */ new Date()) {
	return date.toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});
}
var DEFAULT_JOURNALS = [
	{
		id: "j-captain",
		name: "Captain's Log",
		code: "CAP-01",
		color: "orange",
		createdAt: 0
	},
	{
		id: "j-personal",
		name: "Personal Log",
		code: "PER-07",
		color: "peach",
		createdAt: 0
	},
	{
		id: "j-science",
		name: "Science Log",
		code: "SCI-12",
		color: "blue",
		createdAt: 0
	},
	{
		id: "j-medical",
		name: "Medical Log",
		code: "MED-04",
		color: "lilac",
		createdAt: 0
	},
	{
		id: "j-engineering",
		name: "Engineering Log",
		code: "ENG-09",
		color: "gold",
		createdAt: 0
	}
];
function daysAgo(n) {
	return /* @__PURE__ */ new Date(Date.now() - n * 864e5);
}
function entry(partial) {
	return {
		hasAudio: false,
		durationMs: 0,
		status: "filed",
		kind: "standard",
		updatedAt: partial.createdAt,
		...partial
	};
}
function seedEntries() {
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
			body: "We have cleared spacedock and set a heading for the outer patrol corridor. All departments report ready. The crew is in good spirits — I intend to keep it that way.\n\nScience has flagged a faint particle bloom two light-years off the port bow. We will have a look, then resume the assigned route."
		}),
		entry({
			id: "e-seed-2",
			journalId: "j-captain",
			stardate: formatStardate(d2),
			createdAt: d2.getTime(),
			title: "Nebula survey",
			kind: "supplemental",
			body: "Supplemental. The bloom resolved into a thin hydrogen filament, harmless and oddly beautiful on the viewer. I authorized two extra hours on station at science's request. Sometimes the job is simply to look."
		}),
		entry({
			id: "e-seed-3",
			journalId: "j-personal",
			stardate: formatStardate(d3),
			createdAt: d3.getTime(),
			title: "Quiet watch",
			body: "The night watch is my favorite. The corridor lights dim, the hull talks a little, and for a few minutes nobody needs a decision.\n\nI keep meaning to write letters. Tonight I am writing this instead."
		}),
		entry({
			id: "e-seed-4",
			journalId: "j-science",
			stardate: formatStardate(d2),
			createdAt: d2.getTime() + 36e5,
			title: "Filament composition",
			body: "Preliminary spectrography: ionized hydrogen with trace silicates. No baryonic density worth a detour, but the filament's helical twist is unusual. Logged for stellar cartography. Recommend a follow-up pass on the return leg."
		})
	];
}
var LCARS_SWATCHES = [
	"orange",
	"peach",
	"gold",
	"lilac",
	"blue",
	"eggplant"
];
var DEFAULT_SETTINGS = {
	officerName: "",
	rank: "Captain",
	vessel: "USS Horizon",
	registry: "NCC-2187",
	soundEnabled: true,
	voiceEnabled: true,
	alert: "normal",
	booted: false
};
//#endregion
export { base64ToBlob as a, formatEarthDate as c, seedEntries as d, uid as f, authMiddleware as i, formatShipTime as l, DEFAULT_SETTINGS as n, blobToBase64 as o, LCARS_SWATCHES as r, cn as s, DEFAULT_JOURNALS as t, formatStardate as u };
