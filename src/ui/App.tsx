import * as React from "react";
import { BottomNavBar } from "./components/BottomNavBar";
import type { Landmark, RepeatMode, TabId, Track } from "./types";
import { mockNowPlaying, mockQueue, defaultLandmarks } from "./mockData";
import { speak } from "./tts";
import { NowScreen } from "./screens/NowScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { SupportScreen } from "./screens/SupportScreen";
import { useLocalStorageState } from "./useLocalStorageState";
import { CommandPalette } from "./overlays/CommandPalette";
import { WhereAmIToast } from "./overlays/WhereAmIToast";
import { Icon } from "./components/Icon";

type Settings = {
  voiceFeedback: boolean;
  voiceRate: "slow" | "normal" | "fast";
  announceSongChanges: boolean;
};

function rateToNumber(r: Settings["voiceRate"]) {
  if (r === "slow") return 0.9;
  if (r === "fast") return 1.25;
  return 1.05;
}

export function App() {
  const [tab, setTab] = React.useState<TabId>("discover");
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [whereAmIOpen, setWhereAmIOpen] = React.useState(false);

  const [settings, setSettings] = useLocalStorageState<Settings>("sa.settings", {
    voiceFeedback: true,
    voiceRate: "normal",
    announceSongChanges: true,
  });

  const [landmarks, setLandmarks] = useLocalStorageState<Landmark[]>("sa.landmarks", defaultLandmarks);

  // Playback state (mocked for MVP).
  const [track, setTrack] = React.useState<Track>(mockNowPlaying);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState<RepeatMode>("off");
  const [currentTime, setCurrentTime] = React.useState(0);

  const ttsEnabled = settings.voiceFeedback;
  const ttsRate = rateToNumber(settings.voiceRate);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        setWhereAmIOpen(true);
        return;
      }
      if (e.key === " ") {
        // Space toggles play/pause when nothing else is focused.
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || (active as HTMLElement).isContentEditable)) return;
        e.preventDefault();
        setIsPlaying((p) => !p);
        speak(isPlaying ? "Paused" : "Playing", { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
      }
      if (e.key === "ArrowRight") {
        setTrack((prev) => {
          const idx = mockQueue.findIndex((t) => t.id === prev.id);
          const next = mockQueue[Math.min(mockQueue.length - 1, Math.max(0, idx + 1))] ?? prev;
          speak(`Next: ${next.title} by ${next.artist}`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
          setCurrentTime(0);
          return next;
        });
      }
      if (e.key === "ArrowLeft") {
        setTrack((prev) => {
          const idx = mockQueue.findIndex((t) => t.id === prev.id);
          const next = mockQueue[Math.max(0, idx - 1)] ?? prev;
          speak(`Previous: ${next.title} by ${next.artist}`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
          setCurrentTime(0);
          return next;
        });
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlaying, ttsEnabled, ttsRate]);

  // Simulate playback timer.
  React.useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setCurrentTime((t) => {
        if (t + 1 >= track.durationSec) return track.durationSec;
        return t + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, track.durationSec]);

  const onTabChange = (t: TabId) => {
    setTab(t);
  };

  const addLandmark = (lm: Landmark) => {
    setLandmarks((prev) => {
      const next = prev.some((x) => x.id === lm.id) ? prev : [...prev, lm].slice(0, 6);
      speak(`${lm.label} added to landmarks.`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
      return next;
    });
  };

  const removeLandmark = (id: string) => {
    setLandmarks((prev) => {
      const removed = prev.find((x) => x.id === id);
      const next = prev.filter((x) => x.id !== id);
      if (removed) speak(`${removed.label} removed from landmarks.`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
      return next;
    });
  };

  const navigateToLandmark = (lm: Landmark) => {
    if (lm.payload.kind === "screen") {
      onTabChange(lm.payload.tab);
      return;
    }
    if (lm.payload.kind === "search") {
      setTab("search");
      speak(`Search ${lm.payload.query}`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
      return;
    }
    speak(`Opening ${lm.label}`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
  };

  const whereAmIText = React.useMemo(() => {
    if (tab === "now") {
      return `Now screen. ${isPlaying ? "Playing" : "Paused"} "${track.title}" by ${track.artist}. ${Math.max(0, track.durationSec - currentTime)} seconds remaining. Queue has ${mockQueue.length} songs. Press Control K for commands.`;
    }
    if (tab === "search") return "Search screen. Press Control K for commands. Type to search.";
    if (tab === "library") return "Library screen. Viewing playlists. Press Control K for commands.";
    if (tab === "discover") return "Discover screen. Press Control K for commands.";
    return "Support screen. Manage settings and landmarks. Press Control K for commands.";
  }, [tab, isPlaying, track.title, track.artist, track.durationSec, currentTime]);

  React.useEffect(() => {
    if (!whereAmIOpen) return;
    speak(whereAmIText, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
    const id = window.setTimeout(() => setWhereAmIOpen(false), 4500);
    return () => window.clearTimeout(id);
  }, [whereAmIOpen, whereAmIText, ttsEnabled, ttsRate]);

  return (
    <div className="appShell">
      <div className="app">
        <div className="statusBar" aria-hidden="true">
          <div className="statusTime">1:20</div>
          <div className="statusRight">
            <div className="statusDot" />
            <div className="statusDot" />
            <div className="statusBattery" />
          </div>
        </div>

        <main className="screen" role="tabpanel" aria-label="Spotify content">
          {tab === "now" ? (
            <NowScreen
              track={track}
              isPlaying={isPlaying}
              shuffleEnabled={shuffle}
              repeatMode={repeat}
              currentTimeSec={currentTime}
              queue={mockQueue}
              landmarks={landmarks}
              onTogglePlay={() => {
                setIsPlaying((p) => !p);
                speak(isPlaying ? "Paused" : "Playing", { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
              }}
              onNext={() => {
                const idx = mockQueue.findIndex((t) => t.id === track.id);
                const next = mockQueue[Math.min(mockQueue.length - 1, Math.max(0, idx + 1))] ?? track;
                setTrack(next);
                setCurrentTime(0);
                speak(`Next: ${next.title} by ${next.artist}`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
              }}
              onPrevious={() => {
                const idx = mockQueue.findIndex((t) => t.id === track.id);
                const prev = mockQueue[Math.max(0, idx - 1)] ?? track;
                setTrack(prev);
                setCurrentTime(0);
                speak(`Previous: ${prev.title} by ${prev.artist}`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
              }}
              onShuffleToggle={() => {
                setShuffle((s) => !s);
                speak(!shuffle ? "Shuffle on" : "Shuffle off", { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
              }}
              onRepeatToggle={() => {
                const next: RepeatMode = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
                setRepeat(next);
                speak(next === "all" ? "Repeat all" : next === "one" ? "Repeat one" : "Repeat off", {
                  enabled: ttsEnabled,
                  rate: ttsRate,
                  priority: "interrupt",
                });
              }}
              onSeek={(t) => {
                setCurrentTime(t);
                speak(`Seek ${Math.floor(t / 60)} minutes ${Math.floor(t % 60)} seconds`, { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
              }}
              onCommandPalette={() => setCommandOpen(true)}
              onWhereAmI={() => setWhereAmIOpen(true)}
              onLandmarkPress={navigateToLandmark}
              onLandmarkRemove={(id) => removeLandmark(id)}
              onAddLandmark={() =>
                addLandmark({
                  id: `lm-${Date.now()}`,
                  label: `${track.title}`,
                  type: "album",
                  payload: { kind: "stub", ref: `track:${track.id}` },
                })
              }
            />
          ) : tab === "search" ? (
            <SearchScreen
              onCommandPalette={() => setCommandOpen(true)}
              onWhereAmI={() => setWhereAmIOpen(true)}
              tts={{ enabled: ttsEnabled, rate: ttsRate }}
              onAddLandmark={addLandmark}
            />
          ) : tab === "library" ? (
            <LibraryScreen onCommandPalette={() => setCommandOpen(true)} onWhereAmI={() => setWhereAmIOpen(true)} tts={{ enabled: ttsEnabled, rate: ttsRate }} onAddLandmark={addLandmark} />
          ) : tab === "discover" ? (
            <DiscoverScreen onCommandPalette={() => setCommandOpen(true)} onWhereAmI={() => setWhereAmIOpen(true)} tts={{ enabled: ttsEnabled, rate: ttsRate }} />
          ) : (
            <SupportScreen
              settings={settings}
              onSettingsChange={setSettings}
              landmarks={landmarks}
              onRemoveLandmark={removeLandmark}
              onCommandPalette={() => setCommandOpen(true)}
              onWhereAmI={() => setWhereAmIOpen(true)}
            />
          )}
        </main>

        <div className="miniPlayer" aria-label="Now playing mini bar">
          <div className="miniThumb" />
          <button
            type="button"
            style={{ border: "none", background: "transparent", textAlign: "left", padding: 0, minHeight: 0 }}
            aria-label={`Now playing ${track.title} by ${track.artist}`}
            onClick={() => onTabChange("now")}
          >
            <div className="miniTitle">{track.title}</div>
            <div className="miniMeta">BEATSPILL+</div>
          </button>
          <div className="miniControls">
            <button className="miniIcon" type="button" aria-label={isPlaying ? "Pause" : "Play"} onClick={() => setIsPlaying((p) => !p)}>
              <span style={{ color: "var(--spotify-green)" }}>
                <Icon name={isPlaying ? "pause" : "play"} size={18} />
              </span>
            </button>
            <button className="miniIcon" type="button" aria-label="Next" onClick={() => {
              const idx = mockQueue.findIndex((t) => t.id === track.id);
              const next = mockQueue[Math.min(mockQueue.length - 1, Math.max(0, idx + 1))] ?? track;
              setTrack(next);
              setCurrentTime(0);
            }}>
              <Icon name="next" size={18} />
            </button>
          </div>
        </div>
        <div className="miniProgress" aria-hidden="true">
          <div className="miniProgressFill" style={{ width: `${Math.min(100, (currentTime / Math.max(1, track.durationSec)) * 100)}%` }} />
        </div>

        <BottomNavBar currentTab={tab} onTabChange={onTabChange} />

        <CommandPalette
          open={commandOpen}
          onClose={() => setCommandOpen(false)}
          context={{ tab, track, isPlaying }}
          landmarks={landmarks}
          onCommand={(cmd) => {
            // Keep it small for MVP; this grows into full spec.
            if (cmd.kind === "nav") onTabChange(cmd.tab);
            if (cmd.kind === "playPause") {
              setIsPlaying((p) => !p);
              speak(isPlaying ? "Paused" : "Playing", { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
            }
            if (cmd.kind === "whereAmI") setWhereAmIOpen(true);
            if (cmd.kind === "landmark") navigateToLandmark(cmd.landmark);
          }}
          tts={{ enabled: ttsEnabled, rate: ttsRate }}
        />

        <WhereAmIToast open={whereAmIOpen} text={whereAmIText} />
      </div>
    </div>
  );
}

