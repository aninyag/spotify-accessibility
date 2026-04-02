/**
 * Axis home imagery: tries `/public/axis/<name>.png` first (add files there anytime),
 * then falls back to deterministic placeholder photos so tiles always show art in dev.
 */
const base = import.meta.env.BASE_URL;

export function axisLocalPng(name: string): string {
  return `${base}axis/${name}.png`;
}

/** Default home grid tiles: `/public/home/<name>.png` (e.g. tile-01 … tile-08). */
export function homeLocalPng(name: string): string {
  return `${base}home/${name}.png`;
}

/** Profile photo: add `public/axis/avatar-profile.png` (or run `scripts/sync-demo-assets.sh`). */
export const AXIS_PROFILE_PHOTO_URL = axisLocalPng("avatar-profile");

/** On Repeat playlist art: `public/home/tile-02.png`. */
export const ON_REPEAT_COVER_URL = homeLocalPng("tile-02");

/** Per-tile placeholder if local PNG missing (picsum is dev-friendly; swap for your CDN later). */
export function axisTileFallback(seed: string, size = 240): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}
