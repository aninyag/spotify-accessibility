import * as React from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ListRow, trackAriaLabel } from "../components/ListRow";
import type { Track } from "../types";
import { speak } from "../tts";

const moods = ["Chill", "Focus", "Workout", "Happy", "Sad", "Party"] as const;

const mockSuggestion: Track = {
  id: "d1",
  title: "Blinding Lights",
  artist: "The Weeknd",
  album: "After Hours",
  durationSec: 200,
};

export function DiscoverScreen(props: { onCommandPalette: () => void; onWhereAmI: () => void; tts: { enabled: boolean; rate: number } }) {
  const [suggestion, setSuggestion] = React.useState<Track | null>(mockSuggestion);
  const [recent, setRecent] = React.useState<Track[]>([
    { id: "r1", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", durationSec: 225 },
    { id: "r2", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", durationSec: 324 },
  ]);

  const playSomethingNew = () => {
    setSuggestion(mockSuggestion);
    speak(
      `Here's something you might like: ${mockSuggestion.title} by ${mockSuggestion.artist}. Because you liked Don't Start Now.`,
      { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" },
    );
  };

  return (
    <>
      <HeaderBar title="Discover" left={{ label: "Where am I", onPress: props.onWhereAmI }} right={{ label: "Open command palette", onPress: props.onCommandPalette }} />

      <button type="button" className="cta" aria-label="Play Something New" onClick={playSomethingNew}>
        ▶ Play Something New
      </button>

      <section className="card" aria-label="Current suggestion">
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Current Suggestion</div>
        {suggestion ? (
          <>
            <ListRow
              title={suggestion.title}
              subtitle={`${suggestion.artist} · ${suggestion.album ?? ""}`}
              ariaLabel={trackAriaLabel(suggestion)}
              onPress={() => speak(`Opening ${suggestion.title}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
              onPlayPress={() => {
                speak(`Playing ${suggestion.title} by ${suggestion.artist}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" });
                setRecent((prev) => [suggestion, ...prev.filter((t) => t.id !== suggestion.id)].slice(0, 5));
              }}
            />
            <div className="muted" style={{ fontSize: 14, marginTop: 10 }}>
              Because you liked “Don’t Start Now”
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 12 }}>
              <button type="button" aria-label="Dislike. Less like this." onClick={() => speak("Got it. Less like this.", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}>
                👎
              </button>
              <button type="button" aria-label="Like. More like this." onClick={() => speak("Great. More like this.", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}>
                👍
              </button>
              <button type="button" aria-label="Save to Liked Songs" onClick={() => speak("Saved to Liked Songs.", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}>
                +Save
              </button>
              <button type="button" aria-label="Play suggestion" onClick={() => speak("Playing.", { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}>
                ▶Play
              </button>
            </div>
          </>
        ) : (
          <div className="muted">Tap “Play Something New” to get a recommendation.</div>
        )}
      </section>

      <section className="card" aria-label="Quick moods">
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Quick Moods</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {moods.map((m) => (
            <button
              key={m}
              type="button"
              aria-label={`${m} mood`}
              onClick={() => speak(`Finding ${m} music for you.`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
              style={{ minHeight: 56 }}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      <section className="card" aria-label="Recently discovered">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontWeight: 900 }}>Recently Discovered</div>
          <button type="button" aria-label="All recently discovered">
            All
          </button>
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {recent.map((t) => (
            <ListRow
              key={t.id}
              title={t.title}
              subtitle={t.artist}
              ariaLabel={trackAriaLabel(t)}
              onPress={() => speak(`Playing ${t.title} by ${t.artist}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
              onPlayPress={() => speak(`Playing ${t.title}`, { enabled: props.tts.enabled, rate: props.tts.rate, priority: "interrupt" })}
            />
          ))}
        </div>
      </section>
    </>
  );
}

