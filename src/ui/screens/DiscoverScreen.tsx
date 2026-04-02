import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import type { ContextTarget } from "../types";
import { Icon } from "../components/Icon";
import { LongPressable } from "../components/LongPressable";

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

export function DiscoverScreen(props: { onCommandPalette: () => void; onOpenContext: (target: ContextTarget) => void }) {
  const [chip, setChip] = React.useState<(typeof chips)[number]>("All");

  return (
    <>
      <div className="headerPlain">
        <HeaderBar
          title=""
          left={{ kind: "avatar", label: "Profile" }}
          onCommandPalette={props.onCommandPalette}
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
        <section aria-label="Shortcuts">
          <div style={{ display: "grid", gap: 8 }}>
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
