import * as React from "react";
import type { ContextTarget, Landmark, TabId, Track } from "../types";
import { speak } from "../tts";
import { Icon } from "../components/Icon";
import { useLongPress } from "../useLongPress";
import type { PaletteSearchHit } from "../paletteSearch";
import { filterPaletteSearch } from "../paletteSearch";

export type Command =
  | { kind: "nav"; tab: TabId; label: string }
  | { kind: "playPause"; label: string }
  | { kind: "skip"; label: string }
  | { kind: "addToQueue"; label: string }
  | { kind: "like"; label: string }
  | { kind: "landmark"; landmark: Landmark; label: string }
  | { kind: "playPaletteResult"; hit: PaletteSearchHit }
  | { kind: "playLikedSongs" }
  | { kind: "resumeLast" }
  | { kind: "goToArtist" };

function PinnedPaletteRow(props: {
  lm: Landmark;
  flash: boolean;
  onActivate: () => void;
  onLongPress: () => void;
}) {
  const lp = useLongPress(props.onLongPress);
  return (
    <button
      type="button"
      className={`spotifyRow${props.flash ? " paletteRowFlash" : ""}`}
      role="button"
      aria-label={`${props.lm.label}, pinned`}
      onClick={(e) => {
        if (lp.consumeLongPressClick()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        props.onActivate();
      }}
      onTouchStart={lp.onTouchStart}
      onTouchMove={lp.onTouchMove}
      onTouchEnd={lp.onTouchEnd}
      onTouchCancel={lp.onTouchCancel}
      onMouseDown={lp.onMouseDown}
      onMouseMove={lp.onMouseMove}
      onMouseUp={lp.onMouseUp}
      onMouseLeave={lp.onMouseLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        props.onLongPress();
      }}
    >
      <div className="thumb" aria-hidden="true">
        <Icon name="pin" size={16} />
      </div>
      <div>
        <div className="rowPrimary">{props.lm.label}</div>
        <div className="rowSecondary">{props.lm.type}</div>
      </div>
      <button
        type="button"
        className="moreBtn"
        aria-label={`More options for ${props.lm.label}`}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          props.onLongPress();
        }}
      >
        <Icon name="overflow" size={20} />
      </button>
    </button>
  );
}

function SearchHitRow(props: {
  hit: PaletteSearchHit;
  onPlay: () => void;
  onLongPress: () => void;
}) {
  const lp = useLongPress(props.onLongPress);
  return (
    <button
      type="button"
      className="spotifyRow"
      role="button"
      aria-label={`${props.hit.title}. ${props.hit.subtitle}. Tap to play. Long-press to pin.`}
      onClick={(e) => {
        if (lp.consumeLongPressClick()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        props.onPlay();
      }}
      onTouchStart={lp.onTouchStart}
      onTouchMove={lp.onTouchMove}
      onTouchEnd={lp.onTouchEnd}
      onTouchCancel={lp.onTouchCancel}
      onMouseDown={lp.onMouseDown}
      onMouseMove={lp.onMouseMove}
      onMouseUp={lp.onMouseUp}
      onMouseLeave={lp.onMouseLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        props.onLongPress();
      }}
    >
      <div className="thumb" aria-hidden="true" style={{ background: "#1e3264" }} />
      <div>
        <div className="rowPrimary">{props.hit.title}</div>
        <div className="rowSecondary">{props.hit.subtitle}</div>
      </div>
      <button
        type="button"
        className="moreBtn"
        aria-label={`More options for ${props.hit.title}`}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          props.onLongPress();
        }}
      >
        <Icon name="overflow" size={20} />
      </button>
    </button>
  );
}

export function CommandPalette(props: {
  open: boolean;
  onClose: () => void;
  onCommand: (cmd: Command) => void;
  context: { tab: TabId; track: Track; isPlaying: boolean; trackLiked: boolean };
  landmarks: Landmark[];
  recentActions: string[];
  onPinnedLongPress: (lm: Landmark) => void;
  onOpenContext: (target: ContextTarget) => void;
  onExecutePinned: (lm: Landmark) => void;
  pinnedFlashId: string | null;
  tts: { enabled: boolean; rate: number };
}) {
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const [listening, setListening] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  /** Resets whenever the sheet opens so user testers always see the intro (not persisted). */
  const [hintDismissedThisOpen, setHintDismissedThisOpen] = React.useState(false);
  const sheetRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!props.open) return;
    setListening(false);
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

  const onVoiceTap = () => {
    if (showFirstHint) dismissHint();
    setListening(true);
    speak("Listening…", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
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
            <div className="paletteFirstHintText">Try saying: play your liked songs</div>
            <div className="paletteFirstHintActions">
              <button type="button" className="paletteHintChip" onClick={() => setSearchQuery("jazz")}>
                Try typing: jazz
              </button>
              <button type="button" className="paletteHintChip paletteHintChipMuted" onClick={dismissHint}>
                Got it
              </button>
            </div>
          </div>
        ) : null}

        <label className="paletteSearchLabel" htmlFor="palette-search">
          Find music &amp; actions
        </label>
        <input
          ref={searchRef}
          id="palette-search"
          type="search"
          className="paletteSearchInput"
          placeholder="Play liked songs or type jazz…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (showFirstHint && e.target.value.length > 0) dismissHint();
          }}
          aria-label="Search in command palette"
          autoComplete="off"
        />

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

        <section aria-label="Quick actions for current context" style={{ marginTop: 16 }}>
          <div className="sectionHeader" style={{ marginTop: 0 }}>
            Quick actions
          </div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {props.context.isPlaying ? (
              <>
                <button
                  type="button"
                  className="spotifyRow"
                  role="button"
                  aria-label={likeLabel}
                  onClick={() => run({ kind: "like", label: likeLabel })}
                >
                  <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                    <Icon name="heart" size={18} />
                  </div>
                  <div>
                    <div className="rowPrimary">{likeLabel}</div>
                    <div className="rowSecondary">{props.context.track.title}</div>
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
                    <div className="rowSecondary">{props.context.track.title}</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
                <button type="button" className="spotifyRow" role="button" aria-label="Go to artist" onClick={() => run({ kind: "goToArtist" })}>
                  <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                    <Icon name="search" size={18} />
                  </div>
                  <div>
                    <div className="rowPrimary">Go to artist</div>
                    <div className="rowSecondary">{props.context.track.artist}</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
              </>
            ) : (
              <>
                <button type="button" className="spotifyRow" role="button" aria-label="Play liked songs" onClick={() => run({ kind: "playLikedSongs" })}>
                  <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                    <Icon name="heart" size={18} />
                  </div>
                  <div>
                    <div className="rowPrimary">Play liked songs</div>
                    <div className="rowSecondary">Your library</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
                <button type="button" className="spotifyRow" role="button" aria-label="Resume last track" onClick={() => run({ kind: "resumeLast" })}>
                  <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                    <Icon name="play" size={18} />
                  </div>
                  <div>
                    <div className="rowPrimary">Resume last track</div>
                    <div className="rowSecondary">{props.context.track.title}</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
              </>
            )}
          </div>
        </section>

        <button
          type="button"
          className="voicePrimary"
          style={{ marginTop: 14 }}
          aria-label="Voice input, tap to speak a command"
          onClick={onVoiceTap}
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
      </div>
    </div>
  );
}
