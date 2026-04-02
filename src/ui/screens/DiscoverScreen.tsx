import * as React from "react";
import { AxisEntryCard } from "../components/AxisEntryCard";
import type { ContextTarget, Landmark, Track } from "../types";
import { Icon } from "../components/Icon";
import { LongPressable } from "../components/LongPressable";
import { useLongPress } from "../useLongPress";
import { axisLocalPng, axisTileFallback, AXIS_PROFILE_PHOTO_URL, homeLocalPng, ON_REPEAT_COVER_URL } from "../axisMedia";
import { axisHomeTopSongRows } from "../mockData";
import { ResilientImg } from "../components/ResilientImg";
import { useAxisSearchSpeech } from "../useAxisSearchSpeech";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import { isContextPinned } from "../pinnedUtils";

const chips = ["All", "Music", "Podcasts", "Audiobooks"] as const;

/** Spotify-style home shortcuts (demo) — thumbnails from `public/home/tile-NN.png` or picsum fallback. */
const homeDummyTiles = [
  { id: "dummy-1", title: "Daily Mix 1", thumbFile: "tile-01", fallbackSeed: "homeMixDaily1" },
  { id: "dummy-2", title: "On Repeat", thumbFile: "tile-02", fallbackSeed: "homeOnRepeat" },
  { id: "dummy-3", title: "Discover Weekly", thumbFile: "tile-03", fallbackSeed: "homeDiscoverWeekly" },
  { id: "dummy-4", title: "Release Radar", thumbFile: "tile-04", fallbackSeed: "homeReleaseRadar" },
  { id: "dummy-5", title: "Liked Songs", thumbFile: "tile-05", fallbackSeed: "homeLikedSongs" },
  { id: "dummy-6", title: "Chill Hits", thumbFile: "tile-06", fallbackSeed: "homeChillHits" },
  { id: "dummy-7", title: "Deep Focus", thumbFile: "tile-07", fallbackSeed: "homeDeepFocus" },
  { id: "dummy-8", title: "Party Starters", thumbFile: "tile-08", fallbackSeed: "homePartyStarters" },
] as const;

const axisMainTabs = ["Songs", "Artists", "Albums", "Playlists"] as const;

const axisTopSongChips = ["All", "Pop", "Hip-hop"] as const;

const axisCategoryTiles: {
  tab: (typeof axisMainTabs)[number];
  label: string;
  color: string;
  art: string;
  seed: string;
}[] = [
  { tab: "Songs", label: "Songs", color: "#E85D32", art: "axis-recent-songs", seed: "axisRecentSongs" },
  { tab: "Artists", label: "Artists", color: "#C23B3B", art: "axis-recent-artists", seed: "axisRecentArtists" },
  { tab: "Albums", label: "Albums", color: "#A8D5BA", art: "axis-recent-albums", seed: "axisRecentAlbums" },
  { tab: "Playlists", label: "Playlist", color: "#C9A227", art: "axis-recent-playlist", seed: "axisRecentPlaylist" },
];

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
  const [axisTopSongChip, setAxisTopSongChip] = React.useState<(typeof axisTopSongChips)[number]>("All");
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
        />

        <div className="screenInner">
          <section aria-label="Recently played categories">
            <div className="sectionHeader" style={{ marginTop: 0 }}>
              Recently played
            </div>
            <div className="browseGrid" style={{ marginTop: 12 }}>
              {axisCategoryTiles.map((c) => (
                <LongPressable
                  key={c.tab}
                  role="button"
                  className="browseTile"
                  style={{ background: c.color }}
                  ariaLabel={`${c.label}. Sets ${c.tab} browse.`}
                  onClick={() => setAxisMainTab(c.tab)}
                  onLongPress={() =>
                    props.onOpenContext({
                      landmark: {
                        id: `lm-axis-cat-${c.tab}`,
                        label: c.label,
                        type: "playlist",
                        payload: { kind: "stub", ref: `axis-cat-${c.tab}` },
                      },
                      artistName: "Spotify",
                    })
                  }
                >
                  <span>{c.label}</span>
                  <div className="browseTileArt axisBrowseTileArt" aria-hidden="true">
                    <ResilientImg
                      primarySrc={axisLocalPng(c.art)}
                      fallbackSrc={axisTileFallback(c.seed, 96)}
                      alt=""
                      className="axisBrowseTileArtImg"
                    />
                  </div>
                </LongPressable>
              ))}
            </div>
          </section>

          <section aria-label="Axis controls">
            <div className="sectionHeader">Axis controls</div>
            <button
              type="button"
              className="axisHomeControlsCard"
              onClick={() => props.onCommandPalette()}
              data-command-palette-trigger="true"
            >
              <div className="axisHomeControlsGlyph" aria-hidden="true">
                <Icon name="command" size={24} />
              </div>
              <div className="axisHomeControlsText">
                <div className="axisHomeControlsTitle">Commands &amp; voice</div>
                <div className="axisHomeControlsSub">Open the command palette</div>
              </div>
              <Icon name="chevronRight" size={22} className="axisHomeControlsChevron" aria-hidden="true" />
            </button>
          </section>

          <section aria-label="Pinned shortcuts">
            <div className="sectionHeader">Pinned</div>
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

          <section aria-labelledby="axis-top-songs-heading">
            <h2 id="axis-top-songs-heading" className="sectionHeader">
              Top Songs
            </h2>
            <div className="axisHomeSubTabsRow" role="tablist" aria-label="Filter by genre">
              {axisTopSongChips.map((g) => (
                <button
                  key={g}
                  type="button"
                  role="tab"
                  className={`axisHomeSubTab${axisTopSongChip === g ? " active" : ""}`}
                  aria-selected={axisTopSongChip === g}
                  onClick={() => setAxisTopSongChip(g)}
                >
                  {g}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 2, marginTop: 12 }}>
              {axisHomeTopSongRows
                .filter((row) => axisTopSongChip === "All" || row.genre === axisTopSongChip)
                .map((row) => {
                  const ctx: ContextTarget = {
                    landmark: {
                      id: `lm-axis-top-${row.track.id}`,
                      label: row.track.title,
                      type: "album",
                      payload: { kind: "stub", ref: row.track.id },
                    },
                    queueTrack: row.track,
                    artistName: row.track.artist,
                  };
                  return (
                    <ListRow
                      key={row.track.id}
                      title={row.track.title}
                      subtitle={`${row.track.artist} · ${row.genre}`}
                      thumbSrc={axisTileFallback(`axisThumb-${row.track.id}`, 96)}
                      ariaLabel={trackAriaLabel(row.track)}
                      pinnedShortcut={isContextPinned(ctx, props.landmarks)}
                      onPress={() => props.onPlayTrack(row.track)}
                      onPlayPress={() => props.onPlayTrack(row.track)}
                    />
                  );
                })}
            </div>
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
                      primarySrc={tile.title === "On Repeat" ? ON_REPEAT_COVER_URL : homeLocalPng(tile.thumbFile)}
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
