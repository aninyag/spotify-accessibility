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
  return (
    <div
      role={props.role}
      tabIndex={props.onClick || props.onLongPress ? 0 : undefined}
      className={props.className}
      style={props.style}
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
        if (!props.onClick) return;
        if (e.key === "Enter" || e.key === " ") props.onClick();
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
      {props.children}
    </div>
  );
}
