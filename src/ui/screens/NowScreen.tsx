import * as React from "react";
import type { Landmark, RepeatMode, Track } from "../types";
import { HeaderBar } from "../components/HeaderBar";
import { formatTime } from "../a11y";

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
  onWhereAmI: () => void;
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
      <HeaderBar
        title="Now Playing"
        right={{ label: "Open command palette", onPress: props.onCommandPalette }}
        left={{ label: "Where am I", onPress: props.onWhereAmI }}
      />

      <section className="card" aria-label="Now playing">
        <div
          aria-hidden="true"
          style={{
            width: 200,
            height: 200,
            borderRadius: 24,
            background: "#3E3E3E",
            margin: "4px auto 14px",
            display: "grid",
            placeItems: "center",
            color: "#B3B3B3",
            userSelect: "none",
          }}
        >
          Album Art
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900 }} role="heading" aria-level={1} tabIndex={-1}>
            {props.track.title}
          </div>
          <button
            type="button"
            style={{ marginTop: 6, background: "transparent", borderColor: "transparent", minHeight: 44 }}
            aria-label={`Go to artist: ${props.track.artist}`}
          >
            <span style={{ fontSize: 18, fontWeight: 600 }}>{props.track.artist}</span>
          </button>
          {props.track.album ? (
            <button
              type="button"
              style={{ display: "block", width: "100%", background: "transparent", borderColor: "transparent", minHeight: 40 }}
              aria-label={`Go to album: ${props.track.album}`}
            >
              <span className="muted" style={{ fontSize: 14 }}>
                {props.track.album}
              </span>
            </button>
          ) : null}
        </div>
      </section>

      <section className="card" aria-label="Progress">
        <label className="muted" htmlFor="progress" style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
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
          style={{ width: "100%", height: 36, marginTop: 6 }}
        />
        <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
          {Math.floor(remaining / 60)} minutes {Math.floor(remaining % 60)} seconds remaining
        </div>
      </section>

      <section className="card" aria-label="Playback controls">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          <ControlButton
            label={`Shuffle, toggle button, ${props.shuffleEnabled ? "on" : "off"}`}
            active={props.shuffleEnabled}
            onPress={props.onShuffleToggle}
          >
            ⟲
          </ControlButton>
          <ControlButton label="Previous, button" onPress={props.onPrevious}>
            ◀◀
          </ControlButton>
          <ControlButton
            label={props.isPlaying ? "Pause, button" : "Play, button"}
            onPress={props.onTogglePlay}
            big
          >
            {props.isPlaying ? "❚❚" : "▶"}
          </ControlButton>
          <ControlButton label="Next, button" onPress={props.onNext}>
            ▶▶
          </ControlButton>
          <ControlButton label={`Repeat, toggle button, ${props.repeatMode}`} active={props.repeatMode !== "off"} onPress={props.onRepeatToggle}>
            ⟳
          </ControlButton>
        </div>
        <div className="muted" style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 14 }}>
          <span>Shuffle</span>
          <span>Prev</span>
          <span>{props.isPlaying ? "Pause" : "Play"}</span>
          <span>Next</span>
          <span>Repeat</span>
        </div>
      </section>

      <section className="card" aria-label="Queue preview">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900 }}>Queue Preview</div>
            <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
              Up next: “{queueNext?.title ?? "—"}” — {queueNext?.artist ?? ""}
            </div>
            <div className="muted" style={{ fontSize: 14, marginTop: 2 }}>
              {props.queue.length} songs
            </div>
          </div>
          <button type="button" aria-label="Open queue" onClick={props.onCommandPalette}>
            →
          </button>
        </div>
      </section>

      <section className="card" aria-label="Your landmarks">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Your Landmarks</div>
          <button type="button" aria-label="Add current item to landmarks" onClick={props.onAddLandmark}>
            Add
          </button>
        </div>

        {props.landmarks.length === 0 ? (
          <div className="muted" style={{ marginTop: 10 }}>
            Add landmarks for quick access. Right-click any item to add.
          </div>
        ) : (
          <div className="pillRow" style={{ marginTop: 12 }}>
            {props.landmarks.map((lm, idx) => (
              <button
                key={lm.id}
                type="button"
                className="pill"
                aria-label={`Landmark ${idx + 1}. ${lm.label}. ${lm.type}. Tap to open.`}
                onClick={() => props.onLandmarkPress(lm)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  props.onLandmarkRemove(lm.id);
                }}
                style={{ minHeight: 80, minWidth: 120 }}
              >
                <div style={{ fontWeight: 900, textAlign: "left" }}>{lm.label}</div>
                <div className="muted" style={{ fontSize: 12, textAlign: "left", marginTop: 6 }}>
                  {lm.type}
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="hint">Keyboard: Ctrl/⌘+K for Command Palette · Ctrl/⌘+W for “Where am I” · Space play/pause</div>
      </section>
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
        minHeight: props.big ? 72 : 64,
        borderRadius: 16,
        borderColor: props.active ? "rgba(29,185,84,0.55)" : "rgba(255,255,255,0.12)",
        background: props.active ? "rgba(29,185,84,0.18)" : "#282828",
        fontWeight: 900,
        fontSize: props.big ? 22 : 18,
      }}
    >
      {props.children}
    </button>
  );
}

