import * as React from "react";
import { BottomNavBar } from "./components/BottomNavBar";
import type { AppAction, ContextTarget, Landmark, RepeatMode, TabId, Track } from "./types";
import { MAX_PINNED_SHORTCUTS } from "./constants";
import { allKnownTracks, defaultAxisHomeLandmarks, mockNowPlaying, mockQueue } from "./mockData";
import { resolveStubToTrack, stubSearchSeedForRef } from "./stubResolve";
import { NowScreen } from "./screens/NowScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { ArtistScreen } from "./screens/ArtistScreen";
import { CommandPalette, type Command } from "./overlays/CommandPalette";
import { WhereAmIToast } from "./overlays/WhereAmIToast";
import { Icon } from "./components/Icon";
import { ContextMenuSheet } from "./overlays/ContextMenuSheet";
import { ToastContainer, type AppToast } from "./components/ToastContainer";
import { pinningWouldDuplicate, proposedPinId, resolvePinnedLandmark } from "./pinnedUtils";
import { defaultAxisSettings, type AxisSettings } from "./axisSettings";
import { AxisTutorial } from "./overlays/AxisTutorial";
import { ProfileMenu } from "./components/ProfileMenu";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
  const [toasts, setToasts] = React.useState<AppToast[]>([]);
  const [queue, setQueue] = React.useState<Track[]>(() => mockQueue.map((t) => ({ ...t })));
  const [likedTrackIds, setLikedTrackIds] = React.useState<string[]>([]);
  const [pinnedFlashId, setPinnedFlashId] = React.useState<string | null>(null);

  const [settings] = React.useState<Settings>({
    voiceFeedback: true,
    voiceRate: "normal",
    announceSongChanges: true,
  });

  const [landmarks, setLandmarks] = React.useState<Landmark[]>(() => [...defaultAxisHomeLandmarks]);
  const [axisSettings, setAxisSettings] = React.useState<AxisSettings>(defaultAxisSettings);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [axisTutorialOpen, setAxisTutorialOpen] = React.useState(false);
  const [artistDetailName, setArtistDetailName] = React.useState<string | null>(null);
  const [searchSeed, setSearchSeed] = React.useState<string | undefined>(undefined);
  const [axisLearnPlayCounts, setAxisLearnPlayCounts] = React.useState<Record<string, number>>({});
  const [axisLearnDismissedKeys, setAxisLearnDismissedKeys] = React.useState<Record<string, true>>({});

  const [track, setTrack] = React.useState<Track>(mockNowPlaying);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState<RepeatMode>("off");
  const [currentTime, setCurrentTime] = React.useState(0);

  const ttsEnabled = settings.voiceFeedback;
  const ttsRate = rateToNumber(settings.voiceRate);
  const axisEnabled = axisSettings.isEnabled;

  const chillHitsLandmark: Landmark = React.useMemo(
    () => ({
      id: "pin-stub-chill-hits",
      label: "Chill Hits",
      type: "playlist",
      payload: { kind: "stub", ref: "chill-hits" },
    }),
    [],
  );

  const chillHitsAlreadyPinned = React.useMemo(() => {
    // Use semantic duplicate detection so renames still match.
    return pinningWouldDuplicate(landmarks, chillHitsLandmark);
  }, [landmarks, chillHitsLandmark]);

  const chillHitsLearnKey = "learn:chill-hits";
  const chillHitsPlayCount = axisLearnPlayCounts[chillHitsLearnKey] ?? 0;
  const chillHitsLearnDismissed = !!axisLearnDismissedKeys[chillHitsLearnKey];
  const forceLearnBanner = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return new URLSearchParams(window.location.search).get("demoLearn") === "1";
    } catch {
      return false;
    }
  }, []);
  const showChillHitsLearnBanner =
    axisEnabled &&
    (forceLearnBanner || chillHitsPlayCount >= 2) &&
    !chillHitsAlreadyPinned &&
    !chillHitsLearnDismissed;

  const bumpLearnCount = React.useCallback((key: string) => {
    setAxisLearnPlayCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  }, []);

  const openCommandPalette = React.useCallback(() => {
    if (axisSettings.isEnabled) setCommandOpen(true);
  }, [axisSettings.isEnabled]);

  React.useEffect(() => {
    if (!axisSettings.isEnabled) setCommandOpen(false);
  }, [axisSettings.isEnabled]);

  const pushToast = React.useCallback((toast: Omit<AppToast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

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
      switch (action.type) {
        case "PLAY": {
          setTrack(action.payload);
          setIsPlaying(true);
          setCurrentTime(0);
          break;
        }
        case "ADD_TO_QUEUE": {
          const instance: Track = { ...action.payload, id: `${action.payload.id}-q-${Date.now()}` };
          setQueue((q) => [...q, instance]);
          pushToast({ type: "success", message: `Added to queue: ${action.payload.title}` });
          break;
        }
        case "PIN": {
          const lm = action.payload;
          setLandmarks((prev) => {
            if (pinningWouldDuplicate(prev, lm)) {
              window.setTimeout(() => {
                pushToast({ type: "info", message: `"${lm.label}" is already pinned` });
              }, 0);
              return prev;
            }
            if (prev.length >= MAX_PINNED_SHORTCUTS) {
              window.setTimeout(() => {
                pushToast({
                  type: "error",
                  message: `Maximum ${MAX_PINNED_SHORTCUTS} pinned shortcuts. Remove one first.`,
                });
              }, 0);
              return prev;
            }
            window.setTimeout(() => {
              setPinnedFlashId(lm.id);
              window.setTimeout(() => setPinnedFlashId(null), 1800);
            }, 0);
            window.setTimeout(() => {
              pushToast({ type: "success", message: `Pinned: ${lm.label}` });
            }, 0);
            return [...prev, lm];
          });
          break;
        }
        case "UNPIN": {
          setLandmarks((prev) => {
            const removed = prev.find((x) => x.id === action.payload.id);
            if (removed) {
              window.setTimeout(() => {
                pushToast({ type: "success", message: `Removed: ${removed.label}` });
              }, 0);
            }
            return prev.filter((x) => x.id !== action.payload.id);
          });
          break;
        }
        case "RENAME_PINNED": {
          setLandmarks((prev) =>
            prev.map((p) => (p.id === action.payload.id ? { ...p, label: action.payload.label } : p)),
          );
          break;
        }
        case "MOVE_PINNED": {
          const { id, direction } = action.payload;
          setLandmarks((prev) => {
            const i = prev.findIndex((x) => x.id === id);
            if (i < 0) return prev;
            const j = direction === "up" ? i - 1 : i + 1;
            if (j < 0 || j >= prev.length) return prev;
            const next = [...prev];
            [next[i], next[j]] = [next[j], next[i]];
            return next;
          });
          break;
        }
      }
    },
    [setLandmarks, pushToast],
  );

  // ── Helpers that call dispatch ────────────────────────────────────────

  const playTrack = React.useCallback(
    (t: Track) => dispatch({ type: "PLAY", payload: t }),
    [dispatch],
  );

  const toggleLike = React.useCallback((trackId: string, _title: string) => {
    setLikedTrackIds((prev) => {
      const has = prev.includes(trackId);
      return has ? prev.filter((x) => x !== trackId) : [...prev, trackId];
    });
  }, []);

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
        setArtistDetailName((prev) => (prev ? null : prev));
        setCommandOpen(false);
        setProfileMenuOpen(false);
        setAxisTutorialOpen(false);
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

  const onTabChange = React.useCallback((t: TabId) => {
    setArtistDetailName(null);
    setTab(t);
    setNowPlayingOpen(false);
  }, []);

  const clearSearchSeed = React.useCallback(() => setSearchSeed(undefined), []);

  const executePinned = React.useCallback(
    (lm: Landmark) => {
      if (lm.payload.kind === "action") {
        setArtistDetailName(null);
        dispatch({ type: lm.payload.action, payload: lm.payload.target });
        return;
      }
      if (lm.payload.kind === "screen") {
        setArtistDetailName(null);
        setTab(lm.payload.tab);
        setNowPlayingOpen(false);
        return;
      }
      if (lm.payload.kind === "search") {
        setArtistDetailName(null);
        // Treat repeated use of the Chill Hits pinned shortcut as "played twice" for demo purposes.
        // This is much easier to trigger than voice-only palette search.
        if (axisSettings.isEnabled && lm.label.toLowerCase().includes("chill")) {
          bumpLearnCount(chillHitsLearnKey);
        }
        setSearchSeed(lm.payload.query);
        setTab("search");
        setNowPlayingOpen(false);
        return;
      }
      if (lm.payload.kind === "stub") {
        setArtistDetailName(null);
        const ref = lm.payload.ref;
        const browseLabel = stubSearchSeedForRef(ref);
        if (browseLabel) {
          setSearchSeed(browseLabel);
          setTab("search");
          setNowPlayingOpen(false);
          return;
        }
        const resolved = resolveStubToTrack(ref, queue);
        if (resolved) {
          dispatch({ type: "PLAY", payload: resolved });
          return;
        }
        pushToast({ type: "info", message: `Opening ${lm.label}` });
        setTab("library");
        setNowPlayingOpen(false);
        return;
      }
      setArtistDetailName(null);
      setTab("library");
      setNowPlayingOpen(false);
    },
    [dispatch, queue, pushToast],
  );

  const whereAmIText = React.useMemo(() => {
    if (nowPlayingOpen) {
      return `Now screen. ${isPlaying ? "Playing" : "Paused"} "${track.title}" by ${track.artist}. ${Math.max(0, track.durationSec - currentTime)} seconds remaining. Queue has ${queue.length} songs.`;
    }
    if (artistDetailName) return `Artist screen. Viewing ${artistDetailName}.`;
    if (tab === "search") return "Search screen. Type to search.";
    if (tab === "library") return "Library screen. Viewing playlists.";
    return "Home screen.";
  }, [tab, nowPlayingOpen, artistDetailName, isPlaying, track.title, track.artist, track.durationSec, currentTime, queue.length]);

  React.useEffect(() => {
    if (!whereAmIOpen) return;
    const id = window.setTimeout(() => setWhereAmIOpen(false), 4500);
    return () => window.clearTimeout(id);
  }, [whereAmIOpen, whereAmIText, ttsEnabled, ttsRate]);

  const goToArtistFromContext = React.useCallback((name: string) => {
    setArtistDetailName(name);
    setNowPlayingOpen(false);
  }, []);

  // ── Context menu items ────────────────────────────────────────────────

  const contextMenuItems = React.useMemo(() => {
    if (!contextTarget) return [];
    const lm = contextTarget.landmark;
    const variant = contextTarget.menuVariant ?? "default";

    const queueArtistShare: Array<{ key: string; label: string; icon: React.ReactNode; onSelect: () => void }> = [
      {
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
        onSelect: () => {},
      },
    ];

    if (!axisSettings.isEnabled) {
      return queueArtistShare;
    }

    const pinnedRow = resolvePinnedLandmark(contextTarget, landmarks);
    const isPinned = !!pinnedRow;
    const stablePinId = proposedPinId(contextTarget);
    const pinnedIndex =
      pinnedRow !== undefined ? landmarks.findIndex((x) => x.id === pinnedRow.id) : -1;

    const items: Array<{ key: string; label: string; icon: React.ReactNode; onSelect: () => void }> = [];

    if (variant === "pinned-management" && pinnedRow && pinnedIndex >= 0) {
      if (pinnedIndex > 0) {
        items.push({
          key: "move-up",
          label: "Move up",
          icon: <Icon name="chevronUp" size={18} />,
          onSelect: () => dispatch({ type: "MOVE_PINNED", payload: { id: pinnedRow.id, direction: "up" } }),
        });
      }
      if (pinnedIndex < landmarks.length - 1) {
        items.push({
          key: "move-down",
          label: "Move down",
          icon: <Icon name="chevronDown" size={18} />,
          onSelect: () => dispatch({ type: "MOVE_PINNED", payload: { id: pinnedRow.id, direction: "down" } }),
        });
      }
      items.push({
        key: "rename",
        label: "Rename",
        icon: <Icon name="plus" size={18} />,
        onSelect: () => {
          const newLabel = window.prompt("Rename shortcut", pinnedRow.label);
          if (newLabel && newLabel.trim()) {
            dispatch({ type: "RENAME_PINNED", payload: { id: pinnedRow.id, label: newLabel.trim() } });
          }
        },
      });
      items.push({
        key: "remove",
        label: "Remove from pinned",
        icon: <Icon name="pin" size={18} />,
        onSelect: () => dispatch({ type: "UNPIN", payload: { id: pinnedRow.id } }),
      });
      return items;
    }

    if (isPinned && pinnedRow) {
      items.push({
        key: "unpin",
        label: "Unpin",
        icon: <Icon name="pin" size={18} />,
        onSelect: () => dispatch({ type: "UNPIN", payload: { id: pinnedRow.id } }),
      });
      items.push({
        key: "rename",
        label: "Rename",
        icon: <Icon name="plus" size={18} />,
        onSelect: () => {
          const newLabel = window.prompt("Rename shortcut", pinnedRow.label);
          if (newLabel && newLabel.trim()) {
            dispatch({ type: "RENAME_PINNED", payload: { id: pinnedRow.id, label: newLabel.trim() } });
          }
        },
      });
    } else {
      const pinLandmark: Landmark =
        contextTarget.queueTrack
          ? {
              id: stablePinId,
              label: contextTarget.queueTrack.title,
              type: "action",
              payload: { kind: "action", action: "PLAY", target: contextTarget.queueTrack },
            }
          : { ...lm, id: stablePinId };

      items.push({
        key: "save-shortcut",
        label: "Save as shortcut",
        icon: <Icon name="pin" size={18} />,
        onSelect: () => dispatch({ type: "PIN", payload: pinLandmark }),
      });
    }

    items.push(...queueArtistShare);

    return items;
  }, [contextTarget, landmarks, dispatch, goToArtistFromContext, axisSettings.isEnabled]);

  // ── Command handler (called from CommandPalette) ──────────────────────

  const handleCommand = React.useCallback(
    (cmd: Command) => {
      if (cmd.kind === "nav") onTabChange(cmd.tab);
      if (cmd.kind === "playPause") {
        setIsPlaying((p) => !p);
      }
      if (cmd.kind === "skip") {
        const idx = queue.findIndex((t) => t.id === track.id);
        const next = queue[Math.min(queue.length - 1, Math.max(0, idx + 1))] ?? track;
        setTrack(next);
        setCurrentTime(0);
      }
      if (cmd.kind === "addToQueue") {
        dispatch({ type: "ADD_TO_QUEUE", payload: track });
      }
      if (cmd.kind === "like") {
        toggleLike(track.id, track.title);
      }
      if (cmd.kind === "landmark") executePinned(cmd.landmark);
      if (cmd.kind === "playPaletteResult") {
        setArtistDetailName(null);
        dispatch({ type: "PLAY", payload: cmd.hit.playTrack });
        // Feature: “Learn my shortcut” banner (session-only) — track repeated use of Chill Hits.
        if (cmd.hit.id === "pl-chill") {
          bumpLearnCount(chillHitsLearnKey);
        }
      }
      if (cmd.kind === "playLikedSongs") {
        const catalog = allKnownTracks(queue);
        const likedInQueue = queue.filter((t) => likedTrackIds.includes(t.id));
        if (likedInQueue.length > 0) {
          setArtistDetailName(null);
          dispatch({ type: "PLAY", payload: likedInQueue[0] });
          return;
        }
        const likedAny = catalog.find((t) => likedTrackIds.includes(t.id));
        if (likedAny) {
          setArtistDetailName(null);
          dispatch({ type: "PLAY", payload: likedAny });
          return;
        }
        onTabChange("library");
        pushToast({
          type: "info",
          message: "Heart songs on any track to hear them here.",
        });
      }
      if (cmd.kind === "openNowPlaying") {
        setArtistDetailName(null);
        setNowPlayingOpen(true);
        setIsPlaying(true);
      }
    },
    [queue, track, likedTrackIds, dispatch, executePinned, toggleLike, pushToast, onTabChange, bumpLearnCount, chillHitsLearnKey],
  );

  const artistTracks = React.useMemo(() => {
    if (!artistDetailName) return [];
    const needle = artistDetailName.toLowerCase();
    return allKnownTracks(queue).filter((t) => t.artist.toLowerCase() === needle);
  }, [artistDetailName, queue]);

  return (
    <div className="appShell">
      <div className="app">
        <main className="screen" role="tabpanel" aria-label="Spotify content">
          {artistDetailName ? (
            <ArtistScreen
              artistName={artistDetailName}
              tracks={artistTracks}
              landmarks={landmarks}
              axisEnabled={axisEnabled}
              onBack={() => setArtistDetailName(null)}
              onPlayTrack={playTrack}
              onOpenContext={openContext}
              onCommandPalette={openCommandPalette}
            />
          ) : nowPlayingOpen ? (
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
              onCommandPalette={openCommandPalette}
              onPlayTrack={playTrack}
              onExecutePinned={executePinned}
              onOpenContext={openContext}
              axisEnabled={axisEnabled}
            />
          ) : tab === "search" ? (
            <SearchScreen
              onCommandPalette={openCommandPalette}
              onOpenContext={openContext}
              onPlayTrack={playTrack}
              landmarks={landmarks}
              axisEnabled={axisEnabled}
              onOpenProfile={() => setProfileMenuOpen(true)}
              searchSeed={searchSeed}
              onSearchSeedConsumed={clearSearchSeed}
            />
          ) : tab === "library" ? (
            <LibraryScreen
              onCommandPalette={openCommandPalette}
              landmarks={landmarks}
              onOpenContext={openContext}
              onExecutePinned={executePinned}
              pinnedFlashId={pinnedFlashId}
              onMovePinned={(id, direction) => dispatch({ type: "MOVE_PINNED", payload: { id, direction } })}
              onUnpinPinned={(id) => dispatch({ type: "UNPIN", payload: { id } })}
              axisEnabled={axisEnabled}
              onOpenProfile={() => setProfileMenuOpen(true)}
            />
          ) : (
            <DiscoverScreen
              onCommandPalette={openCommandPalette}
              onOpenContext={openContext}
              onOpenProfile={() => setProfileMenuOpen(true)}
              axisEnabled={axisEnabled}
              onStartAxisTutorial={() => setAxisTutorialOpen(true)}
              landmarks={landmarks}
              onExecutePinned={executePinned}
              onPinnedLongPress={(lm) => openContext({ landmark: lm, menuVariant: "pinned-management" })}
              pinnedFlashId={pinnedFlashId}
              onPlayTrack={playTrack}
              tts={{ enabled: ttsEnabled, rate: ttsRate }}
              learnShortcutBanner={
                showChillHitsLearnBanner
                  ? {
                      key: chillHitsLearnKey,
                      label: "Axis noticed",
                      title: "You've played Chill Hits twice this week.",
                      description:
                        'Want to pin it as a one-tap shortcut? You can play it anytime just by saying \"chill.\"',
                      landmarkToPin: chillHitsLandmark,
                    }
                  : null
              }
              onPinSuggestedShortcut={(lm) => dispatch({ type: "PIN", payload: lm })}
              onDismissSuggestedShortcut={(key) =>
                setAxisLearnDismissedKeys((prev) => ({ ...prev, [key]: true }))
              }
            />
          )}
        </main>

        <div className="miniPlayer" aria-label="Now playing mini bar">
          <div className="miniThumb" />
          <button
            type="button"
            style={{ border: "none", background: "transparent", textAlign: "left", padding: 0, minHeight: 0 }}
            aria-label={`Now playing ${track.title} by ${track.artist}`}
            onClick={() => {
              setArtistDetailName(null);
              setNowPlayingOpen(true);
            }}
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

        {axisEnabled ? (
          <ErrorBoundary
            fallback={() => (
              <div
                className="bottomSheetBackdrop"
                style={{
                  position: "fixed",
                  inset: 0,
                  display: "grid",
                  alignItems: "end",
                  justifyItems: "stretch",
                  background: "rgba(0, 0, 0, 0.45)",
                  zIndex: 50,
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Command palette error"
                onPointerDown={() => setCommandOpen(false)}
              >
                <div
                  className="bottomSheet"
                  style={{
                    transform: "translateY(0)",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 -18px 60px rgba(0, 0, 0, 0.55)",
                    background: "#121212",
                    padding: "16px",
                    color: "#fff",
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>Command palette crashed</div>
                    <button type="button" className="paletteDoneBtn" onClick={() => setCommandOpen(false)}>
                      Done
                    </button>
                  </div>
                  <div style={{ marginTop: 10, color: "#b3b3b3", fontSize: 13, lineHeight: 1.4 }}>
                    Please reopen the palette. If it keeps happening, open your browser console and you’ll see a “UI
                    crashed” error with details.
                  </div>
                </div>
              </div>
            )}
          >
            <CommandPalette
              open={commandOpen}
              onClose={() => setCommandOpen(false)}
              context={{ tab, track, isPlaying, trackLiked: likedTrackIds.includes(track.id) }}
              landmarks={landmarks}
              pinnedFlashId={pinnedFlashId}
              onPinnedLongPress={(lm) => openContext({ landmark: lm, menuVariant: "pinned-management" })}
              onOpenContext={openContext}
              onCommand={handleCommand}
              onExecutePinned={executePinned}
              tts={{ enabled: ttsEnabled, rate: ttsRate }}
            />
          </ErrorBoundary>
        ) : null}

        <ProfileMenu
          isOpen={profileMenuOpen}
          onClose={() => setProfileMenuOpen(false)}
          axisEnabled={axisSettings.isEnabled}
          onAxisEnabledChange={(enabled) => setAxisSettings((s) => ({ ...s, isEnabled: enabled }))}
          onOpenAxisTutorial={() => setAxisTutorialOpen(true)}
        />

        <AxisTutorial
          isOpen={axisTutorialOpen}
          onClose={() => setAxisTutorialOpen(false)}
          onEnable={() => setAxisSettings((s) => ({ ...s, isEnabled: true, hasSeenTutorial: true }))}
        />

        <WhereAmIToast open={whereAmIOpen} text={whereAmIText} />

        <ToastContainer toasts={toasts} />

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
