import type { Track } from "../types";
import { Icon } from "./Icon";
import { useLongPress } from "../useLongPress";

export function ListRow(props: {
  title: string;
  subtitle?: string;
  explicit?: boolean;
  onPress: () => void;
  onPlayPress?: () => void;
  onLongPress?: () => void;
  ariaLabel: string;
  thumbText?: string;
  /** Brief highlight when an item was just pinned (instant feedback). */
  highlight?: boolean;
}) {
  const lp = useLongPress(props.onLongPress);
  return (
    <div
      className={`row${props.highlight ? " rowHighlight" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={props.ariaLabel}
      onClick={(e) => {
        if (lp.consumeLongPressClick()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        props.onPress();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") props.onPress();
      }}
      onPointerDown={lp.onPointerDown}
      onPointerUp={lp.onPointerUp}
      onPointerCancel={lp.onPointerCancel}
      onContextMenu={(e) => {
        if (!props.onLongPress) return;
        e.preventDefault();
        props.onLongPress();
      }}
    >
      <div className="thumb" aria-hidden="true">
        {props.thumbText ?? "♪"}
      </div>
      <div>
        <div className="rowPrimary">{props.title}</div>
        {props.subtitle ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            {props.explicit ? (
              <div
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: "#57B65F",
                  color: "black",
                  fontSize: 10,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                }}
              >
                E
              </div>
            ) : null}
            <div className="rowSecondary">{props.subtitle}</div>
          </div>
        ) : null}
      </div>
      {props.onPlayPress ? (
        <button
          className="playBtn"
          type="button"
          aria-label={`Play ${props.title}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => (e.stopPropagation(), props.onPlayPress?.())}
        >
          <Icon name="play" size={18} />
        </button>
      ) : (
        <div aria-hidden="true" style={{ width: 48, height: 48 }} />
      )}
    </div>
  );
}

export function trackAriaLabel(t: Track) {
  const min = Math.floor(t.durationSec / 60);
  const sec = String(t.durationSec % 60).padStart(2, "0");
  return `${t.title} by ${t.artist}. ${min} minutes ${sec} seconds. Tap to play.`;
}

