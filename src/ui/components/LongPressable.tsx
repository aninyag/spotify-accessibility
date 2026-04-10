import * as React from "react";
import { useLongPress } from "../useLongPress";

export function LongPressable(props: {
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  style?: React.CSSProperties;
  role?: React.AriaRole;
  ariaLabel?: string;
}) {
  const lp = useLongPress(props.onLongPress);
  const isInteractive = Boolean(props.onClick || props.onLongPress);
  return (
    <div
      role={props.role}
      tabIndex={isInteractive ? 0 : undefined}
      className={props.className}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none", ...props.style } as React.CSSProperties}
      aria-label={props.ariaLabel}
      onClick={(e) => {
        if (lp.consumeLongPressClick()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        props.onClick?.();
      }}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        // If there is no regular click action, treat keyboard activation as the primary action.
        if (props.onClick) props.onClick();
        else props.onLongPress?.();
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
      {props.children}
    </div>
  );
}
