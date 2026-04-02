import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { AxisEntryCard } from "../components/AxisEntryCard";
import type { ContextTarget, Landmark, Track } from "../types";
import { Icon } from "../components/Icon";
import { LongPressable } from "../components/LongPressable";
import { speak } from "../tts";
import { useLongPress } from "../useLongPress";
import { mockNowPlaying } from "../mockData";
import { axisImg } from "../axisMedia";

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

/** Browse grid: maps to `browse-*` stubs and optional artwork in /public/axis/. */
const axisBrowseTiles = [
  { id: "songs", label: "Your Top Songs", image: axisImg.topSongs, ref: "songs" as const },
  { id: "artists", label: "Your Artists", image: axisImg.wrappedArtists, ref: "artists" as const },
  { id: "albums", label: "Fresh picks", image: axisImg.tileMix, ref: "albums" as const },
  { id: "indie", label: "Indie Pop", image: axisImg.indiePop, ref: "indie-pop" as const },
] as const;

function AxisSafeImg(props: { src: string; alt: string; className?: string; fallbackClassName?: string }) {
  const [broken, setBroken] = React.useState(false);
  if (broken) {
    return (
      <div
        className={`${props.className ?? ""} ${props.fallbackClassName ?? "axisSafeImgFallback"}`.trim()}
        aria-hidden={props.alt === ""}
      />
    );
  }
  return (
    <img
      src={props.src}
      alt={props.alt}
      className={props.className}
      onError={() => setBroken(true)}
    />
  );
}

const topTabs = ["All", "Pop", "HipHop"] as const;

const levitatingRow = {
  id: "lev-1",
  title: "Levitating",
  subtitle: "Dua Lipa · Pop",
  track: mockNowPlaying,
};

const humbleRow = {
  id: "hh-1",
  title: "HUMBLE.",
  subtitle: "Kendrick Lamar · Hip-hop",
  track: {
    id: "hh-demo",
    title: "HUMBLE.",
    artist: "Kendrick Lamar",
    album: "DAMN.",
    durationSec: 177,
  } satisfies Track,
};

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
  const [topTab, setTopTab] = React.useState<(typeof topTabs)[number]>("All");
  const [listening, setListening] = React.useState(false);

  const onVoiceBarClick = () => {
    setListening(true);
    speak("Listening…", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
    props.onCommandPalette();
  };

  const topSongRows = React.useMemo(() => {
    if (topTab === "HipHop") return [humbleRow];
    return [levitatingRow, { ...levitatingRow, id: "lev-2" }, { ...levitatingRow, id: "lev-3" }];
  }, [topTab]);

  if (props.axisEnabled) {
    return (
      <div className="axisHomeRoot">
        <section className="axisHomeHero" aria-label="Axis spotlight">
          <AxisSafeImg
            src={axisImg.hero}
            alt=""
            className="axisHomeHeroPhoto"
            fallbackClassName="axisHomeHeroPhoto axisHomeHeroPhotoFallback"
          />
          <div className="axisHomeHeroScrim" aria-hidden />
          <div className="axisHomeHeroTop">
            <span className="axisHomeSpotifyBadge" aria-hidden="true" />
          </div>
          <p className="axisHomeHeroOutline" aria-hidden>
            Axis
          </p>
        </section>

        <div className="headerPlain axisHomeAxisHeader">
          <HeaderBar
            title="Axis"
            left={{
              kind: "avatar",
              label: "Open profile",
              onPress: props.onOpenProfile,
              imageSrc: axisImg.avatarProfile,
            }}
            onCommandPalette={props.onCommandPalette}
            showAxisMic={false}
          />
          <button
            type="button"
            className="axisHomeVoiceBar"
            onClick={onVoiceBarClick}
            aria-label="Say a voice command. Opens Axis controls."
          >
            <span className="axisHomeVoiceHint">Say something…</span>
            <Icon name="mic" size={22} aria-hidden="true" />
          </button>
          <div className="srLive" aria-live="polite" aria-atomic="true">
            {listening ? "Listening" : ""}
          </div>
        </div>

        <div className="screenInner">
          <section aria-label="Pinned shortcuts">
            <div className="sectionHeader axisHomeSectionLight" style={{ marginTop: 0 }}>
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

          <section aria-label="Your year in music">
            <button
              type="button"
              className="axisHomeFeaturedCard"
              onClick={() =>
                props.onOpenContext({
                  landmark: {
                    id: "lm-axis-wrapped-feature",
                    label: "Your Artists Revealed",
                    type: "playlist",
                    payload: { kind: "stub", ref: "wrapped-feature" },
                  },
                  artistName: "Spotify",
                })
              }
            >
              <AxisSafeImg
                src={axisImg.banner}
                alt=""
                className="axisHomeFeaturedImg"
                fallbackClassName="axisHomeFeaturedImg axisHomeFeaturedImgFallback"
              />
              <div className="axisHomeFeaturedOverlay">
                <span className="axisHomeFeaturedKicker">Wrapped</span>
                <span className="axisHomeFeaturedTitle">Your Artists Revealed</span>
              </div>
            </button>
          </section>

          <section aria-label="Browse categories">
            <div className="sectionHeader axisHomeSectionLight">Jump back in</div>
            <div className="axisHomeBrowseGrid">
              {axisBrowseTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  className="axisHomeBrowseTile axisHomeBrowseTileArt"
                  aria-label={tile.label}
                  onClick={() =>
                    props.onOpenContext({
                      landmark: {
                        id: `lm-axis-browse-${tile.id}`,
                        label: tile.label,
                        type: "playlist",
                        payload: { kind: "stub", ref: `browse-${tile.ref}` },
                      },
                      artistName: "Spotify",
                    })
                  }
                >
                  <AxisSafeImg src={tile.image} alt="" className="axisHomeBrowseImg" />
                  <span className="axisHomeBrowseLabel">{tile.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-label="Top songs">
            <div className="axisHomeTopSongsHeader axisHomeSectionLight">Top Songs</div>
            <div className="axisHomeTopTabs" role="tablist" aria-label="Genre">
              {topTabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={topTab === t}
                  className={`axisHomeTopTab${topTab === t ? " active" : ""}`}
                  onClick={() => setTopTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="axisHomeTopList">
              {topSongRows.map((row) => (
                <div key={row.id} className="axisHomeTopRow">
                  <div className="axisHomeTopThumbWrap" aria-hidden="true">
                    <AxisSafeImg
                      src={topTab === "HipHop" ? axisImg.tileMix : axisImg.beatles}
                      alt=""
                      className="axisHomeTopThumb"
                    />
                  </div>
                  <div className="axisHomeTopText">
                    <div className="rowPrimary axisHomeTopTitle">{row.title}</div>
                    <div className="rowSecondary axisHomeTopMeta">
                      {row.subtitle}
                      <span className="axisHomeDownloaded" aria-label="Downloaded" title="Downloaded">
                        ↓
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="axisHomeTopPlay"
                    aria-label={`Play ${row.title}`}
                    onClick={() => props.onPlayTrack(row.track)}
                  >
                    <Icon name="play" size={22} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="axisHomeAlbumFeature" aria-label="Featured album">
            <AxisSafeImg src={axisImg.artistFeature} alt="" className="axisHomeAlbumFeatureImg" />
            <div className="axisHomeAlbumFeatureCaption">
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: "28px" }}>Albums featuring songs you like</div>
              <div className="muted" style={{ marginTop: 6, fontSize: 13, fontWeight: 400 }}>
                Editorial picks · updated weekly
              </div>
            </div>
          </section>
        </div>
      </div>
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
