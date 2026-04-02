import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import type { Track } from "../types";
import { speak } from "../tts";
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

export function DiscoverScreen(props: { onCommandPalette: () => void; onSettings: () => void; tts: { enabled: boolean; rate: number } }) {
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
          right={{ label: "Settings", onPress: props.onSettings }}
        />
      </div>
      <div className="screenInner">
        <section aria-label="Recently played">
          <div className="sectionTitle" style={{ margin: 0, fontSize: 19 }}>
            Recently played
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
              marginTop: 12,
            }}
          >
            {recentlyPlayedTiles.slice(0, 6).map((t) => (
              <button
                key={t.id}
                type="button"
                aria-label={`${t.title}. ${t.subtitle ?? ""}.`}
                onClick={() => speak(`Opening ${t.title}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
                style={{
                  minHeight: 56,
                  display: "grid",
                  gridTemplateColumns: "56px 1fr",
                  gap: 10,
                  alignItems: "center",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: 6,
                  textAlign: "left",
                }}
              >
                <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 4, background: "#262626" }} />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  {t.subtitle ? <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{t.subtitle}</div> : null}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Made for you">
          <div className="sectionTitle" style={{ margin: 0, fontSize: 19 }}>
            Made for you
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, marginTop: 12 }}>
            {madeForYou.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-label={`${t.title}. ${t.subtitle ?? ""}.`}
                onClick={() => speak(`Opening ${t.title}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
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
          <div className="sectionTitle" style={{ margin: 0, fontSize: 19 }}>
            Recommended
          </div>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {homeList.map((t) => (
              <ListRow
                key={t.id}
                title={t.title}
                subtitle={`${t.artist} · ${t.album ?? ""}`}
                ariaLabel={trackAriaLabel(t)}
                onPress={() => speak(`Opening ${t.title}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
                onPlayPress={() => speak(`Playing ${t.title} by ${t.artist}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

