import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow } from "../components/ListRow";
import type { Landmark } from "../types";
import { Icon } from "../components/Icon";

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
  tts: { enabled: boolean; rate: number };
  onAddLandmark: (lm: Landmark) => void;
  landmarks: Landmark[];
  onRemoveLandmark: (id: string) => void;
}) {
  const [filter, setFilter] = React.useState<Filter>("Playlists");
  const [sort, setSort] = React.useState<Sort>("Recently Played");
  const [ascending, setAscending] = React.useState(false);

  const items = React.useMemo(() => mockLibrary.filter((x) => x.type === filter), [filter]);

  return (
    <>
      <div className="headerGradient">
        <HeaderBar title="Your Library" onCommandPalette={props.onCommandPalette} />
      </div>
      <div className="screenInner">
        <section aria-label="Pinned" style={{ marginTop: -6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="sectionHeader" style={{ marginTop: 0 }}>Pinned</div>
            <div className="muted">{props.landmarks.length} / 6</div>
          </div>
          {props.landmarks.length === 0 ? (
            <div className="muted" style={{ marginTop: 8 }}>
              Pin items for quick access.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
              {props.landmarks.map((lm, idx) => (
                <div key={lm.id} className="row" role="group" aria-label={`Pinned item ${idx + 1}: ${lm.label}`}>
                  <div className="thumb" aria-hidden="true" style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 2, top: 2, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>📌</span>
                  </div>
                  <div>
                    <div className="title">{lm.label}</div>
                    <div className="subtitle">{lm.type}</div>
                  </div>
                  <button type="button" className="ghostBtn" aria-label={`Remove ${lm.label}`} onClick={() => props.onRemoveLandmark(lm.id)}>
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div aria-label="Library filters">
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
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div aria-label="Sort control">
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="muted" style={{ fontSize: 14 }}>
                Sort
              </div>
              <button
                type="button"
                className="ghostBtn"
                aria-label={`Sort: ${sort}. Activate to change sort.`}
                onClick={() => {
                  const idx = sortOptions.indexOf(sort);
                  const next = sortOptions[(idx + 1) % sortOptions.length];
                  setSort(next);
                }}
              >
                {sort} ▼
              </button>
            </div>
            <button
              type="button"
              className="ghostBtn"
              aria-label={`Toggle ${ascending ? "ascending" : "descending"}`}
              onClick={() => {
                setAscending((a) => !a);
              }}
            >
              <Icon name="overflow" size={18} />
            </button>
          </div>
        </div>

        <section aria-label="Library list">
          <div className="sectionHeader" style={{ marginTop: 0 }}>Recently played</div>
          <div className="muted">{items.length} {filter}</div>
          <div style={{ display: "grid", gap: 2, marginTop: 4 }}>
            {items.map((it) => (
              <ListRow
                key={it.id}
                title={it.title}
                subtitle={it.subtitle}
                ariaLabel={`${it.title}. ${it.subtitle}. Tap to open.`}
                onPress={() => {}}
                onPlayPress={() => {}}
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
      </div>
    </>
  );
}

