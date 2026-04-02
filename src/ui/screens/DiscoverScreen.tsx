import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import type { Track } from "../types";
import { Icon } from "../components/Icon";

type Tile = { id: string; title: string; subtitle?: string };

const recentlyPlayedTiles: Tile[] = [
  { id: "rp1", title: "Liked Songs", subtitle: "Playlist" },
  { id: "rp2", title: "Chill Vibes", subtitle: "Playlist" },
  { id: "rp3", title: "Dua Lipa", subtitle: "Artist" },
  { id: "rp4", title: "Workout Mix", subtitle: "Playlist" },
  { id: "rp5", title: "Jazz Classics", subtitle: "Playlist" },
  { id: "rp6", title: "Discover Weekly", subtitle: "Playlist" },
];

const madeForYou: Tile[] = [
  { id: "mf1", title: "Discover Weekly", subtitle: "Playlist" },
  { id: "mf2", title: "Release Radar", subtitle: "Playlist" },
  { id: "mf3", title: "Daily Mix 1", subtitle: "Playlist" },
  { id: "mf4", title: "Daily Mix 2", subtitle: "Playlist" },
];

const homeList: Track[] = [
  { id: "h1", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", durationSec: 225 },
  { id: "h2", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", durationSec: 324 },
  { id: "h3", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", durationSec: 200 },
];

export function DiscoverScreen(props: { onCommandPalette: () => void }) {
  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <>
      <div className="headerGradient">
        <HeaderBar
          title={greeting}
          left={{ kind: "avatar", label: "Profile" }}
          onCommandPalette={props.onCommandPalette}
        />
      </div>
      <div className="screenInner">
        <section aria-label="Recently played">
          <div className="sectionHeader">Recently played</div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {recentlyPlayedTiles.slice(0, 6).map((t) => (
              <button
                key={t.id}
                type="button"
                className="spotifyRow"
                role="button"
                aria-label={`${t.title}. ${t.subtitle ?? ""}.`}
                onClick={() => {}}
              >
                <div className="thumb" aria-hidden="true" />
                <div>
                  <div className="rowPrimary">{t.title}</div>
                  {t.subtitle ? <div className="rowSecondary">{t.subtitle}</div> : <div className="rowSecondary" />}
                </div>
                <div aria-hidden="true" style={{ width: 48 }} />
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Made for you">
          <div className="sectionHeader" style={{ marginTop: 0 }}>Made for you</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, marginTop: 12 }}>
            {madeForYou.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-label={`${t.title}. ${t.subtitle ?? ""}.`}
                onClick={() => {}}
                style={{
                  minWidth: 132,
                  textAlign: "left",
                  padding: 0,
                  color: "white",
                }}
              >
                <div aria-hidden="true" style={{ width: 132, height: 132, borderRadius: 6, background: "#262626" }} />
                <div style={{ fontWeight: 800, fontSize: 14, marginTop: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                {t.subtitle ? <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{t.subtitle}</div> : null}
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Home list">
          <div className="sectionHeader" style={{ marginTop: 0 }}>Recommended</div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {homeList.map((t) => (
              <ListRow
                key={t.id}
                title={t.title}
                subtitle={`${t.artist} · ${t.album ?? ""}`}
                ariaLabel={trackAriaLabel(t)}
                onPress={() => {}}
                onPlayPress={() => {}}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

