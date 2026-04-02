import * as React from "react";

/** Pointer + optional right-click → long-press (mobile-style) for web prototype. */
export function useLongPress(onLongPress: (() => void) | undefined, ms = 480) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = React.useRef(false);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = React.useCallback(() => {
    if (!onLongPress) return;
    longPressFiredRef.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress();
    }, ms);
  }, [onLongPress, ms, clearTimer]);

  const onPointerUp = React.useCallback(() => clearTimer(), [clearTimer]);

  const consumeLongPressClick = React.useCallback(() => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onPointerLeave: onPointerUp,
    consumeLongPressClick,
  };
}
