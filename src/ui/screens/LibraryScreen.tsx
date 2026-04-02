import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow } from "../components/ListRow";
import type { Landmark } from "../types";
import { speak } from "../tts";

const filterOptions = ["Playlists", "Albums", "Artists", "Podcasts", "Downloads"] as const;
type Filter = (typeof filterOptions)[number];

const sortOptions = ["Recently Played", "Recently Added", "Alphabetical"] as const;
type Sort = (typeof sortOptions)[number];

type LibraryItem = { id: string; title: string; subtitle: string; type: Filter };

const mockLibrary: LibraryItem[] = [
  { id: "p1", title: "Liked Songs", subtitle: "324 songs", type: "Playlists" },
  { id: "p2", title: "Chill Vibes", subtitle: "47 songs · By you", type: "Playlists" },
  { id: "p3", title: "Workout Mix", subtitle: "89 songs · By Spotify", type: "Playlists" },
  { id: "p4", title: "Jazz Classics", subtitle: "156 songs · By you", type: "Playlists" },
];

export function LibraryScreen(props: {
  onCommandPalette: () => void;
  onWhereAmI: () => void;
  tts: { enabled: boolean; rate: number };
  onAddLandmark: (lm: Landmark) => void;
}) {
  const [filter, setFilter] = React.useState<Filter>("Playlists");
  const [sort, setSort] = React.useState<Sort>("Recently Played");
  const [ascending, setAscending] = React.useState(false);

  const items = React.useMemo(() => mockLibrary.filter((x) => x.type === filter), [filter]);

  return (
    <>
      <HeaderBar title="Your Library" left={{ label: "Where am I", onPress: props.onWhereAmI }} right={{ label: "Open command palette", onPress: props.onCommandPalette }} />

      <div className="card" aria-label="Library filters">
        <div className="pillRow" role="tablist" aria-label="Library filter tabs">
          {filterOptions.map((opt, idx) => (
            <button
              key={opt}
              type="button"
              className="pill"
              role="tab"
              aria-selected={filter === opt}
              aria-label={`${opt}. Tab. ${idx + 1} of ${filterOptions.length}. ${filter === opt ? "Selected" : "Not selected"}.`}
              onClick={() => {
                setFilter(opt);
                speak(`Viewing ${opt}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "queue" });
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="card" aria-label="Sort control">
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="muted" style={{ fontSize: 14 }}>
              Sort
            </div>
            <button
              type="button"
              aria-label={`Sort: ${sort}. Activate to change sort.`}
              onClick={() => {
                const idx = sortOptions.indexOf(sort);
                const next = sortOptions[(idx + 1) % sortOptions.length];
                setSort(next);
                speak(`Sort ${next}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
              }}
            >
              {sort} ▼
            </button>
          </div>
          <button
            type="button"
            aria-label={`Toggle ${ascending ? "ascending" : "descending"}`}
            onClick={() => {
              setAscending((a) => !a);
              speak(ascending ? "Descending" : "Ascending", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
            }}
          >
            ↑↓
          </button>
        </div>
      </div>

      <section className="card" aria-label="Library list">
        <div className="muted">{items.length} {filter}</div>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {items.map((it) => (
            <ListRow
              key={it.id}
              title={it.title}
              subtitle={it.subtitle}
              ariaLabel={`${it.title}. ${it.subtitle}. Tap to open.`}
              onPress={() => speak(`Opening ${it.title}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
              onPlayPress={() => speak(`Playing ${it.title}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
              onLongPress={() =>
                props.onAddLandmark({
                  id: `lm-${Date.now()}`,
                  label: it.title,
                  type: "playlist",
                  payload: { kind: "stub", ref: it.id },
                })
              }
            />
          ))}
        </div>
        <div className="hint">Prototype note: playlist detail screen is next on the build list.</div>
      </section>
    </>
  );
}

