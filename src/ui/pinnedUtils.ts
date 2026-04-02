import type { ContextTarget, Landmark } from "./types";

/** Normalize search text for stable pin ids (spec-style `search:…` keys). */
export function normalizeSearchKey(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/ /g, "-");
}

/** Stable id used when pinning this context (must match `isPinned` / unpin target). */
export function proposedPinId(target: ContextTarget): string {
  if (target.queueTrack) return `pin-track-${target.queueTrack.id}`;
  const lm = target.landmark;
  if (lm.payload.kind === "action" && lm.payload.action === "PLAY") {
    return `pin-track-${lm.payload.target.id}`;
  }
  if (lm.id.startsWith("pin-")) return lm.id;
  if (lm.payload.kind === "search") {
    return `pin-search-${normalizeSearchKey(lm.payload.query)}`;
  }
  if (lm.payload.kind === "stub") {
    return `pin-stub-${lm.payload.ref}`
      .replace(/\s+/g, "-")
      .toLowerCase();
  }
  if (lm.payload.kind === "screen") {
    return `pin-screen-${lm.payload.tab}`;
  }
  return `pin-${lm.id}`;
}

function semanticSearchMatch(list: Landmark[], query: string): Landmark | undefined {
  const key = normalizeSearchKey(query);
  return list.find(
    (x) => x.payload.kind === "search" && normalizeSearchKey(x.payload.query) === key,
  );
}

function semanticStubMatch(list: Landmark[], ref: string): Landmark | undefined {
  return list.find((x) => x.payload.kind === "stub" && x.payload.ref === ref);
}

/** Stored shortcut row for this context (by stable id, or semantic / legacy PLAY match). */
export function resolvePinnedLandmark(
  target: ContextTarget,
  list: Landmark[],
): Landmark | undefined {
  const wantId = proposedPinId(target);
  const byId = list.find((x) => x.id === wantId);
  if (byId) return byId;

  const lm = target.landmark;
  if (lm.payload.kind === "search") {
    const s = semanticSearchMatch(list, lm.payload.query);
    if (s) return s;
  }
  if (lm.payload.kind === "stub") {
    const s = semanticStubMatch(list, lm.payload.ref);
    if (s) return s;
  }
  if (lm.payload.kind === "screen") {
    const s = list.find((x) => x.payload.kind === "screen" && x.payload.tab === lm.payload.tab);
    if (s) return s;
  }

  const trackId =
    target.queueTrack?.id ??
    (lm.payload.kind === "action" && lm.payload.action === "PLAY"
      ? lm.payload.target.id
      : undefined);
  if (trackId) {
    return list.find(
      (x) =>
        x.payload.kind === "action" &&
        x.payload.action === "PLAY" &&
        x.payload.target.id === trackId,
    );
  }
  return undefined;
}

/** True if this context already has a matching shortcut (e.g. pin badge on rows). */
export function isContextPinned(target: ContextTarget, list: Landmark[]): boolean {
  return !!resolvePinnedLandmark(target, list);
}

/** Whether adding `candidate` would duplicate an existing shortcut (by id or semantics). */
export function pinningWouldDuplicate(list: Landmark[], candidate: Landmark): boolean {
  if (list.some((x) => x.id === candidate.id)) return true;
  const p = candidate.payload;
  if (p.kind === "action" && p.action === "PLAY") {
    const tid = p.target.id;
    return list.some(
      (x) =>
        x.payload.kind === "action" && x.payload.action === "PLAY" && x.payload.target.id === tid,
    );
  }
  if (p.kind === "search") {
    const key = normalizeSearchKey(p.query);
    return list.some(
      (x) => x.payload.kind === "search" && normalizeSearchKey(x.payload.query) === key,
    );
  }
  if (p.kind === "stub") {
    return list.some((x) => x.payload.kind === "stub" && x.payload.ref === p.ref);
  }
  if (p.kind === "screen") {
    return list.some((x) => x.payload.kind === "screen" && x.payload.tab === p.tab);
  }
  return false;
}
