import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import type { Landmark } from "../types";
import { speak } from "../tts";
import { Icon } from "../components/Icon";

const speedOptions = ["slow", "normal", "fast"] as const;
type Speed = (typeof speedOptions)[number];

export function SupportScreen(props: {
  settings: {
    voiceFeedback: boolean;
    voiceRate: Speed;
    announceSongChanges: boolean;
  };
  onSettingsChange: (s: { voiceFeedback: boolean; voiceRate: Speed; announceSongChanges: boolean }) => void;
  landmarks: Landmark[];
  onRemoveLandmark: (id: string) => void;
  onCommandPalette: () => void;
  onWhereAmI: () => void;
}) {
  const ttsEnabled = props.settings.voiceFeedback;
  const rate = props.settings.voiceRate === "slow" ? 0.9 : props.settings.voiceRate === "fast" ? 1.25 : 1.05;

  return (
    <>
      <div className="headerGradient">
        <HeaderBar title="Help & Settings" left={{ label: "Where am I", onPress: props.onWhereAmI }} right={{ label: "Open command palette", onPress: props.onCommandPalette }} />
      </div>
      <div className="screenInner">
        <button
          type="button"
          className="cta"
          aria-label="Help Me"
          onClick={() => speak("Help. Choose a common question below, or open the command palette.", { enabled: ttsEnabled, rate, priority: "interrupt" })}
          style={{ background: "#3E3E3E", color: "white", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <Icon name="help" size={18} /> Help Me
        </button>

        <section aria-label="Common questions">
          <div className="sectionTitle" style={{ margin: 0, fontSize: 19 }}>Common Questions</div>
          <Accordion
            title="How do I add a song to a playlist?"
            body="Open the Command Palette (Control K). Type 'add to [playlist]'. In the prototype, this is stubbed."
            tts={{ enabled: ttsEnabled, rate }}
          />
          <Accordion title="How do I find my downloads?" body="In prototype, downloads are not implemented." tts={{ enabled: ttsEnabled, rate }} />
          <Accordion title="How do I use voice commands?" body="Press Control K to open commands, then type. Voice input is a stub in prototype." tts={{ enabled: ttsEnabled, rate }} />
          <Accordion title="How do I create a landmark?" body="Right-click an item in Search/Library to add as a landmark." tts={{ enabled: ttsEnabled, rate }} />
          <Accordion title="How do I contact Spotify support?" body="This prototype doesn’t connect to Spotify support yet." tts={{ enabled: ttsEnabled, rate }} />
        </section>

        <section aria-label="Settings">
          <div className="sectionTitle" style={{ margin: 0, fontSize: 19 }}>Settings</div>

        <ToggleRow
          label="Voice Feedback"
          value={props.settings.voiceFeedback}
          onChange={(v) => props.onSettingsChange({ ...props.settings, voiceFeedback: v })}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 10 }}>
          <div>
            <div style={{ fontWeight: 800 }}>Voice Speed</div>
            <div className="muted" style={{ fontSize: 14 }}>
              {props.settings.voiceRate}
            </div>
          </div>
          <button
            type="button"
            className="ghostBtn"
            aria-label={`Voice speed, ${props.settings.voiceRate}, popup button`}
            onClick={() => {
              const idx = speedOptions.indexOf(props.settings.voiceRate);
              const next = speedOptions[(idx + 1) % speedOptions.length];
              props.onSettingsChange({ ...props.settings, voiceRate: next });
              speak(`Voice speed ${next}`, { enabled: ttsEnabled, rate, priority: "interrupt" });
            }}
          >
            Change ▼
          </button>
        </div>

        <ToggleRow
          label="Announce Song Changes"
          value={props.settings.announceSongChanges}
          onChange={(v) => props.onSettingsChange({ ...props.settings, announceSongChanges: v })}
        />

        <ToggleRow
          label="High Contrast Mode"
          value={false}
          onChange={() => speak("High contrast mode is a stub in this prototype.", { enabled: ttsEnabled, rate, priority: "interrupt" })}
        />
        </section>

        <section aria-label="Manage landmarks">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="sectionTitle" style={{ margin: 0, fontSize: 19 }}>Manage Landmarks</div>
            <div className="muted">{props.landmarks.length} / 6</div>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {props.landmarks.length === 0 ? (
              <div className="muted">No landmarks yet.</div>
            ) : (
              props.landmarks.map((lm, idx) => (
                <div key={lm.id} className="row" role="group" aria-label={`Landmark ${idx + 1}: ${lm.label}`}>
                  <div className="thumb" aria-hidden="true">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="title">{lm.label}</div>
                    <div className="subtitle">{lm.type}</div>
                  </div>
                  <button type="button" className="ghostBtn" aria-label={`Remove ${lm.label}`} onClick={() => props.onRemoveLandmark(lm.id)}>
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function ToggleRow(props: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 10 }}>
      <div style={{ fontWeight: 800 }}>{props.label}</div>
      <button
        type="button"
        role="switch"
        aria-checked={props.value}
        aria-label={`${props.label}, switch, ${props.value ? "on" : "off"}`}
        onClick={() => props.onChange(!props.value)}
        style={{ padding: 0 }}
      >
        <span className={`toggleSwitch ${props.value ? "toggleSwitchOn" : ""}`} aria-hidden="true">
          <span className="toggleThumb" />
        </span>
      </button>
    </div>
  );
}

function Accordion(props: { title: string; body: string; tts: { enabled: boolean; rate: number } }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ marginTop: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={props.title}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) speak(props.body, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
        }}
        style={{
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          minHeight: 44,
          color: "white",
          fontWeight: 700,
        }}
      >
        <span>{props.title}</span>
        <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.7)" }}>
          <Icon name="chevronRight" size={18} />
        </span>
      </button>
      {open ? (
        <div className="muted" style={{ padding: "10px 6px 0", fontSize: 14 }}>
          {props.body}
        </div>
      ) : null}
    </div>
  );
}

