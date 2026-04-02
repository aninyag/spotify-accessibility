import * as React from "react";
import type { Landmark, TabId, Track } from "../types";
import { speak } from "../tts";

type Command =
  | { kind: "nav"; tab: TabId; label: string }
  | { kind: "playPause"; label: string }
  | { kind: "whereAmI"; label: string }
  | { kind: "landmark"; landmark: Landmark; label: string };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function scoreMatch(input: string, target: string): number {
  // Tiny fuzzy matcher: rewards prefix/substring; tolerates small typos by character overlap.
  const i = normalize(input);
  const t = normalize(target);
  if (!i) return 0;
  if (t === i) return 100;
  if (t.startsWith(i)) return 80;
  if (t.includes(i)) return 60;
  let overlap = 0;
  const set = new Set(t);
  for (const ch of i) if (set.has(ch)) overlap++;
  return Math.min(50, overlap * 6);
}

export function CommandPalette(props: {
  open: boolean;
  onClose: () => void;
  onCommand: (cmd: Command) => void;
  context: { tab: TabId; track: Track; isPlaying: boolean };
  landmarks: Landmark[];
  tts: { enabled: boolean; rate: number };
}) {
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const allCommands = React.useMemo<Command[]>(() => {
    const nav: Command[] = [
      { kind: "nav", tab: "now", label: "Go to Now" },
      { kind: "nav", tab: "search", label: "Go to Search" },
      { kind: "nav", tab: "library", label: "Go to Library" },
      { kind: "nav", tab: "discover", label: "Go to Discover" },
      { kind: "nav", tab: "support", label: "Go to Support" },
    ];

    const playback: Command[] = [{ kind: "playPause", label: props.context.isPlaying ? "Pause" : "Play" }];
    const utility: Command[] = [{ kind: "whereAmI", label: "Where am I" }];
    const lms: Command[] = props.landmarks.map((lm) => ({ kind: "landmark", landmark: lm, label: `Go to ${lm.label}` }));
    return [...playback, ...nav, ...utility, ...lms];
  }, [props.context.isPlaying, props.landmarks]);

  const suggestions = React.useMemo(() => {
    const q = value.trim();
    if (!q) return allCommands.slice(0, 7);
    const scored = allCommands
      .map((c) => ({ c, s: scoreMatch(q, c.label) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8);
    return scored.map((x) => x.c);
  }, [value, allCommands]);

  React.useEffect(() => {
    if (!props.open) return;
    setValue("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    speak("Command palette. Type a command.", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
    return () => window.clearTimeout(id);
  }, [props.open, props.tts.enabled, props.tts.rate]);

  if (!props.open) return null;

  const run = (cmd: Command) => {
    props.onCommand(cmd);
    props.onClose();
    speak(cmd.label, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "queue" });
  };

  return (
    <div
      className="overlayBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div className="overlay">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <h2 className="overlayTitle">Command Palette</h2>
          <button type="button" aria-label="Close command palette" onClick={props.onClose} className="iconBtn">
            ×
          </button>
        </div>

        <input
          ref={inputRef}
          className="field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a command… (e.g., Play, Go to Search)"
          aria-label="Type a command"
          onKeyDown={(e) => {
            if (e.key === "Escape") props.onClose();
            if (e.key === "Enter") {
              const first = suggestions[0];
              if (first) run(first);
            }
          }}
        />

        <div style={{ display: "grid", gap: 10, marginTop: 12 }} aria-label="Suggestions">
          {suggestions.map((s) => (
            <button key={s.label} type="button" onClick={() => run(s)} aria-label={s.label} style={{ textAlign: "left" }}>
              {s.label}
            </button>
          ))}
        </div>

        <p className="hint">
          Shortcuts: <strong>Ctrl/⌘+K</strong> open · <strong>Esc</strong> close · <strong>Enter</strong> run top suggestion
        </p>
      </div>
    </div>
  );
}

