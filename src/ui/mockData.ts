import { PALETTE_SEARCH_CATALOG } from "./paletteSearch";
import type { Landmark, Track } from "./types";

/** Songs shown on Search; stub refs s1–s3 resolve here. */
export const browseStubTracks: Track[] = [
  { id: "s1", title: "Song title one", artist: "Artist A", durationSec: 210 },
  { id: "s2", title: "Song title two", artist: "Artist B", durationSec: 198 },
  { id: "s3", title: "Song title three", artist: "Artist C", durationSec: 225 },
];

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

export const defaultLandmarks: Landmark[] = [];

/** Merged catalog for “play stub”, artist pages, and liked-song fallback. */
export function allKnownTracks(queue: Track[]): Track[] {
  const byId = new Map<string, Track>();
  for (const t of mockQueue) byId.set(t.id, t);
  for (const t of queue) byId.set(t.id, t);
  for (const t of browseStubTracks) byId.set(t.id, t);
  for (const h of PALETTE_SEARCH_CATALOG) byId.set(h.playTrack.id, h.playTrack);
  return [...byId.values()];
}

