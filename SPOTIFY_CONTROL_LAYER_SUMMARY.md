# Spotify Control Layer — Full Summary (Build Notes)

This document captures **the product intention**, **the non‑negotiable rules**, and **everything implemented in the prototype** to align to the “Spotify Control Layer” spec.

---

## Intent (what we’re building)

This is **not a mode** and **not a separate app**.

It is a **control layer on top of Spotify** whose core promise is:

> **Action without navigation** — “Spotify, but I can act instantly without navigating.”

Works for:
- **Blind / low vision (BVI)** users
- **Sighted** users in constrained contexts (driving, multitasking, gym, cooking)

The “does it feel like a different app?” test is the truth test:
- If **YES** → wrong
- If **NO** → correct

---

## Non‑negotiable rules (enforced)

- **No “IV Mode” anywhere**
- **No “Accessible Mode” label in UI**
- **No separate navigation system**
- **No FAB**
- **No boxed UI containers / centered wrappers / floating cards**
- **No redundant audio feedback** (screen reader already announces)
- Must use **iPhone‑native proportions** (iPhone 16 Pro target)
- Must feel like **nothing new was introduced**

---

## What was working vs not working (design review takeaways)

### Working
- **iPhone framing + dark theme tokens** were already close to Spotify’s dark-first feel.
- **Mini-player target dimensions** (59pt height, 12pt radius, anchored above bottom nav) were aligned.
- **TTS guard** approach (only voice input + errors) is correct as a principle.
- **Rows over cards** direction was right (the `.card` container is deprecated/no-op).

### Not working (core issues we fixed)
- **Extra navigation** (“Control” tab) broke the “no new nav system” rule.
- Command palette behaved like a **developer command console** (wrong mental model).
- Pinned items did not look like **Spotify content rows** and weren’t placed everywhere required.
- Support/help/settings existed as a **separate destination**, reading like a “mode.”
- Visible **“Where am I” UI** duplicated screen reader behavior.
- Proportions/typography were off (titles too small, header too tall, bottom nav mismatch).

---

## Implementation summary (what changed)

### 1) Navigation: restore Spotify’s native 3 tabs

**Goal**: keep only `Home`, `Search`, `Your Library`.

Implemented:
- Removed the extra fourth tab (“Control”) and restored **3-tab nav**.
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

### 2) Command Palette: bottom sheet, voice-first (Spotify-native)

**Goal**: bottom-sheet action surface (not search), voice-first entry, Spotify row pattern, no “new app” UI.

Implemented:
- **Entry point**: persistent **header mic icon** on every screen (see section 3 below)
- Palette is a **bottom sheet** (85% height) that slides up (300ms ease-out translateY)
- No search UI inside palette (Search remains the Search tab)
- Primary control: full-width green voice button (56pt) with placeholder “Say something…”
- Sections rendered as full-width Spotify-style rows:
  - **Pinned** (row + pin icon on the right)
  - **Recent actions** (last 3 actions)
  - **Quick actions** (play/pause, skip, add to queue)
- Accessibility: `aria-modal="true"`, focus moves to the voice button on open, focus trapped, focus returns to the header mic icon on close

Files:
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/styles.css` (`.bottomSheetBackdrop`, `.bottomSheet`, `.spotifyRow`, `.sectionHeader`, `.voicePrimary`)

### 3) Header entry point: Spotify-style mic icon (no pill, no gestures)

**Goal**: stable, VoiceOver-friendly entry point that feels native to Spotify headers.

Implemented:
- Removed swipe-down gesture as an entry (conflicts with VoiceOver gestures)
- Removed keyboard shortcut entry (Ctrl/⌘+K) for opening the palette
- Added a **standard Spotify-style header icon button** (mic) on the right side of every header
  - `aria-label="Open command palette"`
  - Focus return after closing palette targets this icon

Files:
- `src/ui/components/HeaderBar.tsx`
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/App.tsx`

### 4) Home: remove invented features, move toward Spotify-native structure

**Goal**: stop “new app” vibes; match Spotify Home’s structure.

Implemented:
- Home header uses a greeting (“Good morning/afternoon/evening”).
- Home content avoids invented “systems” and uses Spotify-native patterns:
  - **Recently played** rendered as **full-width list rows** (no grids)
  - **Made for you** horizontal row of cards (Spotify-native)
  - **Recommended** list rows

Files:
- `src/ui/screens/DiscoverScreen.tsx`

### 5) Remove Support as a destination

**Goal**: no “mode UI” or separate help/settings screen.

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
  - Long-press/context menu on Search/Library rows opens a Spotify-style bottom sheet context menu
  - First item toggles **Pin / Unpin** with a proper pin SVG icon
  - Max 6 pinned items enforced; attempting a 7th triggers an **error message** (no toast/modal)
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
- `src/ui/components/Icon.tsx` (added `pin`)

### 7) “Where am I”: removed from visible UI

**Goal**: stop duplicating screen reader output.

Implemented:
- Removed the ring/“Where am I” button from screen headers.
- Removed “Where am I” as a command palette action.
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
- `index.html` title changed to **Spotify** (removes “Accessible Mode” label).
- Header height reduced (`.headerGradient`).
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
- Album art container no longer uses centered “auto” margins; it respects padding-based layout.
- Bottom sheet overlays are constrained to the device frame (render inside `.app`).

Files:
- `index.html`
- `src/ui/styles.css`
- `src/ui/screens/NowScreen.tsx`

---

## Current structure (how to use the prototype)

- **Bottom tabs**: Home / Search / Your Library
- **Now Playing**: tap the mini-player
- **Command Palette**: tap the **header mic icon** (sole entry point)
- **Pinned**:
  - pin/unpin via context menu bottom sheet on Search/Library rows
  - manage pinned at top of Library

---

## Known follow-ups (for “pixel perfect” + “real app smooth”)

These are not blockers for spec compliance, but they’re the most likely sources of “proportions feel off” feedback:

1) **Mirror current Spotify layouts more closely**
   - Update Search and Library screens to match the current Spotify screenshot structures (chips, browse tiles, icon clusters).

2) **Mini-player proportions**
   - Match Spotify’s mini-player: typography, spacing, and trailing controls layout (still within the iPhone 16 Pro frame).

3) **Replace stub visuals that read “prototype”**
   - Placeholder album art and placeholder thumbnails should become Spotify-like skeletons (subtle shimmer, correct radii)

4) **Recent actions fidelity**
   - Persist and shape recent actions as Spotify-style rows that reflect real actions (Liked, Added to playlist, Queued).

---

## Code map (quick pointers)

- App routing + overlays: `src/ui/App.tsx`
- Bottom nav: `src/ui/components/BottomNavBar.tsx`
- Header system: `src/ui/components/HeaderBar.tsx`
- Command palette overlay: `src/ui/overlays/CommandPalette.tsx`
- Context menu sheet overlay: `src/ui/overlays/ContextMenuSheet.tsx`
- Home: `src/ui/screens/DiscoverScreen.tsx`
- Search: `src/ui/screens/SearchScreen.tsx`
- Library (incl. Pinned management): `src/ui/screens/LibraryScreen.tsx`
- Now Playing: `src/ui/screens/NowScreen.tsx`
- Global styles/tokens: `src/ui/styles.css`
- TTS guard: `src/ui/tts.ts`

