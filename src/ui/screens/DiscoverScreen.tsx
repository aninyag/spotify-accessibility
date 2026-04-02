import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { AxisEntryCard } from "../components/AxisEntryCard";
import type { ContextTarget, Landmark, Track } from "../types";
import { Icon } from "../components/Icon";
import { LongPressable } from "../components/LongPressable";
import { useLongPress } from "../useLongPress";
import { axisLocalPng, axisTileFallback } from "../axisMedia";
import { ResilientImg } from "../components/ResilientImg";
import { useAxisSearchSpeech } from "../useAxisSearchSpeech";

type Shortcut = { id: string; title: string; artKind: "cover" | "gradient" };

const chips = ["All", "Music", "Podcasts", "Audiobooks"] as const;

const shortcuts: Shortcut[] = [
  { id: "sc1", title: "Daily Mix", artKind: "cover" },
  { id: "sc2", title: "On Repeat", artKind: "gradient" },
  { id: "sc3", title: "Chill Hits", artKind: "cover" },
  { id: "sc4", title: "Top Songs", artKind: "cover" },
  { id: "sc5", title: "Radio", artKind: "cover" },
  { id: "sc6", title: "Recently Played", artKind: "cover" },
  { id: "sc7", title: "Focus", artKind: "cover" },
  { id: "sc8", title: "Workout", artKind: "cover" },
];

const recentPlayed = [
  { id: "rp1", title: "Midnight pulse", subtitle: "Playlist · 2 hr ago" },
  { id: "rp2", title: "Neon dreams", subtitle: "Album · Yesterday" },
  { id: "rp3", title: "Lo-fi study", subtitle: "Radio · 3 days ago" },
];

const axisMainTabs = ["Songs", "Artists", "Albums", "Playlists"] as const;

function PinnedHomeRow(props: {
  lm: Landmark;
  flash: boolean;
  onActivate: () => void;
  onLongPress: () => void;
}) {
  const lp = useLongPress(props.onLongPress);
  return (
    <button
      type="button"
      className={`axisHomePinnedRow${props.flash ? " axisHomePinnedRowFlash" : ""}`}
      aria-label={props.lm.label}
      onClick={(e) => {
        const consumed = lp.consumeLongPressClick();
        if (consumed) {
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
      <div className="axisHomePinnedThumb" aria-hidden="true">
        <Icon name="pin" size={16} />
      </div>
      <span className="axisHomePinnedLabel">{props.lm.label}</span>
      <Icon name="chevronRight" size={18} className="axisHomePinnedChevron" aria-hidden="true" />
    </button>
  );
}

export function DiscoverScreen(props: {
  onCommandPalette: () => void;
  onOpenContext: (target: ContextTarget) => void;
  onOpenProfile: () => void;
  axisEnabled: boolean;
  onStartAxisTutorial: () => void;
  landmarks: Landmark[];
  onExecutePinned: (lm: Landmark) => void;
  onPinnedLongPress: (lm: Landmark) => void;
  pinnedFlashId: string | null;
  onPlayTrack: (t: Track) => void;
  tts: { enabled: boolean; rate: number };
}) {
  const [chip, setChip] = React.useState<(typeof chips)[number]>("All");
  const [axisMainTab, setAxisMainTab] = React.useState<(typeof axisMainTabs)[number]>("Songs");
  const [axisSearchQuery, setAxisSearchQuery] = React.useState("");

  const appendVoiceText = React.useCallback((text: string) => {
    setAxisSearchQuery((prev) => (prev ? `${prev.trimEnd()} ${text}` : text));
  }, []);

  const { startListening, listening: speechListening, supported: speechSupported } = useAxisSearchSpeech(appendVoiceText);

  if (props.axisEnabled) {
    return (
      <>
        <div className="headerPlain axisHomeSimpleTop">
          <div className="axisHomeTopBar">
            <button type="button" className="axisHomeProfileBtn" onClick={props.onOpenProfile} aria-label="Open profile">
              <ResilientImg
                primarySrc={axisLocalPng("avatar-profile")}
                fallbackSrc={axisTileFallback("axisProfileAvatar", 128)}
                alt=""
                className="axisHomeProfilePhoto"
              />
            </button>
            <div className="axisHomeMainTabs" role="tablist" aria-label="Browse">
              {axisMainTabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={axisMainTab === t}
                  className={`axisHomeMainTab${axisMainTab === t ? " active" : ""}`}
                  onClick={() => setAxisMainTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="axisHomeSearchShell">
            <span className="axisHomeSearchIcon" aria-hidden="true">
              <Icon name="search" size={20} />
            </span>
            <input
              id="axis-home-search"
              type="search"
              className="axisHomeSearchInput"
              placeholder="Search songs, artists, album"
              value={axisSearchQuery}
              onChange={(e) => setAxisSearchQuery(e.target.value)}
              aria-label="Search songs, artists, albums"
              autoComplete="off"
            />
            <button
              type="button"
              className="axisHomeSearchMic"
              onClick={startListening}
              disabled={!speechSupported}
              aria-label={speechListening ? "Listening…" : "Voice to text"}
            >
              <Icon name="mic" size={22} />
            </button>
          </div>
          <div className="srLive" aria-live="polite" aria-atomic="true">
            {speechListening ? "Listening" : ""}
          </div>
        </div>

        <div className="screenInner">
          <section aria-label="Pinned shortcuts">
            <div className="sectionHeader" style={{ marginTop: 0 }}>
              Pinned
            </div>
            <div className="axisHomePinnedList">
              {props.landmarks.slice(0, 2).map((lm) => (
                <PinnedHomeRow
                  key={lm.id}
                  lm={lm}
                  flash={props.pinnedFlashId === lm.id}
                  onActivate={() => props.onExecutePinned(lm)}
                  onLongPress={() => props.onPinnedLongPress(lm)}
                />
              ))}
            </div>
          </section>

          <section className="axisHomeTabPanel" aria-labelledby={`axis-tab-${axisMainTab}`}>
            <h2 id={`axis-tab-${axisMainTab}`} className="sectionHeader">
              {axisMainTab}
            </h2>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.45 }}>
              {axisSearchQuery
                ? `Showing ${axisMainTab.toLowerCase()} for “${axisSearchQuery}”.`
                : `Pick a tab and search, or use the mic to dictate into the search field.`}
            </p>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="headerPlain">
        <HeaderBar
          title=""
          left={{ kind: "avatar", label: "Open profile", onPress: props.onOpenProfile }}
          onCommandPalette={props.onCommandPalette}
          showAxisMic={props.axisEnabled}
        />
        <div className="pillRow" role="tablist" aria-label="Home chips" style={{ marginTop: 10, gap: 10 }}>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              className="pill"
              role="tab"
              aria-selected={chip === c}
              aria-label={`${c}. Tab.`}
              onClick={() => setChip(c)}
              style={{
                height: 32,
                padding: "0 16px",
                borderRadius: 999,
                background: chip === c ? "#1DB954" : "#2A2A2A",
                color: chip === c ? "black" : "white",
                fontWeight: 700,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="screenInner">
        <section aria-label="Recently played">
          <div className="sectionHeader" style={{ marginTop: 0 }}>
            Recently played
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {recentPlayed.map((r) => (
              <button
                key={r.id}
                type="button"
                className="homeRecentRow"
                aria-label={`${r.title}. ${r.subtitle}`}
              >
                <div className="homeRecentArt" aria-hidden="true" />
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div className="rowPrimary">{r.title}</div>
                  <div className="rowSecondary">{r.subtitle}</div>
                </div>
                <div className="homeRecentChevron" aria-hidden="true">
                  <Icon name="chevronRight" size={18} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <AxisEntryCard onStartTutorial={props.onStartAxisTutorial} />

        <section aria-label="Shortcuts">
          <div className="sectionHeader">Made for you</div>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {shortcuts.map((s) => {
              const openCtx = () =>
                props.onOpenContext({
                  landmark: {
                    id: `lm-home-${s.id}`,
                    label: s.title,
                    type: "playlist",
                    payload: { kind: "stub", ref: s.id },
                  },
                  artistName: "Spotify",
                });
              return (
                <LongPressable
                  key={s.id}
                  role="button"
                  className="homeShortcutRow"
                  ariaLabel={`${s.title}. Tap for options.`}
                  onLongPress={openCtx}
                >
                  <div
                    className="homeShortcutArt"
                    aria-hidden="true"
                    style={{
                      background: s.artKind === "gradient" ? "linear-gradient(135deg, #6B2AE8, #111)" : "#262626",
                    }}
                  />
                  <div className="homeShortcutTitle">{s.title}</div>
                  <button
                    type="button"
                    className="homeShortcutOverflow"
                    aria-label={`More options for ${s.title}`}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      openCtx();
                    }}
                    style={{ border: "none", background: "transparent", padding: 0 }}
                  >
                    <Icon name="overflow" size={18} />
                  </button>
                </LongPressable>
              );
            })}
          </div>
        </section>

        <section aria-label="Albums featuring songs you like">
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: "32px", marginTop: 10 }}>Albums featuring songs you like</div>
          <div className="muted" style={{ marginTop: 6, fontSize: 13, fontWeight: 400 }}>
            Various artists · 5 days ago · 2 min
          </div>
        </section>
      </div>
    </>
  );
}
