import * as React from "react";
import { Icon } from "../components/Icon";

export function ContextMenuSheet(props: {
  open: boolean;
  onClose: () => void;
  items: Array<{ key: string; label: string; icon: React.ReactNode; onSelect: () => void }>;
  ariaLabel: string;
}) {
  if (!props.open) return null;

  const sheetRef = React.useRef<HTMLDivElement | null>(null);
  const doneBtnRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!props.open) return;
    const id = window.setTimeout(() => doneBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [props.open]);

  React.useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        props.onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const root = sheetRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props.open, props.onClose]);

  return (
    <div
      className="bottomSheetBackdrop bottomSheetBackdropElevated"
      role="dialog"
      aria-modal="true"
      aria-label={props.ariaLabel}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div
        ref={sheetRef}
        className="bottomSheet bottomSheetCompact"
        role="document"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="paletteTopBar">
          <div className="bottomSheetHandle" aria-hidden="true" />
          <button
            ref={doneBtnRef}
            type="button"
            className="paletteDoneBtn"
            onClick={() => props.onClose()}
            aria-label="Close menu"
          >
            Done
          </button>
        </div>
        <div style={{ display: "grid", gap: 2 }}>
          {props.items.map((it) => (
            <button
              key={it.key}
              type="button"
              className="spotifyRow"
              aria-label={it.label}
              onClick={() => {
                it.onSelect();
                props.onClose();
              }}
            >
              <div className="thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
                {it.icon}
              </div>
              <div>
                <div className="rowPrimary">{it.label}</div>
                <div className="rowSecondary" />
              </div>
              <div aria-hidden="true" style={{ width: 48, display: "grid", placeItems: "center", color: "#b3b3b3" }}>
                <Icon name="chevronRight" size={18} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
