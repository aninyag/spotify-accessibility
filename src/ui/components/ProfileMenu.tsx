import * as React from "react";
import { Icon, type IconName } from "./Icon";
import { Toggle } from "./Toggle";

function ProfileMenuItem(props: {
  icon: IconName;
  label: string;
  badge?: string;
  dot?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="profileMenuItem" onClick={props.onClick}>
      <Icon name={props.icon} size={22} className="profileMenuItemIcon" />
      <span className="profileMenuItemLabel">{props.label}</span>
      {props.badge ? <span className="profileMenuItemBadge">{props.badge}</span> : null}
      {props.dot ? <span className="profileMenuItemDot" aria-hidden="true" /> : null}
    </button>
  );
}

export function ProfileMenu(props: {
  isOpen: boolean;
  onClose: () => void;
  axisEnabled: boolean;
  onAxisEnabledChange: (enabled: boolean) => void;
  /** Opens the Axis onboarding flow (e.g. when the home promo card is hidden). */
  onOpenAxisTutorial?: () => void;
  displayName?: string;
}) {
  if (!props.isOpen) return null;

  const name = props.displayName ?? "Listener";

  return (
    <>
      <div
        className="profileMenuBackdrop"
        role="button"
        tabIndex={0}
        aria-label="Close menu"
        onClick={props.onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            props.onClose();
          }
        }}
      />
      <div className="profileMenuPanel" role="dialog" aria-modal="true" aria-label="Profile menu">
        <div className="profileMenuHeader">
          <div className="profileMenuAvatar" aria-hidden="true" />
          <div className="profileMenuInfo">
            <div className="profileMenuName">{name}</div>
            <button type="button" className="profileMenuLink">
              View profile
            </button>
          </div>
          <button type="button" className="profileMenuActivity">
            Activity off
          </button>
        </div>

        <div className="profileMenuItems">
          <ProfileMenuItem icon="plusCircle" label="Add account" />
          <ProfileMenuItem icon="compass" label="Your Premium" badge="Individual" />
          <ProfileMenuItem icon="library" label="Listening stats" />
          <ProfileMenuItem icon="help" label="Recents" />
          <ProfileMenuItem icon="ring" label="Your Updates" dot />
          <ProfileMenuItem icon="speaker" label="Settings and privacy" />
        </div>

        <div className="profileMenuSection">
          {props.onOpenAxisTutorial ? (
            <ProfileMenuItem
              icon="sparkles"
              label="Axis introduction"
              onClick={() => {
                props.onOpenAxisTutorial?.();
                props.onClose();
              }}
            />
          ) : null}
        </div>

        <div className="profileMenuSection">
          <div className="axisToggleRow">
            <div className="axisToggleLeft">
              <Icon
                name={props.axisEnabled ? "eyeOff" : "eye"}
                size={22}
                className="axisToggleIcon"
              />
              <div className="axisToggleText">
                <div className="axisToggleLabel">Axis</div>
                <div className="axisToggleSublabel">Voice &amp; quick actions</div>
              </div>
            </div>
            <Toggle
              checked={props.axisEnabled}
              onChange={props.onAxisEnabledChange}
              aria-label="Enable Axis voice and quick actions"
            />
          </div>
        </div>

        <div className="profileMenuSection">
          <button type="button" className="profileMenuSectionHeaderBtn">
            <span>Messages</span>
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
