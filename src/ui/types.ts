export type TabId = "now" | "search" | "library" | "discover" | "support";

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
  | "screen";

export type Landmark = {
  id: string;
  label: string;
  type: LandmarkType;
  payload: { kind: "screen"; tab: TabId } | { kind: "search"; query: string } | { kind: "stub"; ref: string };
};

