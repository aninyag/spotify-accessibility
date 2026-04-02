/**
 * Art for the Axis-enabled home. Copy into `public/axis/` as:
 *   hero.png ← about-headshot-…png
 *   wrapped-artists.png, wrapped-top-songs.png, tile-mix.png, tile-indie-pop.png, tile-beatles.png
 *   banner-wrapped.png ← Frame_331-…png
 *   hero-artist-feature.png, avatar-profile.png
 * Missing files get gradient/image fallbacks in the UI.
 */
const base = `${import.meta.env.BASE_URL}axis/`;

export const axisImg = {
  hero: `${base}hero.png`,
  wrappedArtists: `${base}wrapped-artists.png`,
  topSongs: `${base}wrapped-top-songs.png`,
  tileMix: `${base}tile-mix.png`,
  indiePop: `${base}tile-indie-pop.png`,
  beatles: `${base}tile-beatles.png`,
  banner: `${base}banner-wrapped.png`,
  artistFeature: `${base}hero-artist-feature.png`,
  avatarProfile: `${base}avatar-profile.png`,
} as const;
