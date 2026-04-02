import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { Icon } from "../components/Icon";

type Shortcut = { id: string; title: string; artKind: "cover" | "gradient" };

const chips = ["All", "Music", "Podcasts", "Audiobooks"] as const;

const shortcuts: Shortcut[] = [
  { id: "sc1", title: "ARIRANG", artKind: "cover" },
  { id: "sc2", title: "On Repeat", artKind: "gradient" },
  { id: "sc3", title: "daebak", artKind: "cover" },
  { id: "sc4", title: "Shall We Dance Radio", artKind: "cover" },
  { id: "sc5", title: "Rock Tha Party Radio", artKind: "cover" },
  { id: "sc6", title: "BTS ARIRANG WORLD TOUR S…", artKind: "cover" },
  { id: "sc7", title: "Love Dose Radio", artKind: "cover" },
  { id: "sc8", title: "Dil Garden Ho Gay…", artKind: "cover" },
];

export function DiscoverScreen(props: { onCommandPalette: () => void }) {
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {shortcuts.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={s.title}
                onClick={() => {}}
                style={{
                  height: 56,
                  borderRadius: 8,
                  background: "#2A2A2A",
                  display: "grid",
                  gridTemplateColumns: "56px 1fr 24px",
                  alignItems: "center",
                  gap: 10,
                  paddingRight: 8,
                  textAlign: "left",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    background: s.artKind === "gradient" ? "linear-gradient(135deg, #6B2AE8, #111)" : "#262626",
                  }}
                />
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.title}
                </div>
                {idx === 0 ? (
                  <div aria-hidden="true" style={{ width: 24, display: "grid", placeItems: "center", color: "#1DB954" }}>
                    <Icon name="overflow" size={18} />
                  </div>
                ) : (
                  <div aria-hidden="true" style={{ width: 24 }} />
                )}
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Albums featuring songs you like">
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: "32px", marginTop: 10 }}>
            Albums featuring songs you like
          </div>
          <div className="muted" style={{ marginTop: 6, fontSize: 13, fontWeight: 400 }}>
            BTS · 5 days ago · 2 min
          </div>
        </section>
      </div>
    </>
  );
}

