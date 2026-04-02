import * as React from "react";

export function Toggle(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props["aria-label"]}
      className={`axisToggle ${props.checked ? "axisToggleOn" : "axisToggleOff"}`}
      onClick={() => props.onChange(!props.checked)}
    >
      <span className="axisToggleThumb" aria-hidden="true" />
    </button>
  );
}
