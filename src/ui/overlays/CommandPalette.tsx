import * as React from "react";
import type { Landmark, TabId, Track } from "../types";
import { speak } from "../tts";
import { Icon } from "../components/Icon";

type Command =
  | { kind: "nav"; tab: TabId; label: string }
  | { kind: "playPause"; label: string }
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

  type Item =
    | { kind: "pinned"; landmark: Landmark; title: string; subtitle: string }
    | { kind: "track"; title: string; subtitle: string; actionLabel: string }
    | { kind: "action"; cmd: Command; title: string; subtitle?: string };

  const actions = React.useMemo<Item[]>(() => {
    const nav: Item[] = [
      { kind: "action", cmd: { kind: "nav", tab: "home", label: "Go to Home" }, title: "Home" },
      { kind: "action", cmd: { kind: "nav", tab: "search", label: "Go to Search" }, title: "Search" },
      { kind: "action", cmd: { kind: "nav", tab: "library", label: "Go to Library" }, title: "Your Library" },
    ];
    const playback: Item[] = [
      {
        kind: "action",
        cmd: { kind: "playPause", label: props.context.isPlaying ? "Pause" : "Play" },
        title: props.context.isPlaying ? "Pause" : "Play",
        subtitle: "Playback",
      },
    ];
    return [...playback, ...nav];
  }, [props.context.isPlaying]);

  const pinned = React.useMemo<Item[]>(() => {
    return props.landmarks.map((lm) => ({
      kind: "pinned",
      landmark: lm,
      title: lm.label,
      subtitle: lm.type,
    }));
  }, [props.landmarks]);

  const content = React.useMemo<Item[]>(() => {
    const t = props.context.track;
    return [
      {
        kind: "track",
        title: t.title,
        subtitle: t.artist,
        actionLabel: props.context.isPlaying ? "Pause" : "Play",
      },
    ];
  }, [props.context.isPlaying, props.context.track]);

  const results = React.useMemo(() => {
    const q = value.trim();
    if (!q) return { pinned, content, actions };

    const scoreText = (it: Item) => {
      if (it.kind === "pinned") return `${it.title} ${it.subtitle} pinned`;
      if (it.kind === "track") return `${it.title} ${it.subtitle}`;
      return `${it.title} ${it.subtitle ?? ""}`;
    };

    const score = (it: Item) => scoreMatch(q, scoreText(it));
    const filterSort = (arr: Item[]) =>
      arr
        .map((it) => ({ it, s: score(it) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.it);

    return {
      pinned: filterSort(pinned),
      content: filterSort(content),
      actions: filterSort(actions),
    };
  }, [value, pinned, content, actions]);

  React.useEffect(() => {
    if (!props.open) return;
    setValue("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [props.open, props.tts.enabled, props.tts.rate]);

  if (!props.open) return null;

  const run = (cmd: Command) => {
    props.onCommand(cmd);
    props.onClose();
  };

  const runPinned = (lm: Landmark) => run({ kind: "landmark", landmark: lm, label: `Go to ${lm.label}` });

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="searchBarWrap" style={{ flex: 1, marginTop: 0 }}>
            <div className="searchIcon" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
              <Icon name="search" size={18} />
            </div>
            <input
              ref={inputRef}
              className="searchText"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search actions, songs, playlists"
              aria-label="Search actions, songs, playlists"
              onKeyDown={(e) => {
                if (e.key === "Escape") props.onClose();
                if (e.key === "Enter") {
                  const first =
                    results.pinned[0]?.kind === "pinned"
                      ? ({ kind: "landmark", landmark: results.pinned[0].landmark, label: `Go to ${results.pinned[0].title}` } as Command)
                      : results.content[0]?.kind === "track"
                        ? ({ kind: "playPause", label: props.context.isPlaying ? "Pause" : "Play" } as Command)
                        : results.actions[0]?.kind === "action"
                          ? results.actions[0].cmd
                          : null;
                  if (first) run(first);
                }
              }}
              style={{ border: "none", outline: "none", background: "transparent" }}
            />
            <button
              type="button"
              aria-label="Voice input. Tap to speak."
              onClick={() => speak("Listening... (prototype stub)", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
              style={{ border: "none", background: "transparent", color: "black", minHeight: 19, padding: 0 }}
            >
              <Icon name="mic" size={18} />
            </button>
          </div>
          <button type="button" className="textBtn" aria-label="Close" onClick={props.onClose} style={{ minHeight: 44, padding: "0 6px", color: "rgba(255,255,255,0.9)" }}>
            Cancel
          </button>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }} aria-label="Results">
          {results.pinned.length > 0 ? (
            <section aria-label="Pinned">
              <div className="muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.02em" }}>
                Pinned
              </div>
              <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
                {results.pinned.slice(0, 6).map((it) => {
                  if (it.kind !== "pinned") return null;
                  return (
                    <button
                      key={it.landmark.id}
                      type="button"
                      className="row"
                      aria-label={`Pinned: ${it.title}. ${it.subtitle}. Tap to open.`}
                      onClick={() => runPinned(it.landmark)}
                      style={{ textAlign: "left" }}
                    >
                      <div className="thumb" aria-hidden="true" style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 2, top: 2, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>📌</span>
                      </div>
                      <div>
                        <div className="title">{it.title}</div>
                        <div className="subtitle">{it.subtitle}</div>
                      </div>
                      <div aria-hidden="true" style={{ width: 46, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.7)" }}>
                        <Icon name="chevronRight" size={18} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {results.content.length > 0 ? (
            <section aria-label="Suggested">
              <div className="muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.02em" }}>
                Suggested
              </div>
              <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
                {results.content.map((it) => {
                  if (it.kind !== "track") return null;
                  return (
                    <div key={`${it.title}-${it.subtitle}`} className="row" role="group" aria-label={`${it.title} by ${it.subtitle}`}>
                      <div className="thumb" aria-hidden="true" />
                      <div>
                        <div className="title">{it.title}</div>
                        <div className="subtitle">{it.subtitle}</div>
                      </div>
                      <button type="button" className="ghostBtn" aria-label={it.actionLabel} onClick={() => run({ kind: "playPause", label: it.actionLabel })}>
                        <Icon name={props.context.isPlaying ? "pause" : "play"} size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {results.actions.length > 0 ? (
            <section aria-label="Actions">
              <div className="muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.02em" }}>
                Actions
              </div>
              <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
                {results.actions.map((it) => {
                  if (it.kind !== "action") return null;
                  return (
                    <button
                      key={it.cmd.label}
                      type="button"
                      className="row"
                      aria-label={it.cmd.label}
                      onClick={() => run(it.cmd)}
                      style={{ textAlign: "left" }}
                    >
                      <div className="thumb" aria-hidden="true" />
                      <div>
                        <div className="title">{it.title}</div>
                        {it.subtitle ? <div className="subtitle">{it.subtitle}</div> : null}
                      </div>
                      <div aria-hidden="true" style={{ width: 46, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.7)" }}>
                        <Icon name="chevronRight" size={18} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

