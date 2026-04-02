import type { Landmark, Track } from "./types";

export const mockNowPlaying: Track = {
  id: "t1",
  title: "Levitating",
  artist: "Dua Lipa",
  album: "Future Nostalgia",
  durationSec: 225,
};

export const mockQueue: Track[] = [
  mockNowPlaying,
  { id: "t2", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", durationSec: 324 },
  { id: "t3", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", durationSec: 200 },
  { id: "t4", title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", durationSec: 183 },
  { id: "t5", title: "Get Lucky", artist: "Daft Punk", album: "Random Access Memories", durationSec: 248 },
];

export const defaultLandmarks: Landmark[] = [
  { id: "lm1", label: "Home", type: "screen", payload: { kind: "screen", tab: "home" } },
  { id: "lm2", label: "Search: jazz piano", type: "search", payload: { kind: "search", query: "jazz piano" } },
  { id: "lm3", label: "Liked Songs", type: "playlist", payload: { kind: "stub", ref: "liked-songs" } }
];

