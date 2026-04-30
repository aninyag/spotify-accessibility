import * as React from "react";
import type { ContextTarget, Landmark, TabId, Track } from "../types";
import { speak } from "../tts";
import { Icon } from "../components/Icon";
import type { PaletteSearchHit } from "../paletteSearch";
import { filterPaletteSearch } from "../paletteSearch";
import { useAxisSearchSpeech } from "../useAxisSearchSpeech";

export type Command =
  | { kind: "nav"; tab: TabId; label: string }
  | { kind: "playPause"; label: string }
  | { kind: "skip"; label: string }
  | { kind: "addToQueue"; label: string }
  | { kind: "like"; label: string }
  | { kind: "landmark"; landmark: Landmark; label: string }
  | { kind: "playPaletteResult"; hit: PaletteSearchHit }
  | { kind: "playLikedSongs" }
  | { kind: "openNowPlaying" };

function PinnedPaletteRow(props: {
  lm: Landmark;
  flash: boolean;
  onActivate: () => void;
  onLongPress: () => void;
}) {
  return (
    <button
      type="button"
      className={`spotifyRow${props.flash ? " paletteRowFlash" : ""}`}
      aria-label={`${props.lm.label}, pinned. Tap to open. Long-press for options.`}
      onClick={props.onActivate}
      onContextMenu={(e) => {
        e.preventDefault();
        props.onLongPress();
      }}
    >
      <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
        <Icon name="pin" size={16} />
      </div>
      <div>
        <div className="rowPrimary">{props.lm.label}</div>
      </div>
      <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
        <Icon name="chevronRight" size={18} />
      </div>
    </button>
  );
}

function SearchHitRow(props: {
  hit: PaletteSearchHit;
  onPlay: () => void;
  onLongPress: () => void;
}) {
  return (
    <button
      type="button"
      className="spotifyRow"
      aria-label={`${props.hit.title}. Tap to play. Long-press for options.`}
      onClick={props.onPlay}
      onContextMenu={(e) => {
        e.preventDefault();
        props.onLongPress();
      }}
    >
      <div className="thumb" aria-hidden="true" style={{ background: "#1e3264" }} />
      <div>
        <div className="rowPrimary">{props.hit.title}</div>
      </div>
      <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
        <Icon name="chevronRight" size={18} />
      </div>
    </button>
  );
}

export function CommandPalette(props: {
  open: boolean;
  onClose: () => void;
  onCommand: (cmd: Command) => void;
  context: { tab: TabId; track: Track; isPlaying: boolean; trackLiked: boolean };
  landmarks: Landmark[];
  onPinnedLongPress: (lm: Landmark) => void;
  onOpenContext: (target: ContextTarget) => void;
  onExecutePinned: (lm: Landmark) => void;
  pinnedFlashId: string | null;
  tts: { enabled: boolean; rate: number };
}) {
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  /** Resets whenever the sheet opens so user testers always see the intro (not persisted). */
  const [hintDismissedThisOpen, setHintDismissedThisOpen] = React.useState(false);
  const sheetRef = React.useRef<HTMLDivElement | null>(null);

  const applyVoiceTranscript = React.useCallback((text: string) => setSearchQuery(text), []);

  const {
    startListening,
    listening: speechListening,
    supported: speechSupported,
  } = useAxisSearchSpeech(applyVoiceTranscript);

  React.useEffect(() => {
    if (!props.open) return;
    setSearchQuery("");
    setHintDismissedThisOpen(false);
    const id = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [props.open]);

  React.useEffect(() => {
    if (props.open) return;
    const trigger = document.querySelector<HTMLElement>('[data-command-palette-trigger="true"]');
    trigger?.focus?.();
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

  const runPinned = (lm: Landmark) => {
    props.onExecutePinned(lm);
    props.onClose();
  };

  const likeLabel = props.context.trackLiked ? "Remove like" : "Like this song";
  const searchHits = filterPaletteSearch(searchQuery);
  const showFirstHint = !hintDismissedThisOpen;

  const dismissHint = () => setHintDismissedThisOpen(true);

  const onMic = () => {
    if (showFirstHint) dismissHint();
    if (!speechSupported) {
      speak("Voice is not supported in this browser.", {
        enabled: props.tts.enabled,
        rate: props.tts.rate,
        priority: "interrupt",
      });
      return;
    }
    startListening();
  };

  return (
    <div
      className="bottomSheetBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div
        ref={sheetRef}
        className="bottomSheet"
        role="document"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="paletteTopBar">
          <div className="bottomSheetHandle" aria-hidden="true" />
          <button type="button" className="paletteDoneBtn" onClick={() => props.onClose()} aria-label="Close command palette">
            Done
          </button>
        </div>

        {showFirstHint ? (
          <div className="paletteFirstHint" role="region" aria-label="Getting started">
            <div className="paletteFirstHintText">Type to search, or tap the mic and say: jazz, chill, or play my liked songs</div>
            <div className="paletteFirstHintActions">
              <button type="button" className="paletteHintChip paletteHintChipMuted" onClick={dismissHint}>
                Got it
              </button>
            </div>
          </div>
        ) : null}

        <div className="paletteSearchLabel">Search</div>
        <div className="paletteSearchBar">
          <span className="paletteSearchBarIcon" aria-hidden="true">
            <Icon name="search" size={18} />
          </span>
          <input
            ref={searchRef}
            type="search"
            className="paletteSearchBarInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search music & actions"
            aria-label="Search music and actions"
            autoComplete="off"
          />
          <button
            type="button"
            className="paletteSearchBarMic"
            onClick={onMic}
            disabled={!speechSupported}
            aria-label={speechListening ? "Listening…" : "Voice to text"}
            title={!speechSupported ? "Voice input is not available in this browser" : undefined}
          >
            <Icon name="mic" size={18} />
          </button>
        </div>
        <div className="srLive" aria-live="polite" aria-atomic="true">
          {speechListening ? "Listening" : ""}
        </div>

        {searchHits.length > 0 ? (
          <section aria-label="Results" style={{ marginTop: 12 }}>
            <div className="sectionHeader" style={{ marginTop: 0 }}>
              Results
            </div>
            <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
              {searchHits.map((hit) => (
                <SearchHitRow
                  key={hit.id}
                  hit={hit}
                  onPlay={() => run({ kind: "playPaletteResult", hit })}
                  onLongPress={() =>
                    props.onOpenContext({
                      landmark: hit.landmark,
                      queueTrack: hit.playTrack,
                      artistName: hit.playTrack.artist,
                    })
                  }
                />
              ))}
            </div>
          </section>
        ) : null}

        <section aria-label="Pinned" style={{ marginTop: 16 }}>
          <div className="sectionHeader" style={{ marginTop: 0 }}>
            Pinned
          </div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {props.landmarks.slice(0, 2).map((lm) => (
              <PinnedPaletteRow
                key={lm.id}
                lm={lm}
                flash={props.pinnedFlashId === lm.id}
                onActivate={() => runPinned(lm)}
                onLongPress={() => props.onPinnedLongPress(lm)}
              />
            ))}
          </div>
        </section>

        <section aria-label="Quick actions for current context">
          <div className="sectionHeader">Quick actions</div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {props.context.isPlaying ? (
              <>
                <button
                  type="button"
                  className="spotifyRow"
                  aria-label={likeLabel}
                  onClick={() => run({ kind: "like", label: likeLabel })}
                >
                  <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                    <Icon name="heart" size={18} />
                  </div>
                  <div>
                    <div className="rowPrimary">{likeLabel}</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
                <button type="button" className="spotifyRow" aria-label="Add to queue" onClick={() => run({ kind: "addToQueue", label: "Add to queue" })}>
                  <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                    <Icon name="plus" size={18} />
                  </div>
                  <div>
                    <div className="rowPrimary">Add to queue</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
              </>
            ) : (
              <>
                <button type="button" className="spotifyRow" aria-label="Play liked songs" onClick={() => run({ kind: "playLikedSongs" })}>
                  <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                    <Icon name="heart" size={18} />
                  </div>
                  <div>
                    <div className="rowPrimary">Play liked songs</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
                <button type="button" className="spotifyRow" aria-label="Open Now playing" onClick={() => run({ kind: "openNowPlaying" })}>
                  <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                    <Icon name="play" size={18} />
                  </div>
                  <div>
                    <div className="rowPrimary">Open Now playing</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
