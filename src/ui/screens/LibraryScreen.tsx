import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow } from "../components/ListRow";
import type { ContextTarget, Landmark } from "../types";
import { Icon } from "../components/Icon";
import { AXIS_PROFILE_PHOTO_URL, ON_REPEAT_COVER_URL } from "../axisMedia";

const filterOptions = ["Playlists", "Albums", "Artists", "Podcasts", "Downloads"] as const;
type Filter = (typeof filterOptions)[number];

type LibraryItem = { id: string; title: string; subtitle: string; type: Filter };

const mockLibrary: LibraryItem[] = [
  { id: "p1", title: "Liked Songs", subtitle: "324 songs", type: "Playlists" },
  { id: "p-on-repeat", title: "On Repeat", subtitle: "Songs you love · By Spotify", type: "Playlists" },
  { id: "p2", title: "Chill Vibes", subtitle: "47 songs · By you", type: "Playlists" },
  { id: "p3", title: "Workout Mix", subtitle: "89 songs · By Spotify", type: "Playlists" },
  { id: "p4", title: "Jazz Classics", subtitle: "156 songs · By you", type: "Playlists" },
];

export function LibraryScreen(props: {
  onCommandPalette: () => void;
  landmarks: Landmark[];
  onOpenContext: (target: ContextTarget) => void;
  onExecutePinned: (lm: Landmark) => void;
  pinnedFlashId: string | null;
  onMovePinned: (id: string, direction: "up" | "down") => void;
  onUnpinPinned: (id: string) => void;
  axisEnabled: boolean;
  onOpenProfile: () => void;
}) {
  const [filter, setFilter] = React.useState<Filter>("Playlists");
  const [pinnedEditMode, setPinnedEditMode] = React.useState(false);

  const items = React.useMemo(() => mockLibrary.filter((x) => x.type === filter), [filter]);

  React.useEffect(() => {
    if (props.landmarks.length === 0 && pinnedEditMode) setPinnedEditMode(false);
  }, [props.landmarks.length, pinnedEditMode]);

  return (
    <>
      <div className="headerPlain">
        <HeaderBar
          title="Your Library"
          left={{
            kind: "avatar",
            label: "Open profile",
            onPress: props.onOpenProfile,
            imageSrc: AXIS_PROFILE_PHOTO_URL,
          }}
          rightIcons={[
            { icon: "search", label: "Search", onPress: () => {} },
            { icon: "plusCircle", label: "Create", onPress: () => {} },
          ]}
          onCommandPalette={props.onCommandPalette}
          showAxisMic={props.axisEnabled}
        />
      </div>
      <div className="screenInner">
        {props.axisEnabled && props.landmarks.length > 0 ? (
          <section aria-label="Pinned">
            <div className="sectionHeader pinnedHeaderRow" style={{ marginTop: 0 }}>
              <span>Pinned</span>
              <button
                type="button"
                className="pinnedEditBtn"
                onClick={() => setPinnedEditMode((e) => !e)}
                aria-pressed={pinnedEditMode}
              >
                {pinnedEditMode ? "Done" : "Edit"}
              </button>
            </div>
            <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
              {props.landmarks.map((lm, idx) =>
                pinnedEditMode ? (
                  <div className="pinnedRowEdit" key={lm.id}>
                    <div className="pinnedEditControls">
                      <button
                        type="button"
                        className="pinnedChevronBtn"
                        disabled={idx === 0}
                        aria-label={`Move ${lm.label} up`}
                        onClick={() => props.onMovePinned(lm.id, "up")}
                      >
                        <Icon name="chevronUp" size={18} />
                      </button>
                      <button
                        type="button"
                        className="pinnedChevronBtn"
                        disabled={idx >= props.landmarks.length - 1}
                        aria-label={`Move ${lm.label} down`}
                        onClick={() => props.onMovePinned(lm.id, "down")}
                      >
                        <Icon name="chevronDown" size={18} />
                      </button>
                    </div>
                    <ListRow
                      title={lm.label}
                      subtitle={lm.type === "action" ? "Shortcut" : lm.type}
                      ariaLabel={`Pinned ${idx + 1}: ${lm.label}`}
                      onPress={() => {}}
                      highlight={props.pinnedFlashId === lm.id}
                    />
                    <button
                      type="button"
                      className="pinnedRemoveBtn"
                      aria-label={`Remove ${lm.label} from pinned`}
                      onClick={() => props.onUnpinPinned(lm.id)}
                    >
                      <Icon name="close" size={20} />
                    </button>
                  </div>
                ) : (
                  <ListRow
                    key={lm.id}
                    title={lm.label}
                    subtitle={lm.type === "action" ? "Shortcut" : lm.type}
                    ariaLabel={`Pinned ${idx + 1}: ${lm.label}. Tap to execute.`}
                    onPress={() => props.onExecutePinned(lm)}
                    onLongPress={() => props.onOpenContext({ landmark: lm })}
                    highlight={props.pinnedFlashId === lm.id}
                  />
                ),
              )}
            </div>
          </section>
        ) : null}

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
            <div aria-hidden="true" style={{ color: "#b3b3b3" }}>
              ⇅
            </div>
            <div className="rowPrimary" style={{ color: "#b3b3b3" }}>
              Recents
            </div>
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
                thumbSrc={it.id === "p-on-repeat" ? ON_REPEAT_COVER_URL : undefined}
                ariaLabel={`${it.title}. ${it.subtitle}. Tap to open.`}
                onPress={() => {}}
                onLongPress={() =>
                  props.onOpenContext({
                    landmark: {
                      id: `lm-lib-${it.id}`,
                      label: it.title,
                      type: "playlist",
                      payload: { kind: "stub", ref: it.id },
                    },
                    artistName: "Various artists",
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
