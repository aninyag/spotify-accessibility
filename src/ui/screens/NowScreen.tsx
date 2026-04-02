import * as React from "react";
import type { ContextTarget, Landmark, RepeatMode, Track } from "../types";
import { HeaderBar } from "../components/HeaderBar";
import { formatTime } from "../a11y";
import { Icon } from "../components/Icon";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import { LongPressable } from "../components/LongPressable";
import { isContextPinned } from "../pinnedUtils";

export function NowScreen(props: {
  track: Track;
  isPlaying: boolean;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  currentTimeSec: number;
  queue: Track[];
  landmarks: Landmark[];
  trackLiked: boolean;
  onToggleLike: () => void;
  onBack: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onSeek: (timeSec: number) => void;
  onCommandPalette: () => void;
  onPlayTrack: (t: Track) => void;
  onExecutePinned: (lm: Landmark) => void;
  onOpenContext: (target: ContextTarget) => void;
}) {
  const total = props.track.durationSec;
  const current = Math.min(total, Math.max(0, props.currentTimeSec));
  const remaining = Math.max(0, total - current);

  const queueNext = props.queue.find((t) => t.id !== props.track.id) ?? props.queue[0];
  const qIdx = props.queue.findIndex((t) => t.id === props.track.id);
  const upcoming =
    qIdx >= 0 ? props.queue.slice(qIdx + 1, qIdx + 4) : props.queue.filter((t) => t.id !== props.track.id).slice(0, 3);

  const nowPlayingContext = (): ContextTarget => ({
    landmark: {
      id: `lm-track-${props.track.id}`,
      label: props.track.title,
      type: "album",
      payload: { kind: "stub", ref: props.track.id },
    },
    queueTrack: props.track,
    artistName: props.track.artist,
  });

  return (
    <>
      <div className="headerGradient">
        <HeaderBar
          title="Now Playing"
          left={{ kind: "icon", label: "Back", onPress: props.onBack, icon: "chevronLeft" }}
          onCommandPalette={props.onCommandPalette}
        />
      </div>
      <div className="screenInner">
        <section aria-label="Now playing" style={{ paddingTop: 0 }}>
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 4,
              background: "#2a2a2a",
              margin: "4px 0 14px",
              display: "grid",
              placeItems: "center",
              color: "#B3B3B3",
            }}
          >
            Album Art
          </div>

          <LongPressable
            ariaLabel={`${props.track.title}. Long-press for more options.`}
            onLongPress={() => props.onOpenContext(nowPlayingContext())}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, lineHeight: "28px" }} role="heading" aria-level={1} tabIndex={-1}>
                    {props.track.title}
                  </div>
                  <button
                    type="button"
                    className="textBtn"
                    style={{ marginTop: 4, minHeight: 28, padding: 0 }}
                    aria-label={`Go to artist: ${props.track.artist}`}
                  >
                    <span style={{ fontSize: 16, fontWeight: 400, color: "#B3B3B3" }}>{props.track.artist}</span>
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="iconBtn"
                    aria-label={props.trackLiked ? "Remove like" : "Like"}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onToggleLike();
                    }}
                    style={{ color: props.trackLiked ? "#1DB954" : "#B3B3B3" }}
                  >
                    <Icon name="heart" size={26} />
                  </button>
                  <button
                    type="button"
                    className="iconBtn"
                    aria-label={`More options for ${props.track.title}`}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onOpenContext(nowPlayingContext());
                    }}
                    style={{ color: "#B3B3B3" }}
                  >
                    <Icon name="overflow" size={22} />
                  </button>
                </div>
              </div>
              {props.track.album ? (
                <button
                  type="button"
                  className="textBtn textBtnMuted"
                  style={{ display: "block", width: "100%", minHeight: 24, padding: 0 }}
                  aria-label={`Go to album: ${props.track.album}`}
                >
                  <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>
                    {props.track.album}
                  </span>
                </button>
              ) : null}
            </div>
          </LongPressable>
        </section>

        <section aria-label="Progress">
          <label className="muted" htmlFor="progress" style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
            <span>{formatTime(current)}</span>
            <span>{formatTime(total)}</span>
          </label>
          <input
            id="progress"
            type="range"
            min={0}
            max={total}
            value={current}
            onChange={(e) => props.onSeek(Number(e.target.value))}
            aria-label={`Progress, adjustable, ${formatTime(current)} of ${formatTime(total)}`}
            style={{ width: "100%", marginTop: 6 }}
          />
          <div className="muted" style={{ fontSize: 12, marginTop: 6, textAlign: "center", color: "rgba(255,255,255,0.65)" }}>
            {Math.floor(remaining / 60)} minutes {Math.floor(remaining % 60)} seconds remaining
          </div>
        </section>

        <section aria-label="Playback controls">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            <ControlButton label={`Shuffle, toggle button, ${props.shuffleEnabled ? "on" : "off"}`} active={props.shuffleEnabled} onPress={props.onShuffleToggle}>
              <Icon name="shuffle" size={22} />
            </ControlButton>
            <ControlButton label="Previous, button" onPress={props.onPrevious}>
              <Icon name="previous" size={22} />
            </ControlButton>
            <ControlButton label={props.isPlaying ? "Pause, button" : "Play, button"} onPress={props.onTogglePlay} big>
              <Icon name={props.isPlaying ? "pause" : "play"} size={24} />
            </ControlButton>
            <ControlButton label="Next, button" onPress={props.onNext}>
              <Icon name="next" size={22} />
            </ControlButton>
            <ControlButton label={`Repeat, toggle button, ${props.repeatMode}`} active={props.repeatMode !== "off"} onPress={props.onRepeatToggle}>
              <Icon name={props.repeatMode === "one" ? "repeatOne" : "repeat"} size={22} />
            </ControlButton>
          </div>
          <div className="muted" style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
            <span>Shuffle</span>
            <span>Prev</span>
            <span>{props.isPlaying ? "Pause" : "Play"}</span>
            <span>Next</span>
            <span>Repeat</span>
          </div>
        </section>

        <section aria-label="Queue preview">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div className="sectionHeader" style={{ marginTop: 0 }}>
                Queue
              </div>
              <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                Up next: “{queueNext?.title ?? "—"}” — {queueNext?.artist ?? ""}
              </div>
              <div className="muted" style={{ fontSize: 14, marginTop: 2 }}>
                {props.queue.length} songs
              </div>
            </div>
            <button type="button" className="ghostBtn" aria-label="Open queue" onClick={props.onCommandPalette}>
              <Icon name="chevronRight" size={18} />
            </button>
          </div>
          {upcoming.length > 0 ? (
            <div style={{ marginTop: 10, display: "grid", gap: 2 }}>
              {upcoming.map((t) => {
                const ctx: ContextTarget = {
                  landmark: {
                    id: `lm-queue-${t.id}`,
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
                    subtitle={t.artist}
                    ariaLabel={trackAriaLabel(t)}
                    pinnedShortcut={isContextPinned(ctx, props.landmarks)}
                    onPress={() => props.onPlayTrack(t)}
                    onLongPress={() => props.onOpenContext(ctx)}
                  />
                );
              })}
            </div>
          ) : null}
        </section>

        <section aria-label="Pinned">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Pinned</div>

          {props.landmarks.length === 0 ? (
            <div className="muted" style={{ marginTop: 10 }}>Tap ··· on any row to pin it here.</div>
          ) : (
            <div style={{ display: "grid", gap: 2, marginTop: 10 }}>
              {props.landmarks.map((lm, idx) => (
                <ListRow
                  key={lm.id}
                  title={lm.label}
                  subtitle={lm.type}
                  ariaLabel={`Pinned item ${idx + 1}: ${lm.label}. ${lm.type}. Tap to open.`}
                  onPress={() => props.onExecutePinned(lm)}
                  onLongPress={() => props.onOpenContext({ landmark: lm })}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ControlButton(props: { label: string; onPress: () => void; active?: boolean; big?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={props.label}
      onClick={props.onPress}
      style={{
        minHeight: props.big ? 64 : 56,
        borderRadius: props.big ? 999 : 8,
        borderColor: props.big ? "transparent" : "transparent",
        background: props.big ? "white" : "transparent",
        color: props.big ? "black" : props.active ? "#1DB954" : "#B3B3B3",
        fontWeight: 700,
        fontSize: props.big ? 22 : 18,
        display: "grid",
        placeItems: "center",
      }}
    >
      {props.children}
    </button>
  );
}
