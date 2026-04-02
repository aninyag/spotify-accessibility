import { PALETTE_SEARCH_CATALOG } from "./paletteSearch";
import { browseStubTracks, mockQueue } from "./mockData";
import type { Track } from "./types";

const BROWSE_REF_TO_SEARCH_LABEL: Record<string, string> = {
  music: "Music",
  podcasts: "Podcasts",
  audiobooks: "Audiobooks",
  live: "Live Events",
  songs: "Songs",
  artists: "Artists",
  albums: "Albums",
  playlist: "Playlist",
  "indie-pop": "Indie Pop",
};

/** Map `browse-*` stub refs (from Search tiles) to a search field seed. */
export function browseStubSearchLabel(stubRef: string): string | undefined {
  if (!stubRef.startsWith("browse-")) return undefined;
  const key = stubRef.slice("browse-".length);
  return BROWSE_REF_TO_SEARCH_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/** Stubs that should open Search with a seed (includes non-`browse-*` promo tiles). */
export function stubSearchSeedForRef(stubRef: string): string | undefined {
  if (stubRef === "wrapped-feature") return "Your Artists Revealed";
  return browseStubSearchLabel(stubRef);
}

/** Resolve a pinned/search stub ref to a playable track when possible. */
export function resolveStubToTrack(stubRef: string, queue: Track[]): Track | undefined {
  const inQueue = queue.find((t) => t.id === stubRef);
  if (inQueue) return inQueue;
  const inMock = mockQueue.find((t) => t.id === stubRef);
  if (inMock) return inMock;
  const inBrowse = browseStubTracks.find((t) => t.id === stubRef);
  if (inBrowse) return inBrowse;
  const hit = PALETTE_SEARCH_CATALOG.find(
    (h) => h.landmark.payload.kind === "stub" && h.landmark.payload.ref === stubRef,
  );
  return hit?.playTrack;
}
