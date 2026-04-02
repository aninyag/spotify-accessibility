import type { Landmark, Track } from "./types";

/** Demo catalog for the “Find → act → save” flow (type “jazz” in the palette). */
export type PaletteSearchHit = {
  id: string;
  title: string;
  subtitle: string;
  landmark: Landmark;
  /** First track played when user taps the row. */
  playTrack: Track;
  /** Extra tokens to match (e.g. “jazz”). */
  matchTokens: string[];
};

export const PALETTE_SEARCH_CATALOG: PaletteSearchHit[] = [
  {
    id: "pl-jazz",
    title: "Jazz Vibes",
    subtitle: "Playlist · Spotify",
    landmark: {
      id: "lm-pl-jazz",
      label: "Jazz Vibes",
      type: "playlist",
      payload: { kind: "stub", ref: "jazz-vibes" },
    },
    playTrack: {
      id: "jx1",
      title: "Take Five",
      artist: "Dave Brubeck",
      album: "Time Out",
      durationSec: 324,
    },
    matchTokens: ["jazz", "vibes", "smooth", "swing"],
  },
];

export function filterPaletteSearch(query: string): PaletteSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PALETTE_SEARCH_CATALOG.filter((h) => {
    if (h.title.toLowerCase().includes(q) || h.subtitle.toLowerCase().includes(q)) return true;
    return h.matchTokens.some((t) => t.includes(q) || q.includes(t));
  });
}
