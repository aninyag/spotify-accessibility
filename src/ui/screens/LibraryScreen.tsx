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

  const items = React.useMemo(() => mockLibrary.filter((x) => x.type === filter), [filter]);

  return (
    <>
      <div className="headerPlain">
        <HeaderBar
          title="Your Library"
          left={{ kind: "avatar", label: "Profile" }}
          rightIcons={[
            { icon: "search", label: "Search", onPress: () => {} },
            { icon: "plusCircle", label: "Create", onPress: () => {} },
          ]}
          onCommandPalette={props.onCommandPalette}
        />
      </div>
      <div className="screenInner">
        <div aria-label="Library filters">
          <div className="pillRow" role="tablist" aria-label="Library filter tabs" style={{ gap: 10 }}>
            <button type="button" className="iconBtn" aria-label="Filters" style={{ width: 44, height: 44 }}>
              <Icon name="overflow" size={20} />
            </button>
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

        <div aria-label="Sort row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div aria-hidden="true" style={{ color: "#b3b3b3" }}>⇅</div>
            <div className="rowPrimary" style={{ color: "#b3b3b3" }}>Recents</div>
          </div>
          <button type="button" className="iconBtn" aria-label="Grid view" style={{ width: 44, height: 44 }}>
            <Icon name="library" size={20} />
          </button>
        </div>

        <section aria-label="Library list">
          <div style={{ display: "grid", gap: 2, marginTop: 6 }}>
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
        </section>
      </div>
    </>
  );
}

