import { PALETTE_SEARCH_CATALOG } from "./paletteSearch";
import type { Landmark, Track } from "./types";

/** Two shortcuts shown on the Axis home screen (session state). */
export const defaultAxisHomeLandmarks: Landmark[] = [
  { id: "pin-library", label: "Your Library", type: "screen", payload: { kind: "screen", tab: "library" } },
  {
    id: "pin-chill",
    label: "Chill Hits",
    type: "search",
    payload: { kind: "search", query: "chill" },
  },
];

/** Songs shown on Search; stub refs s1–s3 resolve here. */
export const browseStubTracks: Track[] = [
  { id: "s1", title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", durationSec: 183 },
  { id: "s2", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", durationSec: 200 },
  { id: "s3", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", durationSec: 324 },
];

/** Axis home “Top songs” list — lines up with All / Pop / Hip-hop chips. */
export const axisHomeTopSongRows: { track: Track; genre: "Pop" | "Hip-hop" }[] = [
  {
    track: {
      id: "axis-row-1",
      title: "Don't Start Now",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      durationSec: 183,
    },
    genre: "Pop",
  },
  {
    track: {
      id: "axis-row-2",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      durationSec: 200,
    },
    genre: "Pop",
  },
  {
    track: {
      id: "axis-row-3",
      title: "HUMBLE.",
      artist: "Kendrick Lamar",
      album: "DAMN.",
      durationSec: 177,
    },
    genre: "Hip-hop",
  },
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

