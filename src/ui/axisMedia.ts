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

/** Per-tile placeholder if local PNG missing (picsum is dev-friendly; swap for your CDN later). */
export function axisTileFallback(seed: string, size = 240): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}
