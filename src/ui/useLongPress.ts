import * as React from "react";

/**
 * Long-press for web + touch prototypes.
 * Uses pointer capture so small finger movement doesn’t cancel the gesture.
 * Do not cancel on pointerleave — that breaks touch when the finger shifts slightly.
 */
export function useLongPress(onLongPress: (() => void) | undefined, ms = 550) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = React.useRef(false);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!onLongPress) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const el = e.currentTarget;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      longPressFiredRef.current = false;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        longPressFiredRef.current = true;
        onLongPress();
      }, ms);
    },
    [onLongPress, ms, clearTimer],
  );

  const onPointerEnd = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      clearTimer();
      try {
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
    },
    [clearTimer],
  );

  const consumeLongPressClick = React.useCallback(() => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    onPointerDown,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
    consumeLongPressClick,
  };
}
