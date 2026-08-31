type SoundName =
  | "tap"
  | "chirp"
  | "open"
  | "confirm"
  | "error"
  | "recordOn"
  | "recordOff"
  | "success"
  | "boot";

let ctx: AudioContext | null = null;
let muted = false;
let voiceMuted = false;
let bootPlayed = false;

export function setSoundEnabled(on: boolean) {
  muted = !on;
}

export function setVoiceEnabled(on: boolean) {
  voiceMuted = !on;
  if (voiceMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function unlockAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") await ctx.resume();
}

function envGain(node: AudioNode, start: number, peak: number, dur: number, attack = 0.008) {
  if (!ctx) return;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  node.connect(g);
  g.connect(ctx.destination);
  return g;
}

function tone(
  freq: number,
  dur: number,
  when = 0,
  type: OscillatorType = "sine",
  peak = 0.07,
  slide?: number,
) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
  envGain(osc, t, peak, dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function playPatch(name: SoundName) {
  if (!ctx) return;
  switch (name) {
    case "tap":
      tone(1680, 0.045, 0, "sine", 0.05);
      break;
    case "chirp":
      tone(1400, 0.07, 0, "sine", 0.06, 2200);
      tone(2200, 0.05, 0.05, "sine", 0.04);
      break;
    case "open":
      tone(880, 0.09, 0, "triangle", 0.05);
      tone(1320, 0.1, 0.07, "sine", 0.05);
      break;
    case "confirm":
      tone(980, 0.08, 0, "sine", 0.05);
      tone(1470, 0.1, 0.08, "sine", 0.055);
      break;
    case "error":
      tone(240, 0.18, 0, "square", 0.04);
      tone(180, 0.22, 0.12, "square", 0.035);
      break;
    case "recordOn":
      tone(660, 0.1, 0, "sine", 0.06, 990);
      tone(1320, 0.12, 0.1, "sine", 0.05);
      break;
    case "recordOff":
      tone(1320, 0.1, 0, "sine", 0.05, 660);
      tone(440, 0.14, 0.1, "triangle", 0.04);
      break;
    case "success":
      tone(784, 0.09, 0, "sine", 0.05);
      tone(1046, 0.1, 0.08, "sine", 0.05);
      tone(1318, 0.14, 0.16, "sine", 0.055);
      break;
    case "boot":
      if (bootPlayed) {
        tone(880, 0.08, 0, "sine", 0.04);
        return;
      }
      bootPlayed = true;
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, i * 0.11, "sine", 0.045));
      tone(1568, 0.22, 0.48, "sine", 0.04);
      break;
  }
}

export function play(name: SoundName) {
  if (muted || typeof window === "undefined") return;
  void unlockAudio().then(() => playPatch(name));
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const prefer = [
    /google uk english female/i,
    /samantha/i,
    /karen/i,
    /moira/i,
    /zira/i,
    /female/i,
  ];
  for (const re of prefer) {
    const v = voices.find((voice) => re.test(voice.name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

export function speak(text: string) {
  if (voiceMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92;
  u.pitch = 0.88;
  u.volume = 0.85;
  const voice = pickVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export function hushVoice() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function pickRecorderMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}
