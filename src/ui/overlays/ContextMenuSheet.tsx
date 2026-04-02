import * as React from "react";
import { Icon } from "../components/Icon";

export function ContextMenuSheet(props: {
  open: boolean;
  onClose: () => void;
  items: Array<{ key: string; label: string; icon: React.ReactNode; onSelect: () => void }>;
  ariaLabel: string;
}) {
  if (!props.open) return null;

  return (
    <div
      className="bottomSheetBackdrop bottomSheetBackdropElevated"
      role="dialog"
      aria-modal="true"
      aria-label={props.ariaLabel}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div className="bottomSheet" role="document">
        <div className="bottomSheetHandle" aria-hidden="true" />
        <div style={{ display: "grid", gap: 2 }}>
          {props.items.map((it) => (
            <button
              key={it.key}
              type="button"
              className="spotifyRow"
              role="button"
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

