import * as React from "react";
import { AxisEntryCard } from "../components/AxisEntryCard";
import type { ContextTarget, Landmark, Track } from "../types";
import { Icon } from "../components/Icon";
import { LongPressable } from "../components/LongPressable";
import { useLongPress } from "../useLongPress";
import { axisLocalPng, axisTileFallback, homeLocalPng } from "../axisMedia";
import { ResilientImg } from "../components/ResilientImg";
import { useAxisSearchSpeech } from "../useAxisSearchSpeech";

const chips = ["All", "Music", "Podcasts", "Audiobooks"] as const;

/** Fictional labels only — thumbnails from `public/home/tile-NN.png` or picsum fallback. */
const homeDummyTiles = [
  { id: "dummy-1", title: "Lumen mix radio", thumbFile: "tile-01", fallbackSeed: "homeDummyTile01" },
  { id: "dummy-2", title: "Velocity repeat", thumbFile: "tile-02", fallbackSeed: "homeDummyTile02" },
  { id: "dummy-3", title: "Harbor slow focus", thumbFile: "tile-03", fallbackSeed: "homeDummyTile03" },
  { id: "dummy-4", title: "Northstar dance mix", thumbFile: "tile-04", fallbackSeed: "homeDummyTile04" },
  { id: "dummy-5", title: "Quartz indie hour", thumbFile: "tile-05", fallbackSeed: "homeDummyTile05" },
  { id: "dummy-6", title: "Canvas live session", thumbFile: "tile-06", fallbackSeed: "homeDummyTile06" },
  { id: "dummy-7", title: "Aurora commute", thumbFile: "tile-07", fallbackSeed: "homeDummyTile07" },
  { id: "dummy-8", title: "Driftwork study", thumbFile: "tile-08", fallbackSeed: "homeDummyTile08" },
] as const;

const axisMainTabs = ["Songs", "Artists", "Albums", "Playlists"] as const;

function DiscoverTopChrome<T extends string>(props: {
  tabs: readonly T[];
  activeTab: T;
  onTab: (t: T) => void;
  tablistLabel: string;
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  onOpenProfile: () => void;
  startListening: () => void;
  speechListening: boolean;
  speechSupported: boolean;
  searchInputId: string;
  profileNotifyDot?: boolean;
  /** When set with `showCommandPaletteTrigger`, restores header mic behavior (command palette), separate from search voice-to-text. */
  onCommandPalette?: () => void;
  showCommandPaletteTrigger?: boolean;
}) {
  return (
    <div className="headerPlain axisHomeSimpleTop">
      <div className="axisHomeTopBar">
        <button type="button" className="axisHomeProfileBtn" onClick={props.onOpenProfile} aria-label="Open profile">
          <span className="axisHomeProfileBtnInner">
            <ResilientImg
              primarySrc={axisLocalPng("avatar-profile")}
              fallbackSrc={axisTileFallback("axisProfileAvatar", 128)}
              alt=""
              className="axisHomeProfilePhoto"
            />
            {props.profileNotifyDot ? <span className="homeProfileNotifyDot" aria-hidden="true" /> : null}
          </span>
        </button>
        <div className="axisHomeMainTabs" role="tablist" aria-label={props.tablistLabel}>
          {props.tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={props.activeTab === t}
              className={`axisHomeMainTab${props.activeTab === t ? " active" : ""}`}
              onClick={() => props.onTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {props.showCommandPaletteTrigger && props.onCommandPalette ? (
          <button
            type="button"
            className="iconBtn axisHomeHeaderCommandBtn"
            aria-label="Open command palette"
            onClick={props.onCommandPalette}
            data-command-palette-trigger="true"
          >
            <Icon name="mic" size={22} />
          </button>
        ) : null}
      </div>

      <div className="axisHomeSearchShell">
        <span className="axisHomeSearchIcon" aria-hidden="true">
          <Icon name="search" size={20} />
        </span>
        <input
          id={props.searchInputId}
          type="search"
          className="axisHomeSearchInput"
          placeholder="Search songs, artists, album"
          value={props.searchQuery}
          onChange={(e) => props.onSearchQueryChange(e.target.value)}
          aria-label="Search songs, artists, albums"
          autoComplete="off"
        />
        <button
          type="button"
          className="axisHomeSearchMic"
          onClick={props.startListening}
          disabled={!props.speechSupported}
          aria-label={props.speechListening ? "Listening…" : "Voice to text"}
        >
          <Icon name="mic" size={22} />
        </button>
      </div>
      <div className="srLive" aria-live="polite" aria-atomic="true">
        {props.speechListening ? "Listening" : ""}
      </div>
    </div>
  );
}

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
  const [searchQuery, setSearchQuery] = React.useState("");

  const appendVoiceText = React.useCallback((text: string) => {
    setSearchQuery((prev) => (prev ? `${prev.trimEnd()} ${text}` : text));
  }, []);

  const { startListening, listening: speechListening, supported: speechSupported } = useAxisSearchSpeech(appendVoiceText);

  if (props.axisEnabled) {
    return (
      <>
        <DiscoverTopChrome
          tabs={axisMainTabs}
          activeTab={axisMainTab}
          onTab={setAxisMainTab}
          tablistLabel="Browse"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onOpenProfile={props.onOpenProfile}
          startListening={startListening}
          speechListening={speechListening}
          speechSupported={speechSupported}
          searchInputId="axis-home-search"
          onCommandPalette={props.onCommandPalette}
          showCommandPaletteTrigger
        />

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
              {searchQuery
                ? `Showing ${axisMainTab.toLowerCase()} for “${searchQuery}”.`
                : `Pick a tab and search, or use the mic to dictate into the search field.`}
            </p>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <DiscoverTopChrome
        tabs={chips}
        activeTab={chip}
        onTab={setChip}
        tablistLabel="Home categories"
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onOpenProfile={props.onOpenProfile}
        startListening={startListening}
        speechListening={speechListening}
        speechSupported={speechSupported}
        searchInputId="discover-home-search"
        profileNotifyDot
      />

      <div className="screenInner">
        <section aria-label="Your shortcuts">
          <div className="homeTileGrid" style={{ marginTop: 0 }}>
            {homeDummyTiles.map((tile) => {
              const openCtx = () =>
                props.onOpenContext({
                  landmark: {
                    id: `lm-home-${tile.id}`,
                    label: tile.title,
                    type: "playlist",
                    payload: { kind: "stub", ref: tile.id },
                  },
                  artistName: "Spotify",
                });
              return (
                <LongPressable
                  key={tile.id}
                  role="button"
                  className="homeShortcutRow"
                  ariaLabel={`${tile.title}. Tap for options.`}
                  onLongPress={openCtx}
                >
                  <div className="homeShortcutArt homeShortcutArtImage" aria-hidden="true">
                    <ResilientImg
                      primarySrc={homeLocalPng(tile.thumbFile)}
                      fallbackSrc={axisTileFallback(tile.fallbackSeed, 112)}
                      alt=""
                      className="homeTileThumbImg"
                    />
                  </div>
                  <div className="homeShortcutTitle">{tile.title}</div>
                  <button
                    type="button"
                    className="homeShortcutOverflow"
                    aria-label={`More options for ${tile.title}`}
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

        <AxisEntryCard onStartTutorial={props.onStartAxisTutorial} />
      </div>
    </>
  );
}
