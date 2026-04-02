import type { Landmark, Track } from "./types";

export type PaletteSearchHit = {
  id: string;
  title: string;
  subtitle: string;
  landmark: Landmark;
  playTrack: Track;
  matchTokens: string[];
};

export const PALETTE_SEARCH_CATALOG: PaletteSearchHit[] = [
  {
    id: "pl-jazz",
    title: "Jazz Vibes",
    subtitle: "Playlist · Spotify",
    landmark: { id: "lm-pl-jazz", label: "Jazz Vibes", type: "playlist", payload: { kind: "stub", ref: "jazz-vibes" } },
    playTrack: { id: "jx1", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", durationSec: 324 },
    matchTokens: ["jazz", "vibes", "smooth", "swing"],
  },
  {
    id: "pl-chill",
    title: "Chill Hits",
    subtitle: "Playlist · Spotify",
    landmark: { id: "lm-pl-chill", label: "Chill Hits", type: "playlist", payload: { kind: "stub", ref: "chill-hits" } },
    playTrack: { id: "ch1", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", durationSec: 200 },
    matchTokens: ["chill", "relax", "hits", "blinding"],
  },
  {
    id: "pl-workout",
    title: "Workout Mix",
    subtitle: "Playlist · Spotify",
    landmark: { id: "lm-pl-workout", label: "Workout Mix", type: "playlist", payload: { kind: "stub", ref: "workout-mix" } },
    playTrack: { id: "wk1", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", durationSec: 225 },
    matchTokens: ["workout", "gym", "energy", "pump", "exercise"],
  },
  {
    id: "pl-focus",
    title: "Deep Focus",
    subtitle: "Playlist · Spotify",
    landmark: { id: "lm-pl-focus", label: "Deep Focus", type: "playlist", payload: { kind: "stub", ref: "deep-focus" } },
    playTrack: { id: "fc1", title: "Experience", artist: "Ludovico Einaudi", album: "In a Time Lapse", durationSec: 315 },
    matchTokens: ["focus", "study", "concentrate", "deep", "ambient"],
  },
  {
    id: "pl-party",
    title: "Party Starters",
    subtitle: "Playlist · Spotify",
    landmark: { id: "lm-pl-party", label: "Party Starters", type: "playlist", payload: { kind: "stub", ref: "party-starters" } },
    playTrack: { id: "pt1", title: "Get Lucky", artist: "Daft Punk", album: "Random Access Memories", durationSec: 248 },
    matchTokens: ["party", "dance", "fun", "lucky", "daft"],
  },
  {
    id: "pl-rock",
    title: "Classic Rock",
    subtitle: "Playlist · Spotify",
    landmark: { id: "lm-pl-rock", label: "Classic Rock", type: "playlist", payload: { kind: "stub", ref: "classic-rock" } },
    playTrack: { id: "rk1", title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", durationSec: 355 },
    matchTokens: ["rock", "classic", "queen", "bohemian", "guitar"],
  },
  {
    id: "pl-hiphop",
    title: "Hip Hop Essentials",
    subtitle: "Playlist · Spotify",
    landmark: { id: "lm-pl-hiphop", label: "Hip Hop Essentials", type: "playlist", payload: { kind: "stub", ref: "hiphop-essentials" } },
    playTrack: { id: "hh1", title: "HUMBLE.", artist: "Kendrick Lamar", album: "DAMN.", durationSec: 177 },
    matchTokens: ["hip hop", "hiphop", "rap", "kendrick", "humble"],
  },
  {
    id: "pl-lofi",
    title: "Lofi Beats",
    subtitle: "Playlist · Spotify",
    landmark: { id: "lm-pl-lofi", label: "Lofi Beats", type: "playlist", payload: { kind: "stub", ref: "lofi-beats" } },
    playTrack: { id: "lo1", title: "Coffee Shop", artist: "Lofi Girl", durationSec: 180 },
    matchTokens: ["lofi", "lo-fi", "beats", "coffee", "chill beats"],
  },
  {
    id: "al-weeknd",
    title: "After Hours",
    subtitle: "Album · The Weeknd",
    landmark: { id: "lm-al-weeknd", label: "After Hours", type: "album", payload: { kind: "stub", ref: "after-hours" } },
    playTrack: { id: "wk2", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", durationSec: 200 },
    matchTokens: ["weeknd", "after hours", "blinding", "lights"],
  },
  {
    id: "al-dua",
    title: "Future Nostalgia",
    subtitle: "Album · Dua Lipa",
    landmark: { id: "lm-al-dua", label: "Future Nostalgia", type: "album", payload: { kind: "stub", ref: "future-nostalgia" } },
    playTrack: { id: "dl1", title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", durationSec: 183 },
    matchTokens: ["dua", "lipa", "nostalgia", "don't start", "levitating"],
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
