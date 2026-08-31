import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, _ as Navigate, b as require_jsx_runtime, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-DamUFChS.mjs";
import { a as LcarsField, i as LcarsButton, m as play, n as IdentifyingScreen, o as LcarsInput, x as useCurrentUserState } from "./use-current-user-D6rNJ3L1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-C2XKv8-w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const navigate = useNavigate();
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [showSocial, setShowSocial] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setShowSocial(/grok\.(me|com)|grok-sandbox/.test(window.location.hostname));
	}, []);
	async function submit(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		play("tap");
		try {
			if (mode === "up") {
				const { error: err } = await authClient.signUp.email({
					email: email.trim(),
					password,
					name: name.trim() || email.trim(),
					callbackURL: "/"
				});
				if (err) throw new Error(err.message || "Clearance denied.");
			} else {
				const { error: err } = await authClient.signIn.email({
					email: email.trim(),
					password,
					callbackURL: "/"
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
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentifyingScreen, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
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
						className: "mt-2 font-display text-base uppercase text-lcars-gold",
						children: "Identify to open personal data banks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-8 w-full max-w-md space-y-4",
						onSubmit: (e) => void submit(e),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									type: "button",
									tone: mode === "in" ? "orange" : "eggplant",
									shape: "pill",
									tall: "sm",
									className: "w-auto px-5",
									onClick: () => setMode("in"),
									children: "Sign in"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
									type: "button",
									tone: mode === "up" ? "peach" : "eggplant",
									shape: "pill",
									tall: "sm",
									className: "w-auto px-5",
									onClick: () => setMode("up"),
									children: "Request clearance"
								})]
							}),
							mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsField, {
								label: "Officer name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
									value: name,
									onChange: (e) => setName(e.target.value),
									autoComplete: "name",
									placeholder: "A. Solari"
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsField, {
								label: "Officer ID (email)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
									type: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									autoComplete: "email",
									required: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsField, {
								label: "Access code",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsInput, {
									type: "password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									autoComplete: mode === "up" ? "new-password" : "current-password",
									minLength: 8,
									required: true
								})
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm uppercase text-lcars-alert",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcarsButton, {
								type: "submit",
								tone: "orange",
								shape: "pill",
								tall: "lg",
								disabled: busy,
								children: busy ? "Working…" : mode === "up" ? "Create clearance" : "Authorize"
							}),
							showSocial ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "lcars-label text-sm text-lcars-lilac",
									children: "Or continue via"
								}), GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LcarsButton, {
									type: "button",
									tone: p.idp === "google" ? "blue" : "gold",
									shape: "pill",
									onClick: () => {
										play("open");
										signIn(p.providerId, { callbackURL: "/" });
									},
									children: ["Continue with ", p.label]
								}, p.providerId))]
							}) : null
						]
					})
				]
			})]
		})]
	});
}
//#endregion
export { Login as component };
