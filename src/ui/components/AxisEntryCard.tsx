import * as React from "react";
import { Icon } from "./Icon";

export function AxisEntryCard(props: { onStartTutorial: () => void; onDismiss?: () => void }) {
  return (
    <div className="axisEntryCard">
      {props.onDismiss ? (
        <button
          type="button"
          className="axisEntryDismiss"
          onClick={props.onDismiss}
          aria-label="Dismiss Axis announcement"
        >
          <Icon name="close" size={20} />
        </button>
      ) : null}

      <div className="axisEntryIcon" aria-hidden="true">
        <Icon name="sparkles" size={28} />
      </div>

      <div className="axisEntryContent">
        <div className="axisEntryLabel">New</div>
        <h3 className="axisEntryTitle">Introducing Axis</h3>
        <p className="axisEntryDescription">
          Voice commands, quick actions, and streamlined navigation — designed for the way you listen.
        </p>
      </div>

      <button type="button" className="axisEntryCTA" onClick={props.onStartTutorial}>
        Try it out
      </button>
    </div>
  );
}
