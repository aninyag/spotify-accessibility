import { Icon } from "./Icon";

export function HeaderBar(props: {
  title: string;
  left?: { label: string; onPress: () => void };
  right?: { label: string; onPress: () => void };
}) {
  return (
    <div className="header">
      {props.left ? (
        <button className="iconBtn" type="button" aria-label={props.left.label} onClick={props.left.onPress}>
          <Icon name="ring" size={22} />
        </button>
      ) : (
        <div aria-hidden="true" style={{ width: 48, height: 48 }} />
      )}
      <div className="headerTitle" role="heading" aria-level={1}>
        {props.title}
      </div>
      {props.right ? (
        <button className="iconBtn" type="button" aria-label={props.right.label} onClick={props.right.onPress}>
          <Icon name="overflow" size={22} />
        </button>
      ) : (
        <div aria-hidden="true" style={{ width: 48, height: 48 }} />
      )}
    </div>
  );
}

