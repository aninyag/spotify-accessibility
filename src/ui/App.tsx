import * as React from "react";
import { BottomNavBar } from "./components/BottomNavBar";
import type { ContextTarget, Landmark, RepeatMode, TabId, Track } from "./types";
import { mockNowPlaying, mockQueue, defaultLandmarks } from "./mockData";
import { NowScreen } from "./screens/NowScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { useLocalStorageState } from "./useLocalStorageState";
import { CommandPalette, type Command } from "./overlays/CommandPalette";
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
  const [contextTarget, setContextTarget] = React.useState<ContextTarget | null>(null);
  const [pinError, setPinError] = React.useState(false);
  const [recentActions, setRecentActions] = React.useState<string[]>([]);
  const [queue, setQueue] = React.useState<Track[]>(() => mockQueue.map((t) => ({ ...t })));
  const [likedTrackIds, setLikedTrackIds] = React.useState<string[]>([]);
  const [pinnedFlashId, setPinnedFlashId] = React.useState<string | null>(null);

  const [settings, setSettings] = useLocalStorageState<Settings>("sa.settings", {
    voiceFeedback: true,
    voiceRate: "normal",
    announceSongChanges: true,
  });

  const [landmarks, setLandmarks] = useLocalStorageState<Landmark[]>("sa.landmarks", defaultLandmarks);
  const [paletteHintSeen, setPaletteHintSeen] = useLocalStorageState<boolean>("sa.paletteHintSeen", false);

  const [track, setTrack] = React.useState<Track>(mockNowPlaying);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState<RepeatMode>("off");
  const [currentTime, setCurrentTime] = React.useState(0);

  const ttsEnabled = settings.voiceFeedback;
  const ttsRate = rateToNumber(settings.voiceRate);

  const openContext = React.useCallback((target: ContextTarget) => {
    setContextTarget(target);
    setContextOpen(true);
  }, []);

  const closeContext = React.useCallback(() => {
    setContextOpen(false);
    setContextTarget(null);
  }, []);

  const addToQueue = React.useCallback((t: Track) => {
    const instance: Track = { ...t, id: `${t.id}-q-${Date.now()}` };
    setQueue((q) => [...q, instance]);
    setRecentActions((a) => [`Added to queue: ${t.title}`, ...a].slice(0, 3));
  }, []);

  const addLandmark = React.useCallback((lm: Landmark) => {
    setLandmarks((prev) => {
      setPinError(false);
      if (prev.some((x) => x.id === lm.id)) return prev;
      if (prev.length >= 6) {
        setPinError(true);
        return prev;
      }
      window.setTimeout(() => {
        setPinnedFlashId(lm.id);
        window.setTimeout(() => setPinnedFlashId(null), 1800);
      }, 0);
      const next = [...prev, lm];
      setRecentActions((a) => [`Pinned: ${lm.label}`, ...a].slice(0, 3));
      return next;
    });
  }, [setLandmarks]);

  const removeLandmark = React.useCallback(
    (id: string) => {
      setLandmarks((prev) => {
        const removed = prev.find((x) => x.id === id);
        const next = prev.filter((x) => x.id !== id);
        if (removed) setRecentActions((a) => [`Unpinned: ${removed.label}`, ...a].slice(0, 3));
        return next;
      });
    },
    [setLandmarks],
  );

  const toggleLike = React.useCallback((trackId: string, title: string) => {
    let msg = "";
    setLikedTrackIds((prev) => {
      const has = prev.includes(trackId);
      msg = `${has ? "Removed like" : "Liked"}: ${title}`;
      return has ? prev.filter((x) => x !== trackId) : [...prev, trackId];
    });
    setRecentActions((a) => [msg, ...a].slice(0, 3));
  }, []);

  React.useEffect(() => {
    if (!pinError) return;
    const id = window.setTimeout(() => setPinError(false), 5000);
    return () => window.clearTimeout(id);
  }, [pinError]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        setWhereAmIOpen(true);
        return;
      }
      if (e.key === " ") {
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || (active as HTMLElement).isContentEditable)) return;
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      if (e.key === "ArrowRight") {
        setTrack((prev) => {
          const idx = queue.findIndex((t) => t.id === prev.id);
          const next = queue[Math.min(queue.length - 1, Math.max(0, idx + 1))] ?? prev;
          setCurrentTime(0);
          return next;
        });
      }
      if (e.key === "ArrowLeft") {
        setTrack((prev) => {
          const idx = queue.findIndex((t) => t.id === prev.id);
          const next = queue[Math.max(0, idx - 1)] ?? prev;
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
  }, [queue]);

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
      return `Now screen. ${isPlaying ? "Playing" : "Paused"} "${track.title}" by ${track.artist}. ${Math.max(0, track.durationSec - currentTime)} seconds remaining. Queue has ${queue.length} songs.`;
    }
    if (tab === "search") return "Search screen. Type to search.";
    if (tab === "library") return "Library screen. Viewing playlists.";
    return "Home screen.";
  }, [tab, nowPlayingOpen, isPlaying, track.title, track.artist, track.durationSec, currentTime, queue.length]);

  React.useEffect(() => {
    if (!whereAmIOpen) return;
    const id = window.setTimeout(() => setWhereAmIOpen(false), 4500);
    return () => window.clearTimeout(id);
  }, [whereAmIOpen, whereAmIText, ttsEnabled, ttsRate]);

  const goToArtistFromContext = React.useCallback(
    (name: string) => {
      setTab("search");
      setNowPlayingOpen(false);
      setRecentActions((a) => [`Go to artist: ${name}`, ...a].slice(0, 3));
    },
    [],
  );

  const contextMenuItems = React.useMemo(() => {
    if (!contextTarget) return [];
    const lm = contextTarget.landmark;
    const isPinned = landmarks.some((x) => x.id === lm.id);

    return [
      {
        key: "pin",
        label: isPinned ? "Unpin" : "Pin",
        icon: <Icon name="pin" size={18} />,
        onSelect: () => {
          if (isPinned) removeLandmark(lm.id);
          else addLandmark(lm);
        },
      },
      {
        key: "queue",
        label: "Add to queue",
        icon: <Icon name="plus" size={18} />,
        onSelect: () => {
          const t =
            contextTarget.queueTrack ??
            ({
              id: `row-${lm.id}`,
              title: lm.label,
              artist: contextTarget.artistName ?? "Spotify",
              durationSec: 200,
            } satisfies Track);
          addToQueue(t);
        },
      },
      {
        key: "playlist",
        label: "Add to playlist",
        icon: <Icon name="plusCircle" size={18} />,
        onSelect: () => {
          setRecentActions((a) => [`Added to playlist: ${lm.label}`, ...a].slice(0, 3));
        },
      },
      {
        key: "artist",
        label: "Go to artist",
        icon: <Icon name="search" size={18} />,
        onSelect: () => {
          const name = contextTarget.artistName ?? lm.label;
          goToArtistFromContext(name);
        },
      },
      {
        key: "share",
        label: "Share",
        icon: <Icon name="share" size={18} />,
        onSelect: () => {
          setRecentActions((a) => [`Shared: ${lm.label}`, ...a].slice(0, 3));
        },
      },
    ];
  }, [contextTarget, landmarks, addLandmark, removeLandmark, addToQueue, goToArtistFromContext]);

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
          {pinError ? (
            <div className="pinErrorBanner" role="alert">
              Maximum 6 pinned items. Unpin one in the menu to add another.
            </div>
          ) : null}
          {nowPlayingOpen ? (
            <NowScreen
              track={track}
              isPlaying={isPlaying}
              shuffleEnabled={shuffle}
              repeatMode={repeat}
              currentTimeSec={currentTime}
              queue={queue}
              landmarks={landmarks}
              trackLiked={likedTrackIds.includes(track.id)}
              onToggleLike={() => toggleLike(track.id, track.title)}
              onBack={() => setNowPlayingOpen(false)}
              onTogglePlay={() => {
                setIsPlaying((p) => !p);
              }}
              onNext={() => {
                const idx = queue.findIndex((t) => t.id === track.id);
                const next = queue[Math.min(queue.length - 1, Math.max(0, idx + 1))] ?? track;
                setTrack(next);
                setCurrentTime(0);
              }}
              onPrevious={() => {
                const idx = queue.findIndex((t) => t.id === track.id);
                const prev = queue[Math.max(0, idx - 1)] ?? track;
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
              onOpenContext={openContext}
            />
          ) : tab === "search" ? (
            <SearchScreen onCommandPalette={() => setCommandOpen(true)} onOpenContext={openContext} />
          ) : tab === "library" ? (
            <LibraryScreen
              onCommandPalette={() => setCommandOpen(true)}
              landmarks={landmarks}
              onOpenContext={openContext}
              onLandmarkPress={navigateToLandmark}
              pinnedFlashId={pinnedFlashId}
            />
          ) : (
            <DiscoverScreen onCommandPalette={() => setCommandOpen(true)} onOpenContext={openContext} />
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
            <div className="miniMeta">Now playing</div>
          </button>
          <div className="miniControls">
            <button className="miniIcon" type="button" aria-label={isPlaying ? "Pause" : "Play"} onClick={() => setIsPlaying((p) => !p)}>
              <span style={{ color: "var(--spotify-green)" }}>
                <Icon name={isPlaying ? "pause" : "play"} size={18} />
              </span>
            </button>
            <button
              className="miniIcon"
              type="button"
              aria-label="Next"
              onClick={() => {
                const idx = queue.findIndex((t) => t.id === track.id);
                const next = queue[Math.min(queue.length - 1, Math.max(0, idx + 1))] ?? track;
                setTrack(next);
                setCurrentTime(0);
              }}
            >
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
          context={{ tab, track, isPlaying, trackLiked: likedTrackIds.includes(track.id) }}
          landmarks={landmarks}
          recentActions={recentActions}
          pinnedFlashId={pinnedFlashId}
          paletteHintSeen={paletteHintSeen}
          onPaletteHintDismiss={() => setPaletteHintSeen(true)}
          onPinnedLongPress={(lm) => {
            openContext({ landmark: lm });
          }}
          onOpenContext={openContext}
          onCommand={(cmd: Command) => {
            if (cmd.kind === "nav") onTabChange(cmd.tab);
            if (cmd.kind === "playPause") {
              setIsPlaying((p) => !p);
              setRecentActions((a) => [`${isPlaying ? "Paused" : "Played"}: ${track.title}`, ...a].slice(0, 3));
            }
            if (cmd.kind === "skip") {
              const idx = queue.findIndex((t) => t.id === track.id);
              const next = queue[Math.min(queue.length - 1, Math.max(0, idx + 1))] ?? track;
              setTrack(next);
              setCurrentTime(0);
              setRecentActions((a) => [`Skipped: ${next.title}`, ...a].slice(0, 3));
            }
            if (cmd.kind === "addToQueue") {
              addToQueue(track);
            }
            if (cmd.kind === "like") {
              toggleLike(track.id, track.title);
            }
            if (cmd.kind === "landmark") navigateToLandmark(cmd.landmark);
            if (cmd.kind === "playPaletteResult") {
              setTrack(cmd.hit.playTrack);
              setIsPlaying(true);
              setCurrentTime(0);
              setRecentActions((a) => [`Now playing: ${cmd.hit.title}`, ...a].slice(0, 3));
            }
            if (cmd.kind === "playLikedSongs") {
              const liked = queue.find((t) => likedTrackIds.includes(t.id));
              if (liked) {
                setTrack(liked);
                setIsPlaying(true);
                setCurrentTime(0);
              } else {
                setTab("library");
                setNowPlayingOpen(false);
                if (queue[0]) {
                  setTrack(queue[0]);
                  setIsPlaying(true);
                  setCurrentTime(0);
                }
              }
              setRecentActions((a) => [`Playing liked songs`, ...a].slice(0, 3));
            }
            if (cmd.kind === "resumeLast") {
              setIsPlaying(true);
              setRecentActions((a) => [`Resumed: ${track.title}`, ...a].slice(0, 3));
            }
            if (cmd.kind === "goToArtist") {
              goToArtistFromContext(track.artist);
            }
          }}
          tts={{ enabled: ttsEnabled, rate: ttsRate }}
        />

        <WhereAmIToast open={whereAmIOpen} text={whereAmIText} />

        <ContextMenuSheet
          open={contextOpen}
          onClose={closeContext}
          ariaLabel="Context menu"
          items={contextMenuItems}
        />
      </div>
    </div>
  );
}
