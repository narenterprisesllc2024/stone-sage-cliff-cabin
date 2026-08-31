import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, _ as Navigate, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { a as base64ToBlob, c as formatEarthDate, l as formatShipTime, o as blobToBase64, r as LCARS_SWATCHES, s as cn, u as formatStardate } from "./types-Dkfc3GeK.mjs";
import { C as visibleEntries, S as useLogStore, _ as setVoiceEnabled, a as LcarsField, b as useCurrentUser, c as ModalScrim, d as loadAudioFn, f as patchAlert, g as setSoundEnabled, h as saveAudioFn, i as LcarsButton, l as SWATCH_BG, m as play, n as IdentifyingScreen, o as LcarsInput, p as pickRecorderMime, r as LcarsBar, s as LcarsTextarea, t as BootScreen, u as getRecognitionCtor, v as speak, x as useCurrentUserState, y as unlockAudio } from "./use-current-user-D6rNJ3L1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BHpWFXHB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Recorder({ open, onClose }) {
	const journals = useLogStore((s) => s.journals);
	const selectedJournalId = useLogStore((s) => s.selectedJournalId);
	const createEntry = useLogStore((s) => s.createEntry);
	const updateEntry = useLogStore((s) => s.updateEntry);
	const fileEntry = useLogStore((s) => s.fileEntry);
	const settings = useLogStore((s) => s.settings);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const [finalText, setFinalText] = (0, import_react.useState)("");
	const [interim, setInterim] = (0, import_react.useState)("");
	const [levels, setLevels] = (0, import_react.useState)(() => Array(16).fill(0));
	const [error, setError] = (0, import_react.useState)(null);
	const [micOk, setMicOk] = (0, import_react.useState)(false);
	const recRef = (0, import_react.useRef)(null);
	const chunksRef = (0, import_react.useRef)([]);
	const streamRef = (0, import_react.useRef)(null);
	const recgRef = (0, import_react.useRef)(null);
	const rafRef = (0, import_react.useRef)(0);
	const startedRef = (0, import_react.useRef)(0);
	const analyserRef = (0, import_react.useRef)(null);
	const audioCtxRef = (0, import_react.useRef)(null);
	const finalRef = (0, import_react.useRef)("");
	const journal = journals.find((j) => j.id === selectedJournalId);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		begin();
		return () => teardown();
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!running) return;
		const id = window.setInterval(() => {
			setElapsed(Date.now() - startedRef.current);
		}, 200);
		return () => window.clearInterval(id);
	}, [running]);
	async function begin() {
		setError(null);
		setFinalText("");
		setInterim("");
		finalRef.current = "";
		setElapsed(0);
		chunksRef.current = [];
		await unlockAudio();
		play("recordOn");
		speak("Recording.");
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			setMicOk(true);
			const actx = new (window.AudioContext || window.webkitAudioContext)();
			audioCtxRef.current = actx;
			const src = actx.createMediaStreamSource(stream);
			const analyser = actx.createAnalyser();
			analyser.fftSize = 32;
			src.connect(analyser);
			analyserRef.current = analyser;
			pumpMeters();
			const mime = pickRecorderMime();
			const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
			recRef.current = rec;
			rec.ondataavailable = (ev) => {
				if (ev.data.size > 0) chunksRef.current.push(ev.data);
			};
			rec.start(250);
		} catch {
			setMicOk(false);
			setError("Audio input unavailable. Speak if dictation is online, or enter the log manually.");
		}
		const Recg = getRecognitionCtor();
		if (Recg) {
			const recg = new Recg();
			recg.continuous = true;
			recg.interimResults = true;
			recg.lang = "en-US";
			recg.onresult = (ev) => {
				let nextFinal = finalRef.current;
				let nextInterim = "";
				for (let i = ev.resultIndex; i < ev.results.length; i++) {
					const piece = ev.results[i][0]?.transcript ?? "";
					if (ev.results[i].isFinal) nextFinal = `${nextFinal}${nextFinal ? " " : ""}${piece}`.replace(/\s+/g, " ").trim();
					else nextInterim += piece;
				}
				finalRef.current = nextFinal;
				setFinalText(nextFinal);
				setInterim(nextInterim);
			};
			recg.onerror = () => {};
			recg.onend = () => {
				if (recRef.current && recRef.current.state !== "inactive") try {
					recg.start();
				} catch {}
			};
			recgRef.current = recg;
			try {
				recg.start();
			} catch {}
		} else if (!error) setError("Live dictation is not available in this browser. Audio will still be stored.");
		startedRef.current = Date.now();
		setRunning(true);
	}
	function pumpMeters() {
		const analyser = analyserRef.current;
		if (!analyser) return;
		const data = new Uint8Array(analyser.frequencyBinCount);
		const tick = () => {
			analyser.getByteFrequencyData(data);
			const bars = [];
			const step = Math.max(1, Math.floor(data.length / 16));
			for (let i = 0; i < 16; i++) bars.push((data[i * step] ?? 0) / 255);
			setLevels(bars);
			rafRef.current = requestAnimationFrame(tick);
		};
		rafRef.current = requestAnimationFrame(tick);
	}
	function teardown() {
		cancelAnimationFrame(rafRef.current);
		try {
			recgRef.current?.abort();
		} catch {}
		recgRef.current = null;
		if (recRef.current && recRef.current.state !== "inactive") try {
			recRef.current.stop();
		} catch {}
		recRef.current = null;
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		audioCtxRef.current?.close();
		audioCtxRef.current = null;
		analyserRef.current = null;
		setRunning(false);
	}
	async function fileLog() {
		const rec = recRef.current;
		const mime = rec?.mimeType || pickRecorderMime() || "audio/webm";
		const done = new Promise((resolve) => {
			if (!rec || rec.state === "inactive") {
				resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type: mime }) : null);
				return;
			}
			rec.onstop = () => {
				resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type: mime }) : null);
			};
			try {
				rec.stop();
			} catch {
				resolve(null);
			}
		});
		try {
			recgRef.current?.stop();
		} catch {}
		const blob = await done;
		const durationMs = Date.now() - startedRef.current;
		const body = `${finalRef.current}${interim ? ` ${interim}` : ""}`.trim();
		const title = body.split(/\s+/).slice(0, 6).join(" ");
		const entry = await createEntry({
			body,
			title: title.length > 40 ? `${title.slice(0, 37)}…` : title
		});
		if (blob && blob.size > 0) {
			const data = await blobToBase64(blob);
			await saveAudioFn({ data: {
				entryId: entry.id,
				mime: blob.type || mime,
				data
			} });
			updateEntry(entry.id, {
				hasAudio: true,
				durationMs,
				status: "filed"
			});
		} else fileEntry(entry.id);
		teardown();
		play("success");
		speak(`Log recorded. Stardate ${entry.stardate}.`);
		onClose();
	}
	function discard() {
		teardown();
		play("recordOff");
		onClose();
	}
	if (!open) return null;
	const mm = String(Math.floor(elapsed / 6e4)).padStart(2, "0");
	const ss = String(Math.floor(elapsed / 1e3 % 60)).padStart(2, "0");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-30 flex flex-col bg-void p-3 sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-stretch gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 w-16 bg-lcars-alert sm:w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 items-end justify-between bg-lcars-alert lcars-hand-right px-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lcars-label rec-pulse text-xl text-lcars-canary sm:text-3xl",
					children: "Recording"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "lcars-label tabular-nums text-xl text-void sm:text-3xl",
					children: [
						mm,
						":",
						ss
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex min-h-0 flex-1 gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden w-24 shrink-0 flex-col gap-1 sm:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative h-10 bg-lcars-alert",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-0 bottom-0 h-7 w-7 rounded-tl-pit bg-void" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 bg-lcars-eggplant" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 bg-lcars-orange rounded-bl-lcars" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col bg-void pl-0 sm:pl-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "lcars-label text-sm text-lcars-gold",
						children: [
							journal?.name ?? "Log",
							" · ",
							settings.vessel,
							" · ",
							formatShipTime()
						]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-sm uppercase text-lcars-alert",
						children: error
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-sm uppercase text-lcars-lilac",
						children: micOk ? "Voice channel open · dictation live" : "Waiting for audio channel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex h-16 items-end gap-1",
						children: levels.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("w-full rounded-t-sm", i % 3 === 0 ? "bg-lcars-orange" : i % 3 === 1 ? "bg-lcars-peach" : "bg-lcars-gold"),
							style: { height: `${Math.max(8, v * 100)}%` }
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lcars-scroll mt-5 min-h-0 flex-1 overflow-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-body text-lg leading-relaxed text-lcars-peach text-pretty md:text-2xl",
							children: finalText || interim ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [finalText, interim ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-lcars-lilac",
								children: [" ", interim]
							}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lcars-eggplant",
								children: "Awaiting voice input…"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-2 sm:max-w-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
							tone: "gold",
							shape: "pill",
							tall: "lg",
							onClick: discard,
							children: "Discard"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
							tone: "orange",
							shape: "pill",
							tall: "lg",
							onClick: () => void fileLog(),
							children: "File log"
						})]
					})
				]
			})]
		})]
	});
}
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function SettingsPanel({ onClose }) {
	const settings = useLogStore((s) => s.settings);
	const updateSettings = useLogStore((s) => s.updateSettings);
	const createJournal = useLogStore((s) => s.createJournal);
	const journals = useLogStore((s) => s.journals);
	const deleteJournal = useLogStore((s) => s.deleteJournal);
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [color, setColor] = (0, import_react.useState)("orange");
	function setAlert(alert) {
		play("open");
		updateSettings({ alert });
		patchAlert(alert);
		if (alert === "red") speak("Red alert.");
		else if (alert === "blue") speak("Blue alert.");
		else speak("Condition green.");
	}
	function addJournal() {
		if (!name.trim()) return;
		createJournal(name, color);
		play("confirm");
		speak(`${name} file created.`);
		setName("");
	}
	function endShift() {
		if (signingOut) return;
		setSigningOut(true);
		play("open");
		signOut().catch(() => setSigningOut(false));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModalScrim, {
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-void",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 w-10 bg-lcars-lilac" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsBar, {
					tone: "lilac",
					className: "h-12 flex-1 text-2xl",
					children: "Library config"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-10 bg-lcars-lilac",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative h-8 bg-lcars-lilac",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-0 bottom-0 h-6 w-6 rounded-tl-pit bg-void" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-5 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lcars-label mb-2 text-sm text-lcars-orange",
								children: "Duty officer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-lcars-eggplant px-3 py-2 text-lcars-peach [&_button]:font-display [&_button]:uppercase [&_button]:tracking-wide [&_button]:text-lcars-alert [&_span]:font-display [&_span]:uppercase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 max-w-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									tone: "alert",
									shape: "pill",
									tall: "sm",
									disabled: signingOut,
									onClick: endShift,
									children: signingOut ? "Signing out…" : "End shift"
								})
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsField, {
									label: "Rank",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
										value: settings.rank,
										onChange: (e) => updateSettings({ rank: e.target.value })
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsField, {
									label: "Officer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
										value: settings.officerName,
										onChange: (e) => updateSettings({ officerName: e.target.value }),
										placeholder: "Name"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsField, {
									label: "Vessel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
										value: settings.vessel,
										onChange: (e) => updateSettings({ vessel: e.target.value })
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsField, {
									label: "Registry",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
										value: settings.registry,
										onChange: (e) => updateSettings({ registry: e.target.value })
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LcarsButton, {
								tone: settings.soundEnabled ? "orange" : "eggplant",
								shape: "pill",
								tall: "sm",
								onClick: () => {
									const next = !settings.soundEnabled;
									setSoundEnabled(next);
									updateSettings({ soundEnabled: next });
									if (next) play("tap");
								},
								children: ["Sound ", settings.soundEnabled ? "on" : "off"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LcarsButton, {
								tone: settings.voiceEnabled ? "peach" : "eggplant",
								shape: "pill",
								tall: "sm",
								onClick: () => {
									const next = !settings.voiceEnabled;
									setVoiceEnabled(next);
									updateSettings({ voiceEnabled: next });
									play("tap");
								},
								children: ["Computer voice ", settings.voiceEnabled ? "on" : "off"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lcars-label mb-2 text-sm text-lcars-orange",
							children: "Alert status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									tone: "gold",
									shape: "pill",
									tall: "sm",
									active: settings.alert === "normal",
									onClick: () => setAlert("normal"),
									children: "Green"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									tone: "blue",
									shape: "pill",
									tall: "sm",
									active: settings.alert === "blue",
									onClick: () => setAlert("blue"),
									children: "Blue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									tone: "alert",
									shape: "pill",
									tall: "sm",
									active: settings.alert === "red",
									onClick: () => setAlert("red"),
									children: "Red"
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lcars-label mb-2 text-sm text-lcars-orange",
								children: "New log bank"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
									value: name,
									onChange: (e) => setName(e.target.value),
									placeholder: "Science officer's log",
									onKeyDown: (e) => {
										if (e.key === "Enter") addJournal();
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-28 shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
										tone: "orange",
										shape: "pill",
										tall: "sm",
										onClick: addJournal,
										children: "Create"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-1.5",
								children: LCARS_SWATCHES.map((sw) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": sw,
									onClick: () => setColor(sw),
									className: cn("size-7 lcars-pill", SWATCH_BG[sw], color === sw && "ring-2 ring-lcars-canary")
								}, sw))
							})
						] }),
						journals.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lcars-label mb-2 text-sm text-lcars-orange",
							children: "Purge bank"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: journals.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LcarsButton, {
								tone: j.color,
								shape: "pill",
								tall: "sm",
								className: "w-auto px-4",
								onClick: () => {
									deleteJournal(j.id);
									play("error");
								},
								children: ["Delete ", j.name]
							}, j.id))
						})] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-36",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									tone: "blue",
									shape: "pill",
									onClick: onClose,
									children: "Close"
								})
							})
						})
					]
				})]
			})]
		})
	});
}
function AudioPlayer({ entryId, durationMs }) {
	const audioRef = (0, import_react.useRef)(null);
	const urlRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [missing, setMissing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let dead = false;
		setReady(false);
		setMissing(false);
		setPlaying(false);
		setProgress(0);
		loadAudioFn({ data: entryId }).then((row) => {
			if (dead) return;
			if (!row) {
				setMissing(true);
				return;
			}
			if (urlRef.current) URL.revokeObjectURL(urlRef.current);
			const blob = base64ToBlob(row.data, row.mime);
			const url = URL.createObjectURL(blob);
			urlRef.current = url;
			const el = new Audio(url);
			el.addEventListener("timeupdate", () => {
				if (el.duration) setProgress(el.currentTime / el.duration);
			});
			el.addEventListener("ended", () => {
				setPlaying(false);
				setProgress(0);
			});
			audioRef.current = el;
			setReady(true);
		});
		return () => {
			dead = true;
			audioRef.current?.pause();
			audioRef.current = null;
			if (urlRef.current) URL.revokeObjectURL(urlRef.current);
			urlRef.current = null;
		};
	}, [entryId]);
	function toggle() {
		const el = audioRef.current;
		if (!el) return;
		if (playing) {
			el.pause();
			setPlaying(false);
			play("tap");
		} else {
			el.play();
			setPlaying(true);
			play("chirp");
		}
	}
	const secs = Math.round((durationMs || 0) / 1e3);
	const stamp = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
	if (missing) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "lcars-label text-sm text-lcars-lilac",
		children: "Voice channel not on file"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-28 shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
					tone: playing ? "gold" : "blue",
					shape: "pill",
					tall: "sm",
					onClick: toggle,
					disabled: !ready,
					children: playing ? "Pause" : "Play"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative h-3 flex-1 bg-lcars-eggplant",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-lcars-orange transition-[width] duration-150",
					style: { width: `${Math.round(progress * 100)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "lcars-label w-12 text-right text-sm text-lcars-gold tabular-nums",
				children: stamp
			})
		]
	});
}
function useNow() {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	return now;
}
var NAV_TALL = [
	"lg",
	"md",
	"md",
	"sm",
	"lg",
	"md"
];
function Console() {
	const now = useNow();
	const journals = useLogStore((s) => s.journals);
	const entries = useLogStore((s) => s.entries);
	const settings = useLogStore((s) => s.settings);
	const selectedJournalId = useLogStore((s) => s.selectedJournalId);
	const selectedEntryId = useLogStore((s) => s.selectedEntryId);
	const query = useLogStore((s) => s.query);
	const selectJournal = useLogStore((s) => s.selectJournal);
	const selectEntry = useLogStore((s) => s.selectEntry);
	const setQuery = useLogStore((s) => s.setQuery);
	const createEntry = useLogStore((s) => s.createEntry);
	const updateEntry = useLogStore((s) => s.updateEntry);
	const fileEntry = useLogStore((s) => s.fileEntry);
	const deleteEntry = useLogStore((s) => s.deleteEntry);
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const [listOpen, setListOpen] = (0, import_react.useState)(true);
	const journal = journals.find((j) => j.id === selectedJournalId) ?? journals[0];
	const accent = journal?.color ?? "orange";
	const list = (0, import_react.useMemo)(() => visibleEntries(entries, selectedJournalId, query), [
		entries,
		selectedJournalId,
		query
	]);
	const entry = entries.find((e) => e.id === selectedEntryId) ?? null;
	(0, import_react.useEffect)(() => {
		setSoundEnabled(settings.soundEnabled);
		setVoiceEnabled(settings.voiceEnabled);
		patchAlert(settings.alert);
	}, [
		settings.soundEnabled,
		settings.voiceEnabled,
		settings.alert
	]);
	(0, import_react.useEffect)(() => {
		if (list.length === 0) return;
		if (!list.some((e) => e.id === selectedEntryId)) selectEntry(list[0].id);
	}, [
		list,
		selectedEntryId,
		selectEntry
	]);
	function onNav(id) {
		play("tap");
		selectJournal(id);
		setListOpen(true);
	}
	function startVoice() {
		play("chirp");
		setRecording(true);
	}
	function newTextLog() {
		play("open");
		createEntry().then(() => {
			speak("New log.");
			setListOpen(false);
		});
	}
	function saveLog() {
		if (!entry) return;
		fileEntry(entry.id);
		play("confirm");
		speak("Log filed.");
	}
	function toggleSupplemental() {
		if (!entry) return;
		updateEntry(entry.id, { kind: entry.kind === "supplemental" ? "standard" : "supplemental" });
		play("tap");
	}
	async function removeLog() {
		if (!entry) return;
		await deleteEntry(entry.id);
		setConfirmDelete(false);
		play("error");
		speak("Log deleted.");
	}
	const officer = [settings.rank, settings.officerName].filter(Boolean).join(" ") || settings.rank;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col overflow-x-hidden bg-void p-2 sm:p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-stretch gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("hidden h-20 w-[8.75rem] shrink-0 sm:block", SWATCH_BG[accent]) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex min-h-16 min-w-0 flex-1 items-end justify-between px-3 py-2 sm:min-h-20 sm:px-5", "rounded-r-hand", SWATCH_BG[accent]),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 pr-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lcars-label truncate text-2xl leading-none text-void sm:text-4xl md:text-5xl",
								children: journal?.name ?? "Captain's Log"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 truncate font-display text-xs uppercase tracking-wide text-void/75 sm:text-sm",
								children: [
									officer,
									" · ",
									settings.vessel,
									" · ",
									settings.registry
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lcars-label text-xl leading-none text-void tabular-nums sm:text-3xl",
								children: formatStardate(now)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-[0.65rem] uppercase text-void/70 sm:text-xs",
								children: "Stardate"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsBar, {
						tone: "gold",
						className: "hidden w-28 shrink-0 rounded-r-hand sm:flex md:w-32",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-lg tabular-nums",
							children: formatShipTime(now)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden w-8 shrink-0 rounded-r-hand bg-lcars-lilac md:block" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex min-h-0 flex-1 flex-col gap-1 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex shrink-0 flex-col gap-1 sm:w-[8.75rem]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("relative hidden h-12 sm:block", SWATCH_BG[accent]),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-0 bottom-0 h-10 w-10 rounded-tl-pit bg-void" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "flex gap-1 overflow-x-auto lcars-scroll sm:flex-col sm:overflow-visible",
							children: journals.map((j, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
								tone: j.id === selectedJournalId ? "canary" : j.color,
								shape: "block",
								tall: NAV_TALL[i % NAV_TALL.length],
								className: "w-auto min-w-36 shrink-0 sm:w-full sm:min-w-0",
								onClick: () => onNav(j.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex w-full flex-col items-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[0.65rem] opacity-70",
										children: j.code
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: j.name })]
								})
							}, j.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden min-h-8 flex-1 bg-lcars-eggplant sm:block" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden flex-col gap-1 sm:flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									tone: "alert",
									shape: "block",
									tall: "xl",
									onClick: startVoice,
									children: "Record"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									tone: "peach",
									shape: "block",
									onClick: newTextLog,
									children: "New log"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									tone: "blue",
									shape: "block",
									onClick: () => {
										play("open");
										setSettingsOpen(true);
									},
									children: "Config"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-10 items-end justify-end rounded-bl-lcars bg-lcars-gold px-2 py-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "lcars-label text-xs text-void",
										children: journal?.code
									})
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex min-h-0 min-w-0 flex-1 flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden h-12 items-end justify-between px-1 sm:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "lcars-label text-sm text-lcars-blue",
							children: [
								journal?.code,
								" · ",
								list.length,
								" on file"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xs uppercase text-lcars-lilac",
							children: formatEarthDate(now)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 overflow-hidden rounded-tl-pit",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("min-h-0 flex-col sm:w-72 sm:shrink-0 lg:w-[19rem]", listOpen ? "flex w-full sm:w-72" : "hidden sm:flex"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: "Search data banks",
									"aria-label": "Search logs"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "lcars-scroll min-h-0 flex-1 overflow-auto px-2 pb-2",
								children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "px-1 py-6 font-display text-sm uppercase text-lcars-lilac",
									children: "No logs on file. Record to begin."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "flex flex-col gap-1",
									children: list.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											play("tap");
											selectEntry(item.id);
											setListOpen(false);
										},
										className: cn("grid w-full gap-0.5 px-3 py-2.5 text-left", i % 2 === 0 ? "rounded-r-hand" : "rounded-none", item.id === selectedEntryId ? "bg-lcars-orange text-void" : "bg-lcars-eggplant text-lcars-peach"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "lcars-label text-sm tabular-nums",
											children: [
												"SD ",
												item.stardate,
												item.kind === "supplemental" ? " · supp" : ""
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate font-body text-sm",
											children: item.title || item.body.slice(0, 48) || "Untitled draft"
										})]
									}) }, item.id))
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("min-h-0 min-w-0 flex-1 flex-col border-lcars-orange sm:border-l-4", listOpen ? "hidden sm:flex" : "flex"),
							children: entry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editor, {
								stardate: entry.stardate,
								journalName: journal?.name ?? "Log",
								kind: entry.kind,
								title: entry.title,
								body: entry.body,
								status: entry.status,
								hasAudio: entry.hasAudio,
								durationMs: entry.durationMs,
								entryId: entry.id,
								color: accent,
								onTitle: (title) => updateEntry(entry.id, { title }),
								onBody: (body) => updateEntry(entry.id, { body }),
								onSupplemental: toggleSupplemental,
								onSave: saveLog,
								onDelete: () => setConfirmDelete(true),
								onBack: () => setListOpen(true)
							}, entry.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-1 flex-col items-start justify-center gap-4 p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "lcars-label text-3xl text-lcars-peach sm:text-5xl",
										children: "No file selected"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "max-w-md font-body text-base text-lcars-gold text-pretty",
										children: "Open an archived log, dictate a new voice log, or begin a written entry."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex w-full max-w-sm flex-col gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
											tone: "alert",
											shape: "pill",
											tall: "lg",
											onClick: startVoice,
											children: "Begin voice log"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
											tone: "peach",
											shape: "pill",
											onClick: newTextLog,
											children: "Begin written log"
										})]
									})
								]
							})
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-1 hidden items-stretch gap-1 sm:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-[8.75rem] rounded-tr-pit bg-lcars-gold" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 flex-1 bg-lcars-orange" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-24 bg-lcars-peach" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-16 rounded-r-hand bg-lcars-lilac" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 grid grid-cols-3 gap-1 sm:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: "alert",
						shape: "pill",
						onClick: startVoice,
						children: "Record"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: "peach",
						shape: "pill",
						onClick: newTextLog,
						children: "New"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: "blue",
						shape: "pill",
						onClick: () => {
							play("open");
							setSettingsOpen(true);
						},
						children: "Config"
					})
				]
			}),
			recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Recorder, {
				open: recording,
				onClose: () => setRecording(false)
			}) : null,
			settingsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, { onClose: () => setSettingsOpen(false) }) : null,
			confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDelete, {
				onCancel: () => setConfirmDelete(false),
				onConfirm: () => void removeLog()
			}) : null
		]
	});
}
function Editor({ stardate, journalName, kind, title, body, status, hasAudio, durationMs, entryId, color, onTitle, onBody, onSupplemental, onSave, onDelete, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col p-3 sm:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "lcars-label mb-1 text-sm text-lcars-blue sm:hidden",
							onClick: onBack,
							children: "Archive"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "lcars-label text-xl leading-none text-lcars-peach sm:text-3xl text-balance",
							children: [journalName, kind === "supplemental" ? ", supplemental" : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 lcars-label text-base text-lcars-gold tabular-nums",
							children: ["Stardate ", stardate]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("lcars-label shrink-0 px-3 py-1 text-sm text-void", status === "filed" ? "bg-lcars-blue rounded-r-hand" : "bg-lcars-gold rounded-r-hand"),
					children: status === "filed" ? "Filed" : "Draft"
				})]
			}),
			hasAudio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioPlayer, {
					entryId,
					durationMs
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
				value: title,
				onChange: (e) => onTitle(e.target.value),
				placeholder: "Subject",
				"aria-label": "Log title",
				className: "mb-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsTextarea, {
				value: body,
				onChange: (e) => onBody(e.target.value),
				placeholder: "Computer, begin log…",
				"aria-label": "Log body",
				className: "min-h-0 flex-1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: color,
						shape: "hand-right",
						tall: "sm",
						onClick: onSupplemental,
						children: kind === "supplemental" ? "Standard" : "Supplemental"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: "orange",
						shape: "hand-right",
						tall: "sm",
						onClick: onSave,
						children: "File"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: "blue",
						shape: "hand-right",
						tall: "sm",
						onClick: () => {
							play("open");
							speak(body || "This log is empty.");
						},
						children: "Read back"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: "alert",
						shape: "hand-right",
						tall: "sm",
						onClick: onDelete,
						children: "Delete"
					})
				]
			})
		]
	});
}
function ConfirmDelete({ onCancel, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-center justify-center bg-void/80 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm bg-void fade-rise",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsBar, {
					tone: "alert",
					className: "h-12 rounded-r-hand text-xl",
					children: "Confirm purge"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-4 font-body text-lcars-peach text-pretty",
					children: "Remove this log from the data banks? Voice recordings will be purged as well."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2 p-4 pt-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: "gold",
						shape: "pill",
						onClick: onCancel,
						children: "Abort"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
						tone: "alert",
						shape: "pill",
						onClick: onConfirm,
						children: "Delete"
					})]
				})
			]
		})
	});
}
function Home() {
	const { user, isPending } = useCurrentUserState();
	const hydrated = useLogStore((s) => s.hydrated);
	const booted = useLogStore((s) => s.settings.booted);
	const hydrate = useLogStore((s) => s.hydrate);
	const reset = useLogStore((s) => s.reset);
	const userId = user?.id;
	(0, import_react.useEffect)(() => {
		if (!userId) {
			reset();
			return;
		}
		hydrate();
	}, [
		userId,
		hydrate,
		reset
	]);
	if (isPending || user && !hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentifyingScreen, { message: isPending ? "Identifying officer…" : "Accessing data banks…" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: booted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Console, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {}) });
}
//#endregion
export { Home as component };
