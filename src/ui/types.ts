export type TabId = "home" | "search" | "library";

export type RepeatMode = "off" | "all" | "one";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationSec: number;
};

export type LandmarkType =
  | "playlist"
  | "album"
  | "artist"
  | "podcast"
  | "episode"
  | "search"
  | "screen"
  | "action";

export type Landmark = {
  id: string;
  label: string;
  type: LandmarkType;
  payload:
    | { kind: "screen"; tab: TabId }
    | { kind: "search"; query: string }
    | { kind: "stub"; ref: string }
    | { kind: "action"; action: "PLAY" | "ADD_TO_QUEUE"; target: Track };
};

/** Row a context menu is opened from (pin/unpin + playback targets share one model). */
export type ContextTarget = {
  landmark: Landmark;
  /** When set, "Add to queue" inserts this track; otherwise a stub row is queued from the landmark label. */
  queueTrack?: Track;
  /** Shown / used for "Go to artist". */
  artistName?: string;
  /** Command palette / manage flow: reorder + remove without cluttering with browse actions. */
  menuVariant?: "default" | "pinned-management";
};

export type AppAction =
  | { type: "PLAY"; payload: Track }
  | { type: "ADD_TO_QUEUE"; payload: Track }
  | { type: "PIN"; payload: Landmark }
  | { type: "UNPIN"; payload: { id: string } }
  | { type: "RENAME_PINNED"; payload: { id: string; label: string } }
  | { type: "MOVE_PINNED"; payload: { id: string; direction: "up" | "down" } };
