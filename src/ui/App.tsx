import * as React from "react";
import { BottomNavBar } from "./components/BottomNavBar";
import type { Landmark, RepeatMode, TabId, Track } from "./types";
import { mockNowPlaying, mockQueue, defaultLandmarks } from "./mockData";
import { speak } from "./tts";
import { NowScreen } from "./screens/NowScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { useLocalStorageState } from "./useLocalStorageState";
import { CommandPalette } from "./overlays/CommandPalette";
import { WhereAmIToast } from "./overlays/WhereAmIToast";
import { Icon } from "./components/Icon";
import { ContextMenuSheet } from "./overlays/ContextMenuSheet";

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
  const [tab, setTab] = React.useState<TabId>("home");
  const [nowPlayingOpen, setNowPlayingOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [whereAmIOpen, setWhereAmIOpen] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(false);
  const [contextItem, setContextItem] = React.useState<Landmark | null>(null);
  const [pinError, setPinError] = React.useState(false);
  const [recentActions, setRecentActions] = React.useState<string[]>([]);

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
      }
      if (e.key === "ArrowRight") {
        setTrack((prev) => {
          const idx = mockQueue.findIndex((t) => t.id === prev.id);
          const next = mockQueue[Math.min(mockQueue.length - 1, Math.max(0, idx + 1))] ?? prev;
          setCurrentTime(0);
          return next;
        });
      }
      if (e.key === "ArrowLeft") {
        setTrack((prev) => {
          const idx = mockQueue.findIndex((t) => t.id === prev.id);
          const next = mockQueue[Math.max(0, idx - 1)] ?? prev;
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
    setNowPlayingOpen(false);
  };

  const addLandmark = (lm: Landmark) => {
    setLandmarks((prev) => {
      setPinError(false);
      if (prev.some((x) => x.id === lm.id)) return prev;
      if (prev.length >= 6) {
        setPinError(true);
        speak("Remove a pinned item to add more", { enabled: ttsEnabled, rate: ttsRate, priority: "interrupt" });
        return prev;
      }
      const next = [...prev, lm];
      setRecentActions((a) => [`Pinned: ${lm.label}`, ...a].slice(0, 3));
      return next;
    });
  };

  const removeLandmark = (id: string) => {
    setLandmarks((prev) => {
      const removed = prev.find((x) => x.id === id);
      const next = prev.filter((x) => x.id !== id);
      if (removed) setRecentActions((a) => [`Unpinned: ${removed.label}`, ...a].slice(0, 3));
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
      setNowPlayingOpen(false);
      return;
    }
  };

  const whereAmIText = React.useMemo(() => {
    if (nowPlayingOpen) {
      return `Now screen. ${isPlaying ? "Playing" : "Paused"} "${track.title}" by ${track.artist}. ${Math.max(0, track.durationSec - currentTime)} seconds remaining. Queue has ${mockQueue.length} songs. Press Control K for commands.`;
    }
    if (tab === "search") return "Search screen. Press Control K for commands. Type to search.";
    if (tab === "library") return "Library screen. Viewing playlists. Press Control K for commands.";
    return "Home screen. Press Control K for commands.";
  }, [tab, nowPlayingOpen, isPlaying, track.title, track.artist, track.durationSec, currentTime]);

  React.useEffect(() => {
    if (!whereAmIOpen) return;
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

        <main
          className="screen"
          role="tabpanel"
          aria-label="Spotify content"
        >
          {nowPlayingOpen ? (
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
              }}
              onNext={() => {
                const idx = mockQueue.findIndex((t) => t.id === track.id);
                const next = mockQueue[Math.min(mockQueue.length - 1, Math.max(0, idx + 1))] ?? track;
                setTrack(next);
                setCurrentTime(0);
              }}
              onPrevious={() => {
                const idx = mockQueue.findIndex((t) => t.id === track.id);
                const prev = mockQueue[Math.max(0, idx - 1)] ?? track;
                setTrack(prev);
                setCurrentTime(0);
              }}
              onShuffleToggle={() => {
                setShuffle((s) => !s);
              }}
              onRepeatToggle={() => {
                const next: RepeatMode = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
                setRepeat(next);
              }}
              onSeek={(t) => {
                setCurrentTime(t);
              }}
              onCommandPalette={() => setCommandOpen(true)}
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
              tts={{ enabled: ttsEnabled, rate: ttsRate }}
              onAddLandmark={(lm) => {
                setContextItem(lm);
                setContextOpen(true);
              }}
            />
          ) : tab === "library" ? (
            <LibraryScreen
              onCommandPalette={() => setCommandOpen(true)}
              tts={{ enabled: ttsEnabled, rate: ttsRate }}
              onAddLandmark={(lm) => {
                setContextItem(lm);
                setContextOpen(true);
              }}
              landmarks={landmarks}
              onRemoveLandmark={removeLandmark}
            />
          ) : (
            <DiscoverScreen
              onCommandPalette={() => setCommandOpen(true)}
            />
          )}
        </main>

        <div className="miniPlayer" aria-label="Now playing mini bar">
          <div className="miniThumb" />
          <button
            type="button"
            style={{ border: "none", background: "transparent", textAlign: "left", padding: 0, minHeight: 0 }}
            aria-label={`Now playing ${track.title} by ${track.artist}`}
            onClick={() => setNowPlayingOpen(true)}
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
          recentActions={recentActions}
          onCommand={(cmd) => {
            // Keep it small for MVP; this grows into full spec.
            if (cmd.kind === "nav") onTabChange(cmd.tab);
            if (cmd.kind === "playPause") {
              setIsPlaying((p) => !p);
              setRecentActions((a) => [`${isPlaying ? "Paused" : "Played"}: ${track.title}`, ...a].slice(0, 3));
            }
            if (cmd.kind === "skip") {
              const idx = mockQueue.findIndex((t) => t.id === track.id);
              const next = mockQueue[Math.min(mockQueue.length - 1, Math.max(0, idx + 1))] ?? track;
              setTrack(next);
              setCurrentTime(0);
              setRecentActions((a) => [`Skipped: ${next.title}`, ...a].slice(0, 3));
            }
            if (cmd.kind === "addToQueue") {
              // MVP stub: no-op until queue mutation is implemented.
              setRecentActions((a) => [`Added to queue: ${track.title}`, ...a].slice(0, 3));
            }
            if (cmd.kind === "landmark") navigateToLandmark(cmd.landmark);
          }}
          tts={{ enabled: ttsEnabled, rate: ttsRate }}
        />

        <WhereAmIToast open={whereAmIOpen} text={whereAmIText} />

        <ContextMenuSheet
          open={contextOpen}
          onClose={() => setContextOpen(false)}
          ariaLabel="Context menu"
          items={
            contextItem
              ? [
                  {
                    key: "pin",
                    label: landmarks.some((x) => x.id === contextItem.id) ? "Unpin" : "Pin",
                    icon: <Icon name="pin" size={18} />,
                    onSelect: () => {
                      const already = landmarks.some((x) => x.id === contextItem.id);
                      if (already) removeLandmark(contextItem.id);
                      else addLandmark(contextItem);
                    },
                  },
                ]
              : []
          }
        />
      </div>
    </div>
  );
}

