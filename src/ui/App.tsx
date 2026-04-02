import * as React from "react";
import { BottomNavBar } from "./components/BottomNavBar";
import type { AppAction, ContextTarget, Landmark, RepeatMode, TabId, Track } from "./types";
import { mockNowPlaying, mockQueue } from "./mockData";
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

  const [settings] = useLocalStorageState<Settings>("sa.settings", {
    voiceFeedback: true,
    voiceRate: "normal",
    announceSongChanges: true,
  });

  const [landmarks, setLandmarks] = useLocalStorageState<Landmark[]>("sa.landmarks", []);

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

  // ── Central dispatch ──────────────────────────────────────────────────

  const dispatch = React.useCallback(
    (action: AppAction) => {
      console.log("ACTION:", action);

      switch (action.type) {
        case "PLAY": {
          setTrack(action.payload);
          setIsPlaying(true);
          setCurrentTime(0);
          setRecentActions((a) => [`Now playing: ${action.payload.title}`, ...a].slice(0, 3));
          break;
        }
        case "ADD_TO_QUEUE": {
          const instance: Track = { ...action.payload, id: `${action.payload.id}-q-${Date.now()}` };
          setQueue((q) => [...q, instance]);
          setRecentActions((a) => [`Added to queue: ${action.payload.title}`, ...a].slice(0, 3));
          break;
        }
        case "PIN": {
          setLandmarks((prev) => {
            setPinError(false);
            if (prev.some((x) => x.id === action.payload.id)) return prev;
            if (prev.length >= 6) {
              setPinError(true);
              return prev;
            }
            const lm = action.payload;
            window.setTimeout(() => {
              setPinnedFlashId(lm.id);
              window.setTimeout(() => setPinnedFlashId(null), 1800);
            }, 0);
            setRecentActions((a) => [`Pinned: ${lm.label}`, ...a].slice(0, 3));
            return [...prev, lm];
          });
          break;
        }
        case "UNPIN": {
          setLandmarks((prev) => {
            const removed = prev.find((x) => x.id === action.payload.id);
            if (removed) setRecentActions((a) => [`Unpinned: ${removed.label}`, ...a].slice(0, 3));
            return prev.filter((x) => x.id !== action.payload.id);
          });
          break;
        }
        case "RENAME_PINNED": {
          setLandmarks((prev) =>
            prev.map((p) => (p.id === action.payload.id ? { ...p, label: action.payload.label } : p)),
          );
          setRecentActions((a) => [`Renamed to: ${action.payload.label}`, ...a].slice(0, 3));
          break;
        }
      }
    },
    [setLandmarks],
  );

  console.log("STATE:", { track: track.title, isPlaying, queue: queue.length, pinned: landmarks.length });

  // ── Helpers that call dispatch ────────────────────────────────────────

  const playTrack = React.useCallback(
    (t: Track) => dispatch({ type: "PLAY", payload: t }),
    [dispatch],
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

  const executePinned = React.useCallback(
    (lm: Landmark) => {
      console.log("EXECUTE PINNED:", lm);
      if (lm.payload.kind === "action") {
        dispatch({ type: lm.payload.action, payload: lm.payload.target });
        return;
      }
      if (lm.payload.kind === "screen") {
        onTabChange(lm.payload.tab);
        return;
      }
      if (lm.payload.kind === "search") {
        setTab("search");
        setNowPlayingOpen(false);
        return;
      }
      // stub payloads — navigate to library as a fallback
      setTab("library");
      setNowPlayingOpen(false);
    },
    [dispatch],
  );

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

  // ── Context menu items ────────────────────────────────────────────────

  const contextMenuItems = React.useMemo(() => {
    if (!contextTarget) return [];
    const lm = contextTarget.landmark;
    const isPinned = landmarks.some((x) => x.id === lm.id);

    const items: Array<{ key: string; label: string; icon: React.ReactNode; onSelect: () => void }> = [];

    if (isPinned) {
      items.push({
        key: "unpin",
        label: "Unpin",
        icon: <Icon name="pin" size={18} />,
        onSelect: () => dispatch({ type: "UNPIN", payload: { id: lm.id } }),
      });
      items.push({
        key: "rename",
        label: "Rename",
        icon: <Icon name="plus" size={18} />,
        onSelect: () => {
          const newLabel = window.prompt("Rename shortcut", lm.label);
          if (newLabel && newLabel.trim()) {
            dispatch({ type: "RENAME_PINNED", payload: { id: lm.id, label: newLabel.trim() } });
          }
        },
      });
    } else {
      const pinLandmark: Landmark =
        contextTarget.queueTrack
          ? {
              id: `pin-${Date.now()}`,
              label: contextTarget.queueTrack.title,
              type: "action",
              payload: { kind: "action", action: "PLAY", target: contextTarget.queueTrack },
            }
          : { ...lm, id: `pin-${Date.now()}` };

      items.push({
        key: "save-shortcut",
        label: "Save as shortcut",
        icon: <Icon name="pin" size={18} />,
        onSelect: () => dispatch({ type: "PIN", payload: pinLandmark }),
      });
    }

    items.push({
      key: "queue",
      label: "Add to queue",
      icon: <Icon name="plus" size={18} />,
      onSelect: () => {
        const t: Track =
          contextTarget.queueTrack ?? {
            id: `row-${lm.id}`,
            title: lm.label,
            artist: contextTarget.artistName ?? "Spotify",
            durationSec: 200,
          };
        dispatch({ type: "ADD_TO_QUEUE", payload: t });
      },
    });

    items.push({
      key: "artist",
      label: "Go to artist",
      icon: <Icon name="search" size={18} />,
      onSelect: () => {
        const name = contextTarget.artistName ?? lm.label;
        goToArtistFromContext(name);
      },
    });

    items.push({
      key: "share",
      label: "Share",
      icon: <Icon name="share" size={18} />,
      onSelect: () => {
        setRecentActions((a) => [`Shared: ${lm.label}`, ...a].slice(0, 3));
      },
    });

    return items;
  }, [contextTarget, landmarks, dispatch, goToArtistFromContext]);

  // ── Command handler (called from CommandPalette) ──────────────────────

  const handleCommand = React.useCallback(
    (cmd: Command) => {
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
        dispatch({ type: "ADD_TO_QUEUE", payload: track });
      }
      if (cmd.kind === "like") {
        toggleLike(track.id, track.title);
      }
      if (cmd.kind === "landmark") executePinned(cmd.landmark);
      if (cmd.kind === "playPaletteResult") {
        dispatch({ type: "PLAY", payload: cmd.hit.playTrack });
      }
      if (cmd.kind === "playLikedSongs") {
        const liked = queue.find((t) => likedTrackIds.includes(t.id));
        if (liked) {
          dispatch({ type: "PLAY", payload: liked });
        } else {
          setTab("library");
          setNowPlayingOpen(false);
          if (queue[0]) dispatch({ type: "PLAY", payload: queue[0] });
        }
        setRecentActions((a) => ["Playing liked songs", ...a].slice(0, 3));
      }
      if (cmd.kind === "resumeLast") {
        setIsPlaying(true);
        setRecentActions((a) => [`Resumed: ${track.title}`, ...a].slice(0, 3));
      }
      if (cmd.kind === "goToArtist") {
        goToArtistFromContext(track.artist);
      }
    },
    [queue, track, isPlaying, likedTrackIds, dispatch, executePinned, toggleLike, goToArtistFromContext],
  );

  return (
    <div className="appShell">
      <div className="app">
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
              onTogglePlay={() => setIsPlaying((p) => !p)}
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
              onShuffleToggle={() => setShuffle((s) => !s)}
              onRepeatToggle={() => {
                const next: RepeatMode = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
                setRepeat(next);
              }}
              onSeek={(t) => setCurrentTime(t)}
              onCommandPalette={() => setCommandOpen(true)}
              onPlayTrack={playTrack}
              onExecutePinned={executePinned}
              onOpenContext={openContext}
            />
          ) : tab === "search" ? (
            <SearchScreen
              onCommandPalette={() => setCommandOpen(true)}
              onOpenContext={openContext}
              onPlayTrack={playTrack}
            />
          ) : tab === "library" ? (
            <LibraryScreen
              onCommandPalette={() => setCommandOpen(true)}
              landmarks={landmarks}
              onOpenContext={openContext}
              onExecutePinned={executePinned}
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
          onPinnedLongPress={(lm) => openContext({ landmark: lm })}
          onOpenContext={openContext}
          onCommand={handleCommand}
          onExecutePinned={executePinned}
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
