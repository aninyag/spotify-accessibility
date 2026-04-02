import * as React from "react";
import { Icon } from "../components/Icon";
import { speak } from "../tts";

type Speed = "slow" | "normal" | "fast";

const speedOptions: Speed[] = ["slow", "normal", "fast"];

export function SettingsSheet(props: {
  open: boolean;
  onClose: () => void;
  settings: { voiceFeedback: boolean; voiceRate: Speed; announceSongChanges: boolean };
  onSettingsChange: (s: { voiceFeedback: boolean; voiceRate: Speed; announceSongChanges: boolean }) => void;
  tts: { enabled: boolean; rate: number };
}) {
  if (!props.open) return null;

  const toggle = (k: "voiceFeedback" | "announceSongChanges") => {
    const next = { ...props.settings, [k]: !props.settings[k] };
    props.onSettingsChange(next);
  };

  const cycleSpeed = () => {
    const idx = speedOptions.indexOf(props.settings.voiceRate);
    const next = speedOptions[(idx + 1) % speedOptions.length];
    props.onSettingsChange({ ...props.settings, voiceRate: next });
    speak(`Voice speed ${next}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
  };

  return (
    <div
      className="overlayBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div className="overlay" aria-label="Settings sheet">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Settings</div>
          <button type="button" aria-label="Close settings" onClick={props.onClose} className="iconBtn">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
          <ToggleRow
            label="Voice Feedback"
            value={props.settings.voiceFeedback}
            onChange={() => toggle("voiceFeedback")}
          />
          <ToggleRow
            label="Announce Song Changes"
            value={props.settings.announceSongChanges}
            onChange={() => toggle("announceSongChanges")}
          />

          <div className="row" role="group" aria-label="Voice speed">
            <div className="thumb" aria-hidden="true">
              <Icon name="speaker" size={18} />
            </div>
            <div>
              <div className="title">Voice Speed</div>
              <div className="subtitle">{props.settings.voiceRate}</div>
            </div>
            <button type="button" className="ghostBtn" aria-label="Change voice speed" onClick={cycleSpeed}>
              Change
            </button>
          </div>

          <div className="row" role="group" aria-label="High contrast mode (stub)">
            <div className="thumb" aria-hidden="true" />
            <div>
              <div className="title">High Contrast Mode</div>
              <div className="subtitle">Stub in prototype</div>
            </div>
            <button
              type="button"
              className="ghostBtn"
              aria-label="High contrast mode"
              onClick={() => speak("High contrast mode is a stub in this prototype.", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
            >
              <Icon name="chevronRight" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow(props: { label: string; value: boolean; onChange: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div style={{ fontWeight: 800 }}>{props.label}</div>
      <button
        type="button"
        role="switch"
        aria-checked={props.value}
        aria-label={`${props.label}, switch, ${props.value ? "on" : "off"}`}
        onClick={props.onChange}
        style={{ padding: 0 }}
      >
        <span className={`toggleSwitch ${props.value ? "toggleSwitchOn" : ""}`} aria-hidden="true">
          <span className="toggleThumb" />
        </span>
      </button>
    </div>
  );
}

