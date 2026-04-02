import * as React from "react";

const MOVE_THRESHOLD = 10;

/**
 * Reliable long-press for both mobile (touch) and desktop (mouse).
 *
 * Uses Touch Events as primary (mobile) and Mouse Events as fallback (desktop).
 * A 10px movement threshold distinguishes scroll from hold.
 * No Pointer Events / setPointerCapture — those are unreliable on mobile Safari.
 */
export function useLongPress(onLongPress: (() => void) | undefined, ms = 500) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = React.useRef(false);
  const startXY = React.useRef<{ x: number; y: number } | null>(null);
  const isTouchRef = React.useRef(false);

  const clear = React.useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const begin = React.useCallback(
    (x: number, y: number) => {
      if (!onLongPress) return;
      firedRef.current = false;
      startXY.current = { x, y };
      clear();
      timerRef.current = window.setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, ms);
    },
    [onLongPress, ms, clear],
  );

  const move = React.useCallback(
    (x: number, y: number) => {
      if (!startXY.current || timerRef.current == null) return;
      const dx = x - startXY.current.x;
      const dy = y - startXY.current.y;
      if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
        clear();
      }
    },
    [clear],
  );

  const end = React.useCallback(() => {
    clear();
    startXY.current = null;
  }, [clear]);

  const onTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      isTouchRef.current = true;
      const t = e.touches[0];
      begin(t.clientX, t.clientY);
    },
    [begin],
  );

  const onTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    },
    [move],
  );

  const onMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (isTouchRef.current) {
        isTouchRef.current = false;
        return;
      }
      if (e.button !== 0) return;
      begin(e.clientX, e.clientY);
    },
    [begin],
  );

  const onMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      move(e.clientX, e.clientY);
    },
    [move],
  );

  const onMouseUp = React.useCallback(() => {
    end();
  }, [end]);

  const consumeLongPressClick = React.useCallback(() => {
    if (firedRef.current) {
      firedRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd: end,
    onTouchCancel: end,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: end,
    consumeLongPressClick,
  };
}
