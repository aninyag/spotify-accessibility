import type { Track } from "../types";

export function ListRow(props: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  onPlayPress?: () => void;
  onLongPress?: () => void;
  ariaLabel: string;
  thumbText?: string;
}) {
  // Note: "long press" isn’t native on web; we map it to context menu for prototype.
  return (
    <div
      className="row"
      role="button"
      tabIndex={0}
      aria-label={props.ariaLabel}
      onClick={props.onPress}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") props.onPress();
      }}
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
        <div className="title">{props.title}</div>
        {props.subtitle ? <div className="subtitle">{props.subtitle}</div> : null}
      </div>
      {props.onPlayPress ? (
        <button className="playBtn" type="button" aria-label={`Play ${props.title}`} onClick={(e) => (e.stopPropagation(), props.onPlayPress?.())}>
          ▶
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

