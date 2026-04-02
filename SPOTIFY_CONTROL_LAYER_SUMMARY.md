# Spotify Control Layer — Full Summary (Build Notes)

This document captures **the product intention**, **the non‑negotiable rules**, and **everything implemented in the prototype** to align to the "Spotify Control Layer" spec.

---

## Intent (what we're building)

This is **not a mode** and **not a separate app**.

It is a **control layer on top of Spotify** whose core promise is:

> **Action without navigation** — "Spotify, but I can act instantly without navigating."

Works for:
- **Blind / low vision (BVI)** users
- **Sighted** users in constrained contexts (driving, multitasking, gym, cooking)

The "does it feel like a different app?" test is the truth test:
- If **YES** → wrong
- If **NO** → correct

---

## Non‑negotiable rules (enforced)

- **No "IV Mode" anywhere**
- **No "Accessible Mode" label in UI**
- **No separate navigation system**
- **No FAB**
- **No boxed UI containers / centered wrappers / floating cards**
- **No redundant audio feedback** (screen reader already announces)
- Must use **iPhone‑native proportions** (iPhone 16 Pro target)
- Must feel like **nothing new was introduced**

---

## What was working vs not working (design review takeaways)

### Working
- **iPhone framing + dark theme tokens** were already close to Spotify's dark-first feel.
- **Mini-player target dimensions** (59pt height, 12pt radius, anchored above bottom nav) were aligned.
- **TTS guard** approach (only voice input + errors) is correct as a principle.
- **Rows over cards** direction was right (the `.card` container is deprecated/no-op).

### Not working (core issues we fixed)
- **Extra navigation** ("Control" tab) broke the "no new nav system" rule.
- Command palette behaved like a **developer command console** (wrong mental model).
- Pinned items did not look like **Spotify content rows** and weren't placed everywhere required.
- Support/help/settings existed as a **separate destination**, reading like a "mode."
- Visible **"Where am I" UI** duplicated screen reader behavior.
- Proportions/typography were off (titles too small, header too tall, bottom nav mismatch).
- **Long-press was broken on mobile** — `setPointerCapture` + Pointer Events caused `pointercancel` to fire immediately on touch, killing the timer. Additionally, the browser's native long-press behavior (text selection, iOS callout menu) fired instead.
- **No visible affordance** for context menu actions — users had no way to discover pin/unpin without knowing to long-press.

---

## Implementation summary (what changed)

### 1) Navigation: restore Spotify's native 3 tabs

**Goal**: keep only `Home`, `Search`, `Your Library`.

Implemented:
- Removed the extra fourth tab ("Control") and restored **3-tab nav**.
- `Now Playing` is **not** a tab. It opens **only via the mini-player**.

Files:
- `src/ui/types.ts`
  - `TabId` changed to: `"home" | "search" | "library"`
- `src/ui/components/BottomNavBar.tsx`
  - Tabs are now exactly: Home / Search / Your Library
- `src/ui/styles.css`
  - `.bottomNav` columns fixed to `repeat(3, 1fr)`
- `src/ui/App.tsx`
  - Added `nowPlayingOpen` boolean route state; mini-player sets it `true`

### 2) Command Palette: bottom sheet with search, voice, and pinned management

**Goal**: bottom-sheet action surface, voice-first entry, Spotify row pattern, "Find → Act → Save" flow.

Implemented:
- **Entry point**: persistent **header mic icon** on every screen (see section 3 below)
- Palette is a **bottom sheet** (92% height) that slides up (300ms ease-out translateY)
- **First-time hint**: always shown on open (not persisted to localStorage) for user testing — includes "Try typing: jazz" chip and "Got it" dismiss button
- **Search input**: full-width search bar with placeholder "Play liked songs or type jazz…"; filters results from an internal demo catalog (`paletteSearch.ts`)
- **Search results**: shown as Spotify rows with "..." (more) button for long-press/context actions
- **Context-aware quick actions**:
  - When playing: Like this song, Add to queue, Go to artist
  - When paused: Play liked songs, Resume last track
- Primary control: full-width green voice button (56pt) with placeholder "Say something…"
- **Pinned section**: rows with pin icon + "..." (more) button for tap-to-manage
- **Recent actions**: last 3 actions displayed as rows
- Accessibility: `aria-modal="true"`, focus moves to search input on open, focus trapped, Escape closes, focus returns to the header mic icon on close

Files:
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/paletteSearch.ts` (demo search catalog with `PaletteSearchHit` type and `filterPaletteSearch`)
- `src/ui/styles.css` (`.bottomSheetBackdrop`, `.bottomSheet`, `.spotifyRow`, `.sectionHeader`, `.voicePrimary`, `.paletteFirstHint`, `.paletteSearchInput`, `.paletteRowFlash`)

### 3) Header entry point: Spotify-style mic icon (no pill, no gestures)

**Goal**: stable, VoiceOver-friendly entry point that feels native to Spotify headers.

Implemented:
- Removed swipe-down gesture as an entry (conflicts with VoiceOver gestures)
- No keyboard shortcut opens the palette (Escape closes it)
- Added a **standard Spotify-style header icon button** (mic) on the right side of every header
  - `aria-label="Open command palette"`
  - `data-command-palette-trigger="true"` for focus return after close
- Inside the Command Palette, the large green voice control uses `aria-label="Voice input, tap to speak a command"`; pinned rows use `"{name}, pinned"` and `role="button"` where applicable

Files:
- `src/ui/components/HeaderBar.tsx`
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/App.tsx`

### 4) Home: Spotify-native structure without a shortcut grid

**Goal**: stop "new app" vibes; match Spotify Home's rhythm while avoiding oversized grids that break proportions.

Implemented:
- **Header**: `headerPlain`, empty title, profile avatar on the left, mic icon on the right (same entry point as other tabs).
- **Chips row**: All / Music / Podcasts / Audiobooks (tablist; selected chip uses Spotify green `#1DB954`).
- **Shortcuts**: **single-column list** of full-width rows (`.homeShortcutRow`) — **no 2-column grid**. Each row is 56pt tall with 56×56 tile art on the left, title (`homeShortcutTitle`, 12px/600) with ellipsis, tappable **"..." (more) button** on every row; row background `#282828`, 8px corner radius on the row; art uses left-edge radii to match the row.
- **Below**: a sample section block ("Albums featuring songs you like") with neutral placeholder subtitle text.

Files:
- `src/ui/screens/DiscoverScreen.tsx`
- `src/ui/styles.css` (`.homeShortcutRow`, `.homeShortcutArt`, `.homeShortcutTitle`, `.homeShortcutOverflow`)

### 5) Remove Support as a destination

**Goal**: no "mode UI" or separate help/settings screen.

Implemented:
- Deleted `SupportScreen` and removed the dedicated settings destination UI.

Files:
- Deleted: `src/ui/screens/SupportScreen.tsx`

### 6) Pinned: end-to-end pinning + Spotify-style context menu

**Goal**: pinned looks identical to Spotify content rows and appears:
- Top of Command Palette
- Top of Library
- Below queue in Now Playing

Implemented:
- Pinned is now **interactive end-to-end**:
  - **Visible "..." (more) button** on every content row — tap opens the context menu (no long-press required)
  - Long-press/right-click also opens the context menu as a secondary interaction
  - Context menu is a Spotify-style bottom sheet with options: Pin/Unpin, Add to queue, Add to playlist, Go to artist, Share
  - Pin toggles state immediately; if pinned → shows "Unpin"; if not → shows "Pin"
  - Max 6 pinned items enforced; attempting a 7th triggers an **inline error banner** (no toast/modal)
  - **Flash animation** on newly pinned items (green highlight that fades out)
- Pinned appears in all 3 required locations:
  - Top of command palette
  - Top of library
  - Below queue in now playing

Files:
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/overlays/ContextMenuSheet.tsx`
- `src/ui/screens/LibraryScreen.tsx`
- `src/ui/screens/NowScreen.tsx`
- `src/ui/screens/SearchScreen.tsx`
- `src/ui/App.tsx`
- `src/ui/components/Icon.tsx` (added `pin`, `overflow`, `share`, `plusCircle`)

### 7) "Where am I": removed from visible UI

**Goal**: stop duplicating screen reader output.

Implemented:
- Removed the ring/"Where am I" button from screen headers.
- Removed "Where am I" as a command palette action.
- Kept the underlying toast UI as internal/development-only behavior.

Files:
- `src/ui/components/HeaderBar.tsx` (supports avatar, custom icons; default ring no longer forced)
- `src/ui/screens/NowScreen.tsx`
- `src/ui/screens/SearchScreen.tsx`
- `src/ui/screens/LibraryScreen.tsx`
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/App.tsx`

### 8) Audio redundancy removed (strict)

**Goal**: no redundant spoken feedback on user actions (screen reader handles it).

Implemented:
- Removed all `speak()` calls for play/pause/skip/pin/unpin/navigation.
- Kept only:
  - `speak("Listening…")` when voice input starts
  - `speak(errorMessage)` when an actual error occurs (e.g., pin limit reached)

### 9) Visual proportions & polish (applied)

Implemented:
- `index.html` title changed to **Spotify** (removes "Accessible Mode" label).
- **Status bar removed** (time + battery indicators deleted from the prototype).
- Header height reduced (`.headerGradient`).
- Header layout fixed to prevent truncation: `.header { grid-template-columns: auto 1fr auto; }`
- Typography switched to Spotify-like stack and locked scale:
  - Font stack: `"Circular Std", "Circular", -apple-system, BlinkMacSystemFont, sans-serif`
  - Header title: 22pt/700
  - Section header: 12pt/700/uppercase/#b3b3b3
  - Row primary: 16pt/400/#fff
  - Row secondary: 13pt/400/#b3b3b3
  - Nav label: 10pt/400
- Tap targets improved:
  - `.miniIcon` → 44×44
  - Now controls non-primary → min height 56
  - Command Palette primary voice control: `.voicePrimary` height **56px**
- Home chips and bottom nav tuned for density (e.g. bottom tab buttons use a column flex layout so labels are not clipped).
- Album art container no longer uses centered "auto" margins; it respects padding-based layout.
- Bottom sheet overlays are constrained to the device frame (render inside `.app`).

### 10) Long-press & interaction system (fixed)

**Goal**: make pin/unpin and all context menu actions reliably work on both mobile touch and desktop mouse.

#### Problem
The original `useLongPress` hook used **Pointer Events** with `setPointerCapture`. On mobile browsers (especially iOS Safari), the browser fires `pointercancel` almost immediately when scroll intent is detected, killing the long-press timer before it fires. Additionally, native browser long-press behavior (text selection, iOS callout menu) interfered.

#### Solution: dual-event system + visible affordances

**A) Rewrote `useLongPress` hook** (`src/ui/useLongPress.ts`):
- Uses **Touch Events** (`touchstart`/`touchmove`/`touchend`/`touchcancel`) as primary for mobile
- Uses **Mouse Events** (`mousedown`/`mousemove`/`mouseup`/`mouseleave`) as fallback for desktop
- **10px movement threshold** distinguishes scroll from hold — if finger moves >10px, long-press cancels (scroll proceeds normally)
- `isTouchRef` flag prevents double-firing on devices where both touch and mouse events fire
- **No `setPointerCapture`** — removed entirely as the root cause of mobile failures
- `consumeLongPressClick()` still suppresses the tap event that follows a successful long-press

**B) CSS: prevented native long-press interference**:
- Added `user-select: none` / `-webkit-user-select: none` to `.row`, `.spotifyRow`, `.homeShortcutRow`, `.browseTile`
- Added `-webkit-touch-callout: none` to prevent iOS callout menu
- `LongPressable` component applies these inline (`userSelect`, `WebkitTouchCallout`, `touchAction: manipulation`)

**C) Added visible "..." (more) buttons** — the critical UX fix:
- **`ListRow`**: shows a tappable "..." button (`.moreBtn`) whenever `onLongPress` is provided — tap it → context menu opens → Pin/Unpin/Add to queue/etc.
- **`PinnedPaletteRow`** in Command Palette: "..." button added
- **`SearchHitRow`** in Command Palette: "..." button added
- **Home shortcut rows**: "..." button on every row (via `<button>` inside `LongPressable`)
- **Now Playing track area**: "..." button added next to the heart icon
- **Queue rows, Library rows, Pinned rows in Library/Now Playing**: all get "..." buttons automatically via `ListRow`

Users can now **tap the "..."** on any row to open the context menu without needing to discover long-press.

Files:
- `src/ui/useLongPress.ts` (complete rewrite)
- `src/ui/components/ListRow.tsx` (added `.moreBtn`, switched to touch/mouse handlers)
- `src/ui/components/LongPressable.tsx` (switched to touch/mouse handlers, added inline user-select/touch-callout)
- `src/ui/overlays/CommandPalette.tsx` (`PinnedPaletteRow` + `SearchHitRow` updated)
- `src/ui/screens/NowScreen.tsx` ("..." button on track info, updated stopPropagation)
- `src/ui/screens/DiscoverScreen.tsx` ("..." button on all shortcut rows)
- `src/ui/styles.css` (`user-select: none`, `-webkit-touch-callout: none`, `.moreBtn`)

### 11) Dummy content only (no personal/real data)

Implemented:
- Replaced any real-world titles/names in Home shortcuts and section subtitles with neutral placeholders.
- Updated default pinned content to generic queries (e.g. "Search: chill").
- Removed brand-like/unique mini-player meta text in favor of neutral ("Now playing").

Files:
- `index.html`
- `src/ui/styles.css`
- `src/ui/screens/DiscoverScreen.tsx`
- `src/ui/screens/NowScreen.tsx`
- `src/ui/mockData.ts`
- `src/ui/App.tsx`

---

## Current structure (how to use the prototype)

- **Bottom tabs**: Home / Search / Your Library
- **Now Playing**: tap the mini-player
- **Command Palette**: tap the **header mic icon** (sole entry point)
- **Context menu**: tap the **"..." (more) button** on any row → opens bottom sheet with Pin/Unpin, Add to queue, Add to playlist, Go to artist, Share
- **Pinned**:
  - pin/unpin via "..." button → context menu on any content row
  - manage pinned at top of Library, top of Command Palette, and below queue in Now Playing
- **"Find → Act → Save" flow**:
  1. Open Command Palette (header mic)
  2. Type "jazz" in the search input (or tap "Try typing: jazz" chip)
  3. Tap the result to play
  4. Tap "..." on the result → Pin
  5. Pinned item appears instantly in Pinned sections

---

## Known follow-ups (for "pixel perfect" + "real app smooth")

These are not blockers for spec compliance, but they're the most likely sources of further polish:

1) **Voice input completion**
   - Currently voice input sets `listening = true` and speaks "Listening…" but has no timeout, cancel button, or speech recognition. Needs a cancel/reset mechanism and ideally Web Speech API integration.

2) **Palette search catalog expansion**
   - The demo catalog has limited items (Jazz Vibes and a few more). Type anything besides matching keywords and you get zero results with no "No results" feedback message.

3) **Search screen search bar**
   - Currently decorative — user types but nothing filters. Should hook into a mock data set or show results.

4) **Content row tap actions**
   - Some content rows (Home shortcuts, browse tiles, rail cards) don't navigate or play on tap — only the "..." button and long-press work. Tapping pinned items with "stub" payload is a no-op.

5) **Play button on rows**
   - When `onLongPress` is provided, the "..." button takes priority over the play button. Consider showing both, or making the thumbnail tappable to play.

6) **Micro-radii and spacing**
   - Reference UI sometimes uses ~4px corner radius on small tile art inside a row whose outer radius is slightly larger; tune `homeShortcutArt` / row radii to match a chosen screenshot pixel-for-pixel.

7) **Mini-player proportions**
   - Fine-tune typography, spacing, and trailing controls against a current Spotify capture (still within the iPhone 16 Pro frame).

8) **Dev-only "Where am I"**
   - **Ctrl/⌘+W** still opens an internal Where Am I toast for development; it is not part of the product chrome.

---

## Code map (quick pointers)

- App routing + overlays: `src/ui/App.tsx`
- Bottom nav: `src/ui/components/BottomNavBar.tsx`
- Header system: `src/ui/components/HeaderBar.tsx`
- List row (with "..." button): `src/ui/components/ListRow.tsx`
- Long-pressable wrapper: `src/ui/components/LongPressable.tsx`
- Long-press hook (touch + mouse): `src/ui/useLongPress.ts`
- SVG icons: `src/ui/components/Icon.tsx`
- Command palette overlay: `src/ui/overlays/CommandPalette.tsx`
- Context menu sheet overlay: `src/ui/overlays/ContextMenuSheet.tsx`
- Palette search catalog: `src/ui/paletteSearch.ts`
- Home: `src/ui/screens/DiscoverScreen.tsx`
- Search: `src/ui/screens/SearchScreen.tsx`
- Library (incl. Pinned management): `src/ui/screens/LibraryScreen.tsx`
- Now Playing: `src/ui/screens/NowScreen.tsx`
- Global styles/tokens: `src/ui/styles.css`
- TTS guard: `src/ui/tts.ts`
- Types: `src/ui/types.ts`
- Mock data: `src/ui/mockData.ts`
