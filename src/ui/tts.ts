export type TtsPriority = "interrupt" | "queue" | "skipIfBusy";

type SpeakOpts = {
  enabled: boolean;
  rate: number; // 0.5..2 (browser-dependent)
  priority: TtsPriority;
};

let currentUtterance: SpeechSynthesisUtterance | null = null;
const queue: SpeechSynthesisUtterance[] = [];

function canUseTts() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, opts: SpeakOpts) {
  if (!opts.enabled) return;
  if (!canUseTts()) return;
  const safeToSpeak = /listening|didn'?t catch|try again|voice input/i.test(text);
  if (!safeToSpeak) return;

  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = opts.rate;

  const isSpeaking = synth.speaking || synth.pending;

  if (opts.priority === "interrupt") {
    try {
      synth.cancel();
    } catch {
      // ignore
    }
    queue.length = 0;
    currentUtterance = u;
    synth.speak(u);
    return;
  }

  if (opts.priority === "skipIfBusy" && isSpeaking) return;

  queue.push(u);
  if (!isSpeaking) {
    const next = queue.shift();
    if (!next) return;
    currentUtterance = next;
    synth.speak(next);
  }
}

export function flushTtsQueue() {
  if (!canUseTts()) return;
  queue.length = 0;
  currentUtterance = null;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

