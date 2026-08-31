import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authClient } from "./client-B40BzJxt.mjs";
import { f as uid, i as authMiddleware, n as DEFAULT_SETTINGS, s as cn, t as DEFAULT_JOURNALS, u as formatStardate } from "./types-Dkfc3GeK.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-current-user-D6rNJ3L1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
var muted = false;
var voiceMuted = false;
var bootPlayed = false;
function setSoundEnabled(on) {
	muted = !on;
}
function setVoiceEnabled(on) {
	voiceMuted = !on;
	if (voiceMuted && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
async function unlockAudio() {
	if (typeof window === "undefined") return;
	const Ctor = window.AudioContext || window.webkitAudioContext;
	if (!Ctor) return;
	if (!ctx) ctx = new Ctor();
	if (ctx.state === "suspended") await ctx.resume();
}
function envGain(node, start, peak, dur, attack = .008) {
	if (!ctx) return;
	const g = ctx.createGain();
	g.gain.setValueAtTime(1e-4, start);
	g.gain.exponentialRampToValueAtTime(peak, start + attack);
	g.gain.exponentialRampToValueAtTime(1e-4, start + dur);
	node.connect(g);
	g.connect(ctx.destination);
	return g;
}
function tone(freq, dur, when = 0, type = "sine", peak = .07, slide) {
	if (!ctx) return;
	const t = ctx.currentTime + when;
	const osc = ctx.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t);
	if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
	envGain(osc, t, peak, dur);
	osc.start(t);
	osc.stop(t + dur + .02);
}
function playPatch(name) {
	if (!ctx) return;
	switch (name) {
		case "tap":
			tone(1680, .045, 0, "sine", .05);
			break;
		case "chirp":
			tone(1400, .07, 0, "sine", .06, 2200);
			tone(2200, .05, .05, "sine", .04);
			break;
		case "open":
			tone(880, .09, 0, "triangle", .05);
			tone(1320, .1, .07, "sine", .05);
			break;
		case "confirm":
			tone(980, .08, 0, "sine", .05);
			tone(1470, .1, .08, "sine", .055);
			break;
		case "error":
			tone(240, .18, 0, "square", .04);
			tone(180, .22, .12, "square", .035);
			break;
		case "recordOn":
			tone(660, .1, 0, "sine", .06, 990);
			tone(1320, .12, .1, "sine", .05);
			break;
		case "recordOff":
			tone(1320, .1, 0, "sine", .05, 660);
			tone(440, .14, .1, "triangle", .04);
			break;
		case "success":
			tone(784, .09, 0, "sine", .05);
			tone(1046, .1, .08, "sine", .05);
			tone(1318, .14, .16, "sine", .055);
			break;
		case "boot":
			if (bootPlayed) {
				tone(880, .08, 0, "sine", .04);
				return;
			}
			bootPlayed = true;
			[
				523,
				659,
				784,
				1046
			].forEach((f, i) => tone(f, .12, i * .11, "sine", .045));
			tone(1568, .22, .48, "sine", .04);
	}
}
function play(name) {
	if (muted || typeof window === "undefined") return;
	unlockAudio().then(() => playPatch(name));
}
function pickVoice() {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
	const voices = window.speechSynthesis.getVoices();
	for (const re of [
		/google uk english female/i,
		/samantha/i,
		/karen/i,
		/moira/i,
		/zira/i,
		/female/i
	]) {
		const v = voices.find((voice) => re.test(voice.name));
		if (v) return v;
	}
	return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}
function speak(text) {
	if (voiceMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
	window.speechSynthesis.cancel();
	const u = new SpeechSynthesisUtterance(text);
	u.rate = .92;
	u.pitch = .88;
	u.volume = .85;
	const voice = pickVoice();
	if (voice) u.voice = voice;
	window.speechSynthesis.speak(u);
}
function getRecognitionCtor() {
	if (typeof window === "undefined") return null;
	return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}
function pickRecorderMime() {
	if (typeof MediaRecorder === "undefined") return "";
	return [
		"audio/webm;codecs=opus",
		"audio/webm",
		"audio/mp4"
	].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var fetchLogState = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4771bf0cb50e6cc7ff894d46b3f7f8945ca676eb728464a377b5ba40e58dcaf4"));
var saveJournalFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("7190b96abcfbc71b6c0170ca5aa2a16073471f6216490f00dbf88d3527c5c04a"));
var deleteJournalFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("0d502325c3bec84bc846a02aafe77d56bb15ab6770748840200bdca69a2da05f"));
var saveEntryFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("697dc241999c23faf5b89b55d3c6fbc7da994e265148570c88fb5fc125855b18"));
var deleteEntryFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("6bba668daf5ca28c294757ec0c4cf209fc21bee8c4b0435a250cf700ba3b5f59"));
var saveSettingsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("04514e1a7d0d25c41838ab683aa7a11c57a9f6f461d6ec7973cb02b2621a4b58"));
var saveAudioFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("fb0f6083a9842aa002caf6a9326421d4e89e42c8a04c9e0c36818b4ee945f3f9"));
var loadAudioFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((entryId) => entryId).handler(createSsrRpc("6d8fa0e80c55360f7558906bbb536877aab17c854a5a3f85d6f2da51c7a22584"));
var useLogStore = create((set, get) => ({
	hydrated: false,
	journals: DEFAULT_JOURNALS,
	entries: [],
	settings: DEFAULT_SETTINGS,
	selectedJournalId: "",
	selectedEntryId: null,
	query: "",
	hydrate: async () => {
		try {
			const { journals, entries, settings } = await fetchLogState();
			const selectedJournalId = journals[0]?.id ?? "";
			set({
				journals,
				entries,
				settings,
				selectedJournalId,
				selectedEntryId: entries.find((e) => e.journalId === selectedJournalId)?.id ?? null,
				hydrated: true
			});
		} catch {
			set({ hydrated: true });
		}
	},
	reset: () => {
		set({
			hydrated: false,
			journals: DEFAULT_JOURNALS,
			entries: [],
			settings: DEFAULT_SETTINGS,
			selectedJournalId: "",
			selectedEntryId: null,
			query: ""
		});
	},
	selectJournal: (id) => {
		const { entries } = get();
		set({
			selectedJournalId: id,
			selectedEntryId: entries.find((e) => e.journalId === id)?.id ?? null,
			query: ""
		});
	},
	selectEntry: (id) => set({ selectedEntryId: id }),
	setQuery: (q) => set({ query: q }),
	createJournal: async (name, color) => {
		const journal = {
			id: uid("j"),
			name: name.trim() || "Untitled Log",
			code: `USR-${Math.floor(Math.random() * 90 + 10)}`,
			color,
			createdAt: Date.now()
		};
		set({
			journals: [...get().journals, journal],
			selectedJournalId: journal.id,
			selectedEntryId: null
		});
		await saveJournalFn({ data: journal });
		return journal;
	},
	deleteJournal: async (id) => {
		const { journals, entries, selectedJournalId } = get();
		if (journals.length <= 1) return;
		const nextJ = journals.filter((j) => j.id !== id);
		const nextE = entries.filter((e) => e.journalId !== id);
		const nextSelected = selectedJournalId === id ? nextJ[0].id : selectedJournalId;
		set({
			journals: nextJ,
			entries: nextE,
			selectedJournalId: nextSelected,
			selectedEntryId: nextE.find((e) => e.journalId === nextSelected)?.id ?? null
		});
		await deleteJournalFn({ data: id });
	},
	createEntry: async (opts) => {
		const { selectedJournalId, entries } = get();
		const now = /* @__PURE__ */ new Date();
		const log = {
			id: uid("e"),
			journalId: selectedJournalId,
			stardate: formatStardate(now),
			createdAt: now.getTime(),
			updatedAt: now.getTime(),
			title: opts?.title ?? "",
			body: opts?.body ?? "",
			kind: opts?.kind ?? "standard",
			hasAudio: false,
			durationMs: 0,
			status: "draft"
		};
		set({
			entries: [log, ...entries],
			selectedEntryId: log.id
		});
		await saveEntryFn({ data: log });
		return log;
	},
	updateEntry: (id, patch) => {
		const entries = get().entries.map((e) => e.id === id ? {
			...e,
			...patch,
			updatedAt: Date.now()
		} : e);
		set({ entries });
		const next = entries.find((e) => e.id === id);
		if (next) saveEntryFn({ data: next });
	},
	fileEntry: (id) => {
		get().updateEntry(id, { status: "filed" });
	},
	deleteEntry: async (id) => {
		const { entries, selectedEntryId, selectedJournalId } = get();
		const next = entries.filter((e) => e.id !== id);
		set({
			entries: next,
			selectedEntryId: selectedEntryId === id ? next.find((e) => e.journalId === selectedJournalId)?.id ?? null : selectedEntryId
		});
		await deleteEntryFn({ data: id });
	},
	updateSettings: (patch) => {
		const settings = {
			...get().settings,
			...patch
		};
		set({ settings });
		saveSettingsFn({ data: settings });
	}
}));
function visibleEntries(entries, journalId, query) {
	const q = query.trim().toLowerCase();
	return entries.filter((e) => e.journalId === journalId).filter((e) => {
		if (!q) return true;
		return e.body.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.stardate.includes(q);
	}).sort((a, b) => b.createdAt - a.createdAt);
}
function patchAlert(alert) {
	if (typeof document === "undefined") return;
	document.documentElement.dataset.alert = alert === "normal" ? "" : alert;
}
var SWATCH_BG = {
	orange: "bg-lcars-orange",
	peach: "bg-lcars-peach",
	gold: "bg-lcars-gold",
	lilac: "bg-lcars-lilac",
	blue: "bg-lcars-blue",
	eggplant: "bg-lcars-eggplant text-lcars-peach"
};
var TONE = {
	...SWATCH_BG,
	canary: "bg-lcars-canary",
	navy: "bg-lcars-navy text-lcars-peach",
	alert: "bg-lcars-alert text-lcars-canary"
};
var SHAPE = {
	"hand-right": "lcars-hand-right",
	"hand-left": "lcars-hand-left",
	pill: "lcars-pill",
	block: "rounded-none",
	foot: "rounded-none rounded-bl-lcars"
};
var TALL = {
	sm: "min-h-11 text-sm",
	md: "min-h-14 text-base",
	lg: "min-h-16 text-lg",
	xl: "min-h-20 text-xl"
};
function LcarsButton({ tone = "orange", shape = "hand-right", active, tall = "md", className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("lcars-btn w-full", TONE[tone], SHAPE[shape], TALL[tall], active && "ring-2 ring-lcars-canary ring-offset-2 ring-offset-void", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "lcars-label",
			children
		})
	});
}
function LcarsBar({ tone = "orange", shape = "hand-right", className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-end justify-end px-3 py-1.5 text-void lcars-label", TONE[tone], SHAPE[shape], className),
		children
	});
}
function LcarsField({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("grid gap-1", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "lcars-label text-sm text-lcars-orange",
			children: label
		}), children]
	});
}
function LcarsInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("lcars-input min-h-11 border-b-4 border-lcars-orange bg-void px-2 py-2 font-body text-base text-lcars-peach", className),
		...props
	});
}
function LcarsTextarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("lcars-textarea h-full min-h-40 text-base md:text-lg", className),
		...props
	});
}
function ModalScrim({ children, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-void/80 p-3 sm:items-center",
		onClick: onClose,
		role: "presentation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "dialog",
			"aria-modal": "true",
			className: "max-h-[90dvh] w-full max-w-lg overflow-y-auto fade-rise",
			onClick: (e) => e.stopPropagation(),
			children
		})
	});
}
function IdentifyingScreen({ message = "Identifying officer…" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-void p-3 sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-stretch gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-16 w-20 shrink-0 items-end justify-end bg-lcars-orange px-2 py-1 sm:h-20 sm:w-32",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lcars-label text-sm text-void",
					children: "47-21"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-end justify-between rounded-r-hand bg-lcars-orange px-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lcars-label text-2xl text-void sm:text-4xl",
					children: "LCARS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lcars-label hidden text-lg text-void sm:inline",
					children: "Access"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex min-h-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-20 shrink-0 flex-col gap-1 sm:w-32",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative h-12 bg-lcars-orange",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-0 bottom-0 h-8 w-8 rounded-tl-pit bg-void" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 bg-lcars-lilac" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 rounded-bl-lcars bg-lcars-gold" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col justify-center pl-4 sm:pl-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lcars-label text-xs tracking-[0.18em] text-lcars-blue sm:text-sm",
						children: "Restricted — authorized officers only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "lcars-label mt-2 text-4xl text-lcars-peach sm:text-6xl",
						children: "Captain's Log"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lcars-label rec-pulse mt-8 text-2xl text-lcars-orange",
						children: message
					})
				]
			})]
		})]
	});
}
function BootScreen() {
	const updateSettings = useLogStore((s) => s.updateSettings);
	const settings = useLogStore((s) => s.settings);
	const [phase, setPhase] = (0, import_react.useState)("idle");
	(0, import_react.useEffect)(() => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-void p-3 sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-stretch gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-16 w-20 shrink-0 items-end justify-end bg-lcars-orange px-2 py-1 sm:h-24 sm:w-36",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lcars-label text-sm text-void sm:text-base",
					children: "47-21"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-end justify-between bg-lcars-orange lcars-hand-right px-4 py-2 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lcars-label text-3xl text-void sm:text-5xl md:text-6xl",
					children: "LCARS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lcars-label hidden text-lg text-void sm:inline",
					children: "Sys 47.3"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex min-h-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-20 shrink-0 flex-col gap-1 sm:w-36",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative h-14 bg-lcars-orange sm:h-20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-0 bottom-0 h-10 w-10 rounded-tl-pit bg-void sm:h-14 sm:w-14" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-h-16 flex-1 items-end justify-end bg-lcars-lilac px-2 py-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "lcars-label text-sm text-void",
							children: "02-184"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-14 items-end justify-end bg-lcars-gold px-2 py-1 sm:h-20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "lcars-label text-sm text-void",
							children: "09-330"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-12 items-end justify-end rounded-bl-lcars bg-lcars-peach px-2 py-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "lcars-label text-sm text-void",
							children: "11-005"
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col pl-4 sm:pl-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 sm:h-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-0 flex-1 flex-col justify-center pb-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lcars-label text-lcars-blue text-xs tracking-[0.18em] sm:text-sm",
							children: "Library Computer Access and Retrieval"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "lcars-label mt-2 text-5xl leading-none text-lcars-peach sm:text-7xl md:text-8xl text-balance",
							children: "Captain's Log"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-display text-base uppercase tracking-wide text-lcars-gold sm:text-xl",
							children: [
								"Personal log system · ",
								settings.vessel,
								" · ",
								settings.registry
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-display text-base uppercase text-lcars-lilac tabular-nums sm:text-lg",
							children: ["Stardate ", sd]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 max-w-xl space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "boot-bar h-3.5 bg-lcars-orange lcars-hand-right" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "boot-bar h-3.5 w-4/5 bg-lcars-peach lcars-hand-right",
									style: { animationDelay: "80ms" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "boot-bar h-3.5 w-2/3 bg-lcars-lilac lcars-hand-right",
									style: { animationDelay: "160ms" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "boot-bar h-3.5 w-1/2 bg-lcars-gold lcars-hand-right",
									style: { animationDelay: "240ms" }
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-10 w-full max-w-sm",
							children: phase === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
								tone: "orange",
								shape: "pill",
								tall: "lg",
								onClick: () => void initialize(),
								children: "Touch to initialize"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lcars-label text-2xl text-lcars-orange rec-pulse",
								children: "Accessing data banks…"
							})
						})
					]
				})]
			})]
		})]
	});
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
//#endregion
export { visibleEntries as C, useLogStore as S, setVoiceEnabled as _, LcarsField as a, useCurrentUser as b, ModalScrim as c, loadAudioFn as d, patchAlert as f, setSoundEnabled as g, saveAudioFn as h, LcarsButton as i, SWATCH_BG as l, play as m, IdentifyingScreen as n, LcarsInput as o, pickRecorderMime as p, LcarsBar as r, LcarsTextarea as s, BootScreen as t, getRecognitionCtor as u, speak as v, useCurrentUserState as x, unlockAudio as y };
