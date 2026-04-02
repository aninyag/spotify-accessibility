import { Icon, type IconName } from "./Icon";

export function HeaderBar(props: {
  title: string;
  left?: { kind: "icon"; label: string; onPress: () => void; icon?: IconName } | { kind: "avatar"; label: string };
  right?: { label: string; onPress: () => void; icon?: IconName };
}) {
  return (
    <div className="header">
      {props.left ? (
        props.left.kind === "avatar" ? (
          <div aria-label={props.left.label} style={{ width: 44, height: 44, borderRadius: 999, background: "rgba(255,255,255,0.14)" }} />
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
      {props.right ? (
        <button className="iconBtn" type="button" aria-label={props.right.label} onClick={props.right.onPress}>
          <Icon name={props.right.icon ?? "overflow"} size={22} />
        </button>
      ) : (
        <div aria-hidden="true" style={{ width: 48, height: 48 }} />
      )}
    </div>
  );
}

