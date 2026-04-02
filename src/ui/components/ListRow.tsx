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
  highlight?: boolean;
  /** Show a pin when this row already has a saved shortcut */
  pinnedShortcut?: boolean;
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
      onTouchStart={lp.onTouchStart}
      onTouchMove={lp.onTouchMove}
      onTouchEnd={lp.onTouchEnd}
      onTouchCancel={lp.onTouchCancel}
      onMouseDown={lp.onMouseDown}
      onMouseMove={lp.onMouseMove}
      onMouseUp={lp.onMouseUp}
      onMouseLeave={lp.onMouseLeave}
      onContextMenu={(e) => {
        if (!props.onLongPress) return;
        e.preventDefault();
        props.onLongPress();
      }}
    >
      <div className="thumb" aria-hidden="true">
        {props.thumbText ?? "♪"}
      </div>
      <div style={{ overflow: "hidden", display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
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
        {props.pinnedShortcut ? (
          <span className="rowPinnedBadge" title="Pinned shortcut" aria-hidden="true">
            <Icon name="pin" size={16} />
          </span>
        ) : null}
      </div>
      {props.onLongPress ? (
        <button
          className="moreBtn"
          type="button"
          aria-label={`More options for ${props.title}`}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            props.onLongPress?.();
          }}
        >
          <Icon name="overflow" size={20} />
        </button>
      ) : props.onPlayPress ? (
        <button
          className="playBtn"
          type="button"
          aria-label={`Play ${props.title}`}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
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
