import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import type { Landmark } from "../types";
import type { Track } from "../types";
import { speak } from "../tts";

const filterOptions = ["All", "Songs", "Artists", "Albums", "Playlists", "Podcasts"] as const;
type Filter = (typeof filterOptions)[number];

const mockResults: Track[] = [
  { id: "s1", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", durationSec: 324 },
  { id: "s2", title: "Jazz Vibes", artist: "Spotify", album: "Playlist", durationSec: 0 },
  { id: "s3", title: "Jazz Classics", artist: "Various", album: "Album", durationSec: 0 },
];

export function SearchScreen(props: {
  onCommandPalette: () => void;
  onWhereAmI: () => void;
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
    speak(`Searching for ${q}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
    speak(`${results.length} results for ${q}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "queue" });
  };

  return (
    <>
      <div className="headerGradient">
        <HeaderBar title="IV Mode" left={{ label: "Where am I", onPress: props.onWhereAmI }} right={{ label: "Open command palette", onPress: props.onCommandPalette }} />
        <div className="searchBarWrap" style={{ marginTop: 6 }}>
          <div className="searchIcon">⌕</div>
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
          <button
            type="button"
            aria-label="Voice search. Tap to speak."
            onClick={() => speak("Listening... (prototype stub)", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
            style={{ border: "none", background: "transparent", color: "black", minHeight: 19, padding: 0 }}
          >
            🎤
          </button>
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
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="screenInner">
        <button
          type="button"
          className="cta"
          aria-label="Voice search. Tap to speak."
          onClick={() => speak("Listening... (prototype stub)", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
        >
          🎤 Tap to speak
        </button>

        {!showResults ? (
          <section className="card" aria-label="Category cards">
            <div className="sectionTitle">Top Songs</div>
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
                      speak(`Searching for ${r}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
                    }}
                    onLongPress={() => {
                      setRecents((prev) => prev.filter((x) => x !== r));
                      speak(`Removed ${r} from recents`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
                    }}
                    onPlayPress={() => speak(`Playing ${r}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
                  />
                ))
              )}
            </div>
          </section>
        ) : (
          <section className="card" aria-label="Results list">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div className="sectionTitle" style={{ margin: 0, fontSize: 19 }}>Results for “{query.trim()}”</div>
              <div className="muted">{results.length}</div>
            </div>
            <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
              {results.map((t) => (
                <ListRow
                  key={t.id}
                  title={t.title}
                  subtitle={`${t.artist} · ${filter}`}
                  ariaLabel={trackAriaLabel({ ...t, durationSec: t.durationSec || 180 })}
                  onPress={() => speak(`Opening ${t.title}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
                  onPlayPress={() => speak(`Playing ${t.title} by ${t.artist}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
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
              <button type="button" onClick={submit} aria-label="Search again">
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  speak("Cleared search", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
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

