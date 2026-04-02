import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { AxisEntryCard } from "../components/AxisEntryCard";
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

const recentPlayed = [
  { id: "rp1", title: "Midnight pulse", subtitle: "Playlist · 2 hr ago" },
  { id: "rp2", title: "Neon dreams", subtitle: "Album · Yesterday" },
  { id: "rp3", title: "Lo-fi study", subtitle: "Radio · 3 days ago" },
];

export function DiscoverScreen(props: {
  onCommandPalette: () => void;
  onOpenContext: (target: ContextTarget) => void;
  onOpenProfile: () => void;
  axisEnabled: boolean;
  showAxisEntryCard: boolean;
  onStartAxisTutorial: () => void;
  onDismissAxisCard: () => void;
}) {
  const [chip, setChip] = React.useState<(typeof chips)[number]>("All");

  return (
    <>
      <div className="headerPlain">
        <HeaderBar
          title=""
          left={{ kind: "avatar", label: "Open profile", onPress: props.onOpenProfile }}
          onCommandPalette={props.onCommandPalette}
          showAxisMic={props.axisEnabled}
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
        <section aria-label="Recently played">
          <div className="sectionHeader" style={{ marginTop: 0 }}>
            Recently played
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {recentPlayed.map((r) => (
              <button
                key={r.id}
                type="button"
                className="homeRecentRow"
                aria-label={`${r.title}. ${r.subtitle}`}
              >
                <div className="homeRecentArt" aria-hidden="true" />
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div className="rowPrimary">{r.title}</div>
                  <div className="rowSecondary">{r.subtitle}</div>
                </div>
                <div className="homeRecentChevron" aria-hidden="true">
                  <Icon name="chevronRight" size={18} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {props.showAxisEntryCard ? (
          <AxisEntryCard onStartTutorial={props.onStartAxisTutorial} onDismiss={props.onDismissAxisCard} />
        ) : null}

        {props.axisEnabled ? (
          <section aria-label="Axis quick actions">
            <div className="sectionHeader">Quick actions</div>
            <div className="axisQuickStrip">
              <button
                type="button"
                className="axisQuickChip"
                onClick={props.onCommandPalette}
                aria-label="Open Axis controls"
              >
                <Icon name="mic" size={18} />
                Axis controls
              </button>
              <button type="button" className="axisQuickChipMuted" aria-label="Library shortcut (demo)">
                <Icon name="library" size={18} />
                Library
              </button>
            </div>
          </section>
        ) : null}

        <section aria-label="Shortcuts">
          <div className="sectionHeader">{props.axisEnabled ? "Shortcuts" : "Made for you"}</div>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
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
