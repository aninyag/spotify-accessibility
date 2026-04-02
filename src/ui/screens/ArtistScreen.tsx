import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import type { ContextTarget, Landmark, Track } from "../types";
import { isContextPinned } from "../pinnedUtils";

export function ArtistScreen(props: {
  artistName: string;
  tracks: Track[];
  landmarks: Landmark[];
  axisEnabled: boolean;
  onBack: () => void;
  onPlayTrack: (t: Track) => void;
  onOpenContext: (target: ContextTarget) => void;
  onCommandPalette: () => void;
}) {
  return (
    <>
      <div className="headerPlain">
        <HeaderBar
          title={props.artistName}
          left={{ kind: "icon", label: "Back", onPress: props.onBack, icon: "chevronLeft" }}
          onCommandPalette={props.onCommandPalette}
          showAxisMic={props.axisEnabled}
        />
      </div>
      <div className="screenInner">
        <section aria-label={`Songs by ${props.artistName}`}>
          <div className="sectionHeader" style={{ marginTop: 0 }}>
            Popular
          </div>
          {props.tracks.length === 0 ? (
            <p style={{ color: "#b3b3b3", marginTop: 12, fontSize: 15, lineHeight: 1.5 }}>
              No demo tracks for this artist in your queue. Browse Search to add music.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 2, marginTop: 12 }}>
              {props.tracks.map((t) => {
                const ctx: ContextTarget = {
                  landmark: {
                    id: `lm-artist-${t.id}`,
                    label: t.title,
                    type: "album",
                    payload: { kind: "stub", ref: t.id },
                  },
                  queueTrack: t,
                  artistName: t.artist,
                };
                return (
                  <ListRow
                    key={t.id}
                    title={t.title}
                    subtitle={t.album ?? "Song"}
                    ariaLabel={trackAriaLabel(t)}
                    pinnedShortcut={props.axisEnabled && isContextPinned(ctx, props.landmarks)}
                    onPress={() => props.onPlayTrack(t)}
                    onLongPress={() => props.onOpenContext(ctx)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
