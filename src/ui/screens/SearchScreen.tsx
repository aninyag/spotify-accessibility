import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import type { Landmark } from "../types";
import type { Track } from "../types";
import { Icon } from "../components/Icon";

const filterOptions = ["All", "Songs", "Artists", "Albums", "Playlists", "Podcasts"] as const;
type Filter = (typeof filterOptions)[number];

const mockResults: Track[] = [
  { id: "s1", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", durationSec: 324 },
  { id: "s2", title: "Jazz Vibes", artist: "Spotify", album: "Playlist", durationSec: 0 },
  { id: "s3", title: "Jazz Classics", artist: "Various", album: "Album", durationSec: 0 },
];

export function SearchScreen(props: {
  onCommandPalette: () => void;
  tts: { enabled: boolean; rate: number };
  onAddLandmark: (lm: Landmark) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("All");
  const [recents, setRecents] = React.useState<string[]>(["jazz piano", "Dua Lipa", "workout playlist"]);

  const showResults = query.trim().length > 0;

  const results = React.useMemo(() => {
    if (!showResults) return [];
    // Prototype filter is visual only.
    return mockResults;
  }, [showResults]);

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    setRecents((prev) => [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 10));
  };

  return (
    <>
      <div className="headerGradient">
        <HeaderBar title="Search" onCommandPalette={props.onCommandPalette} />
        <div className="searchBarWrap" style={{ marginTop: 6 }}>
          <div className="searchIcon" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
            <Icon name="search" size={18} />
          </div>
          <input
            className="searchText"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, album"
            aria-label="Search songs, artists, albums"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            style={{ border: "none", outline: "none", background: "transparent" }}
          />
        </div>
        <div className="pillRow" role="tablist" aria-label="Filter chips" style={{ marginTop: 12 }}>
          {["Songs", "Albums", "Artists", "Playlist"].map((opt, idx) => (
            <button
              key={opt}
              type="button"
              className="pill"
              role="tab"
              aria-selected={idx === 0}
              aria-label={`${opt} filter chip`}
              style={{
                padding: "0",
                borderRadius: 0,
                background: "transparent",
                height: "26px",
                borderBottom: idx === 0 ? "2px solid #57B65F" : "2px solid transparent",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="screenInner">
        {!showResults ? (
          <section aria-label="Category cards">
            <div className="sectionHeader">Top songs</div>
            <div className="pillRow" role="tablist" aria-label="Top songs filters" style={{ gap: 24 }}>
              {["All", "Pop", "HipHop"].map((name, idx) => (
                <button
                  key={name}
                  type="button"
                  className="pill"
                  aria-selected={idx === 0}
                  style={{
                    padding: "0",
                    borderRadius: 0,
                    background: "transparent",
                    height: "26px",
                    borderBottom: idx === 0 ? "2px solid #57B65F" : "2px solid transparent",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 2, marginTop: 6 }}>
              {recents.length === 0 ? (
                <div className="muted">No recent searches.</div>
              ) : (
                recents.map((r) => (
                  <ListRow
                    key={r}
                    title={r}
                    subtitle="Dua Lipa · Pop"
                    ariaLabel={`Recent search ${r}. Tap to search.`}
                    thumbText="♪"
                    onPress={() => {
                      setQuery(r);
                    }}
                    onLongPress={() => {
                      props.onAddLandmark({
                        id: `lm-${Date.now()}`,
                        label: `Search: ${r}`,
                        type: "search",
                        payload: { kind: "search", query: r },
                      });
                    }}
                    onPlayPress={() => {}}
                  />
                ))
              )}
            </div>
          </section>
        ) : (
          <section aria-label="Results list">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div className="sectionHeader" style={{ marginTop: 0 }}>Results for “{query.trim()}”</div>
              <div className="muted">{results.length}</div>
            </div>
            <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
              {results.map((t) => (
                <ListRow
                  key={t.id}
                  title={t.title}
                  subtitle={`${t.artist} · ${filter}`}
                  ariaLabel={trackAriaLabel({ ...t, durationSec: t.durationSec || 180 })}
                  onPress={() => {}}
                  onPlayPress={() => {}}
                  onLongPress={() =>
                    props.onAddLandmark({
                      id: `lm-${Date.now()}`,
                      label: t.title,
                      type: "search",
                      payload: { kind: "search", query: t.title },
                    })
                  }
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button type="button" className="ghostBtn" onClick={submit} aria-label="Search again">
                Search
              </button>
              <button
                type="button"
                className="ghostBtn"
                onClick={() => {
                  setQuery("");
                }}
                aria-label="Clear search"
              >
                Clear
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

