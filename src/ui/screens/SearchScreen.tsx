import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import type { ContextTarget, Landmark } from "../types";
import { isContextPinned } from "../pinnedUtils";
import { Icon } from "../components/Icon";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import { LongPressable } from "../components/LongPressable";
import type { Track } from "../types";

const browseTiles = [
  { id: "music", label: "Music", color: "#E9147B" },
  { id: "podcasts", label: "Podcasts", color: "#0A7C6D" },
  { id: "audiobooks", label: "Audiobooks", color: "#2D46B9" },
  { id: "live", label: "Live Events", color: "#7C2AE8" },
] as const;

const videoRails = ["Throwback Thursday", "just hits", "All out 2000s"] as const;
const episodeRails = ["New releases", "For you", "Trending"] as const;

const topSongs: Track[] = [
  { id: "s1", title: "Song title one", artist: "Artist A", durationSec: 210 },
  { id: "s2", title: "Song title two", artist: "Artist B", durationSec: 198 },
  { id: "s3", title: "Song title three", artist: "Artist C", durationSec: 225 },
];

export function SearchScreen(props: { onCommandPalette: () => void; onOpenContext: (target: ContextTarget) => void; onPlayTrack: (t: Track) => void }) {
  const [query, setQuery] = React.useState("");

  return (
    <>
      <div className="headerPlain">
        <HeaderBar
          title="Search"
          left={{ kind: "avatar", label: "Profile" }}
          rightIcons={[{ icon: "camera", label: "Camera", onPress: () => {} }]}
          onCommandPalette={props.onCommandPalette}
        />
        <div className="searchBarWrap searchBarWrapSpotify" style={{ marginTop: 10 }}>
          <div className="searchIcon" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
            <Icon name="search" size={18} />
          </div>
          <input
            className="searchText"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            aria-label="Search"
            style={{ border: "none", outline: "none", background: "transparent" }}
          />
        </div>
      </div>
      <div className="screenInner">
        <section aria-label="Start browsing">
          <div className="sectionHeader" style={{ marginTop: 0 }}>
            Start browsing
          </div>
          <div className="browseGrid" style={{ marginTop: 12 }}>
            {browseTiles.map((tile) => (
              <LongPressable
                key={tile.id}
                className="browseTile"
                style={{ background: tile.color }}
                ariaLabel={`${tile.label}. Long-press for options.`}
                onLongPress={() =>
                  props.onOpenContext({
                    landmark: {
                      id: `lm-browse-${tile.id}`,
                      label: tile.label,
                      type: "playlist",
                      payload: { kind: "stub", ref: `browse-${tile.id}` },
                    },
                    artistName: "Spotify",
                  })
                }
              >
                <span>{tile.label}</span>
                <div className="browseTileArt" aria-hidden="true" />
              </LongPressable>
            ))}
          </div>
        </section>

        <section aria-label="Songs you may know">
          <div className="sectionHeader">Songs</div>
          <div style={{ display: "grid", gap: 2, marginTop: 12 }}>
            {topSongs.map((t) => {
              const ctx: ContextTarget = {
                landmark: {
                  id: `lm-search-${t.id}`,
                  label: t.title,
                  type: "album",
                  payload: { kind: "stub", ref: t.id },
                },
                queueTrack: t,
                artistName: t.artist,
              };
              return (
                <ListRow
                  key={t.id}
                  title={t.title}
                  subtitle={t.artist}
                  ariaLabel={trackAriaLabel(t)}
                  pinnedShortcut={isContextPinned(ctx, props.landmarks)}
                  onPress={() => props.onPlayTrack(t)}
                  onLongPress={() => props.onOpenContext(ctx)}
                />
              );
            })}
          </div>
        </section>

        <section aria-label="Explore music videos">
          <div className="sectionHeader">Explore music videos</div>
          <div className="rail" style={{ marginTop: 12 }}>
            {videoRails.map((t) => (
              <LongPressable
                key={t}
                style={{ minWidth: 132 }}
                ariaLabel={`${t}. Long-press for options.`}
                onLongPress={() =>
                  props.onOpenContext({
                    landmark: {
                      id: `lm-search-video-${t.replace(/\s+/g, "-").toLowerCase()}`,
                      label: t,
                      type: "playlist",
                      payload: { kind: "stub", ref: `video-${t}` },
                    },
                  })
                }
              >
                <div className="railCard" aria-hidden="true" />
                <div className="railLabel">{t}</div>
              </LongPressable>
            ))}
          </div>
        </section>

        <section aria-label="Explore episodes for you">
          <div className="sectionHeader">Explore episodes for you</div>
          <div className="rail" style={{ marginTop: 12 }}>
            {episodeRails.map((t) => (
              <LongPressable
                key={t}
                style={{ minWidth: 132 }}
                ariaLabel={`${t}. Long-press for options.`}
                onLongPress={() =>
                  props.onOpenContext({
                    landmark: {
                      id: `lm-search-ep-${t.replace(/\s+/g, "-").toLowerCase()}`,
                      label: t,
                      type: "podcast",
                      payload: { kind: "stub", ref: `ep-${t}` },
                    },
                  })
                }
              >
                <div className="railCard" aria-hidden="true" />
                <div className="railLabel">{t}</div>
              </LongPressable>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
