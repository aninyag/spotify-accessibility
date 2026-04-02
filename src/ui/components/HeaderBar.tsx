import * as React from "react";
import { Icon, type IconName } from "./Icon";

export function HeaderBar(props: {
  title: string;
  left?: { kind: "icon"; label: string; onPress: () => void; icon?: IconName } | { kind: "avatar"; label: string };
  rightIcons?: Array<{ icon: IconName; label: string; onPress: () => void }>;
  onCommandPalette: () => void;
}) {
  return (
    <div className="header">
      {props.left ? (
        props.left.kind === "avatar" ? (
          <div className="headerAvatar" aria-label={props.left.label} />
        ) : (
          <button className="iconBtn" type="button" aria-label={props.left.label} onClick={props.left.onPress}>
            <Icon name={props.left.icon ?? "ring"} size={22} />
          </button>
        )
      ) : (
        <div aria-hidden="true" style={{ width: 48, height: 48 }} />
      )}
      <div className="headerTitle" role="heading" aria-level={1}>
        {props.title}
      </div>
      <div className="headerRight">
        {props.rightIcons?.map((it) => (
          <button key={it.label} type="button" className="iconBtn" aria-label={it.label} onClick={it.onPress}>
            <Icon name={it.icon} size={22} />
          </button>
        )) ?? null}
        <button
          type="button"
          className="iconBtn"
          aria-label="Open command palette"
          onClick={props.onCommandPalette}
          data-command-palette-trigger="true"
        >
          <Icon name="mic" size={22} />
        </button>
      </div>
    </div>
  );
}

