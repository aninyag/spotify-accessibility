import * as React from "react";
import type { Landmark, RepeatMode, Track } from "../types";
import { HeaderBar } from "../components/HeaderBar";
import { formatTime } from "../a11y";
import { Icon } from "../components/Icon";

export function NowScreen(props: {
  track: Track;
  isPlaying: boolean;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  currentTimeSec: number;
  queue: Track[];
  landmarks: Landmark[];
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onSeek: (timeSec: number) => void;
  onCommandPalette: () => void;
  onLandmarkPress: (lm: Landmark) => void;
  onLandmarkRemove: (id: string) => void;
  onAddLandmark: () => void;
}) {
  const total = props.track.durationSec;
  const current = Math.min(total, Math.max(0, props.currentTimeSec));
  const remaining = Math.max(0, total - current);

  const queueNext = props.queue.find((t) => t.id !== props.track.id) ?? props.queue[0];

  return (
    <>
      <div className="headerGradient">
        <HeaderBar
          title="Now Playing"
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

          <div style={{ textAlign: "left" }}>
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
          <ControlButton
            label={`Shuffle, toggle button, ${props.shuffleEnabled ? "on" : "off"}`}
            active={props.shuffleEnabled}
            onPress={props.onShuffleToggle}
          >
            <Icon name="shuffle" size={22} />
          </ControlButton>
          <ControlButton label="Previous, button" onPress={props.onPrevious}>
            <Icon name="previous" size={22} />
          </ControlButton>
          <ControlButton
            label={props.isPlaying ? "Pause, button" : "Play, button"}
            onPress={props.onTogglePlay}
            big
          >
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
            <div className="sectionHeader" style={{ marginTop: 0 }}>Queue</div>
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
        </section>

        <section aria-label="Pinned">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700 }}>Pinned</div>
          <button type="button" className="ghostBtn" aria-label="Add current item to pinned" onClick={props.onAddLandmark}>
            <Icon name="plus" size={16} /> Add
          </button>
          </div>

          {props.landmarks.length === 0 ? (
            <div className="muted" style={{ marginTop: 10 }}>
              Add pinned items for quick access. Right-click any item to add.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 2, marginTop: 10 }}>
              {props.landmarks.map((lm, idx) => (
                <button
                  key={lm.id}
                  type="button"
                  className="row"
                  aria-label={`Pinned item ${idx + 1}: ${lm.label}. ${lm.type}. Tap to open.`}
                  onClick={() => props.onLandmarkPress(lm)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    props.onLandmarkRemove(lm.id);
                  }}
                  style={{ textAlign: "left" }}
                >
                  <div className="thumb" aria-hidden="true" style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 2, top: 2, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>📌</span>
                  </div>
                  <div>
                    <div className="title">{lm.label}</div>
                    <div className="subtitle">{lm.type}</div>
                  </div>
                  <div aria-hidden="true" style={{ width: 46, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.7)" }}>
                    <Icon name="chevronRight" size={18} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ControlButton(props: {
  label: string;
  onPress: () => void;
  active?: boolean;
  big?: boolean;
  children: React.ReactNode;
}) {
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

