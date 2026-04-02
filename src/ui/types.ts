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
  | "screen";

export type Landmark = {
  id: string;
  label: string;
  type: LandmarkType;
  payload: { kind: "screen"; tab: TabId } | { kind: "search"; query: string } | { kind: "stub"; ref: string };
};

