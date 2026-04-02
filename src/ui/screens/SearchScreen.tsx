import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import type { Landmark } from "../types";
import { Icon } from "../components/Icon";

export function SearchScreen(props: {
  onCommandPalette: () => void;
  tts: { enabled: boolean; rate: number };
  onAddLandmark: (lm: Landmark) => void;
}) {
  const [query, setQuery] = React.useState("");

  return (
    <>
      <div className="headerPlain">
        <HeaderBar
          title="Search"
          left={{ kind: "avatar", label: "Profile" }}
          rightIcons={[{ icon: "camera", label: "Camera", onPress: () => {} }]}
          onCommandPalette={props.onCommandPalette}
        />
        <div className="searchBarWrap searchBarWrapSpotify" style={{ marginTop: 10 }}>
          <div className="searchIcon" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
            <Icon name="search" size={18} />
          </div>
          <input
            className="searchText"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            aria-label="Search"
            style={{ border: "none", outline: "none", background: "transparent" }}
          />
        </div>
      </div>
      <div className="screenInner">
        <section aria-label="Start browsing">
          <div className="sectionHeader" style={{ marginTop: 0 }}>
            Start browsing
          </div>
          <div className="browseGrid" style={{ marginTop: 12 }}>
            <div className="browseTile" style={{ background: "#E9147B" }}>
              <span>Music</span>
              <div className="browseTileArt" aria-hidden="true" />
            </div>
            <div className="browseTile" style={{ background: "#0A7C6D" }}>
              <span>Podcasts</span>
              <div className="browseTileArt" aria-hidden="true" />
            </div>
            <div className="browseTile" style={{ background: "#2D46B9" }}>
              <span>Audiobooks</span>
              <div className="browseTileArt" aria-hidden="true" />
            </div>
            <div className="browseTile" style={{ background: "#7C2AE8" }}>
              <span>Live Events</span>
              <div className="browseTileArt" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section aria-label="Explore music videos">
          <div className="sectionHeader">Explore music videos</div>
          <div className="rail" style={{ marginTop: 12 }}>
            {["Throwback Thursday", "just hits", "All out 2000s"].map((t) => (
              <div key={t} style={{ minWidth: 132 }}>
                <div className="railCard" aria-hidden="true" />
                <div className="railLabel">{t}</div>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Explore episodes for you">
          <div className="sectionHeader">Explore episodes for you</div>
          <div className="rail" style={{ marginTop: 12 }}>
            {["New releases", "For you", "Trending"].map((t) => (
              <div key={t} style={{ minWidth: 132 }}>
                <div className="railCard" aria-hidden="true" />
                <div className="railLabel">{t}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

