import * as React from "react";
import type { Landmark, TabId, Track } from "../types";
import { speak } from "../tts";
import { Icon } from "../components/Icon";

type Command =
  | { kind: "nav"; tab: TabId; label: string }
  | { kind: "playPause"; label: string }
  | { kind: "skip"; label: string }
  | { kind: "addToQueue"; label: string }
  | { kind: "landmark"; landmark: Landmark; label: string };

export function CommandPalette(props: {
  open: boolean;
  onClose: () => void;
  onCommand: (cmd: Command) => void;
  context: { tab: TabId; track: Track; isPlaying: boolean };
  landmarks: Landmark[];
  recentActions: string[];
  tts: { enabled: boolean; rate: number };
}) {
  const voiceBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const [listening, setListening] = React.useState(false);
  const lastActiveRef = React.useRef<HTMLElement | null>(null);
  const sheetRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!props.open) return;
    lastActiveRef.current = (document.activeElement as HTMLElement) ?? null;
    setListening(false);
    const id = window.setTimeout(() => voiceBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [props.open]);

  React.useEffect(() => {
    if (props.open) return;
    // Return focus to the header pill that opened it (stable focus target).
    const pill = document.querySelector<HTMLElement>('[data-command-palette-pill="true"]');
    pill?.focus?.();
  }, [props.open]);

  React.useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        props.onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const root = sheetRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  const run = (cmd: Command) => {
    props.onCommand(cmd);
    props.onClose();
  };

  const runPinned = (lm: Landmark) => run({ kind: "landmark", landmark: lm, label: `Go to ${lm.label}` });

  return (
    <div
      className="bottomSheetBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div ref={sheetRef} className="bottomSheet" role="document">
        <div className="bottomSheetHandle" aria-hidden="true" />

        <button
          ref={voiceBtnRef}
          type="button"
          className="voicePrimary"
          aria-label="Voice input, tap to speak a command"
          onClick={() => {
            setListening(true);
            speak("Listening…", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
          }}
        >
          <Icon name="mic" size={20} /> <span className="voicePlaceholder">Say something…</span>
        </button>
        <div className="srLive" aria-live="polite" aria-atomic="true">
          {listening ? "Listening" : ""}
        </div>

        <section aria-label="Pinned">
          <div className="sectionHeader">Pinned</div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {props.landmarks.slice(0, 6).map((lm) => (
              <button
                key={lm.id}
                type="button"
                className="spotifyRow"
                role="button"
                aria-label={`${lm.label}, pinned`}
                onClick={() => runPinned(lm)}
              >
                <div className="thumb" aria-hidden="true" />
                <div>
                  <div className="rowPrimary">{lm.label}</div>
                  <div className="rowSecondary">{lm.type}</div>
                </div>
                <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                  <Icon name="pin" size={18} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Recent actions">
          <div className="sectionHeader">Recent actions</div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {props.recentActions.slice(0, 3).map((a, idx) => (
              <div key={`${a}-${idx}`} className="spotifyRow" role="group" aria-label={a}>
                <div className="thumb" aria-hidden="true" />
                <div>
                  <div className="rowPrimary">{a}</div>
                  <div className="rowSecondary">Recent</div>
                </div>
                <div aria-hidden="true" style={{ width: 48 }} />
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Quick actions">
          <div className="sectionHeader">Quick actions</div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            <button type="button" className="spotifyRow" role="button" aria-label={props.context.isPlaying ? "Pause" : "Play"} onClick={() => run({ kind: "playPause", label: props.context.isPlaying ? "Pause" : "Play" })}>
              <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                <Icon name={props.context.isPlaying ? "pause" : "play"} size={18} />
              </div>
              <div>
                <div className="rowPrimary">{props.context.isPlaying ? "Pause" : "Play"}</div>
                <div className="rowSecondary">Playback</div>
              </div>
              <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                <Icon name="chevronRight" size={18} />
              </div>
            </button>

            <button type="button" className="spotifyRow" role="button" aria-label="Skip" onClick={() => run({ kind: "skip", label: "Skip" })}>
              <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                <Icon name="next" size={18} />
              </div>
              <div>
                <div className="rowPrimary">Skip</div>
                <div className="rowSecondary">Playback</div>
              </div>
              <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                <Icon name="chevronRight" size={18} />
              </div>
            </button>

            <button type="button" className="spotifyRow" role="button" aria-label="Add to queue" onClick={() => run({ kind: "addToQueue", label: "Add to queue" })}>
              <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                <Icon name="plus" size={18} />
              </div>
              <div>
                <div className="rowPrimary">Add to queue</div>
                <div className="rowSecondary">Playback</div>
              </div>
              <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                <Icon name="chevronRight" size={18} />
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

