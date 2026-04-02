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

### 2) Command Palette: “Spotify Search, but for actions”

**Goal**: content-first layout, full-width rows, no console vibe, mic inside search.

Implemented:
- Replaced “Command Palette” title + “Type a command…” UI with a **Spotify-like search bar**
- Sections in order:
  1. **Pinned**
  2. **Suggested** (current track as a first-class content row)
  3. **Actions** (play/pause + nav actions as rows)
- Removed the “Speak a command” CTA button; mic now lives inside search.
- Removed keyboard shortcut hint text from the overlay.
- Overlay is **full width**, not a centered floating panel.

Files:
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/styles.css` (`.overlay` width set to `100%`)

### 3) Home: remove invented features, use Spotify-native patterns

**Goal**: stop “new app” vibes; match Spotify Home’s structure.

Implemented:
- Home header uses a greeting (“Good morning/afternoon/evening”).
- Home content uses Spotify-esque patterns:
  - **Recently played** 2‑column tile grid
  - **Made for you** horizontal row of cards
  - **Recommended** list rows
- Removed the previous invented “Play Something New / Quick Moods / Current Suggestion” system.

Files:
- `src/ui/screens/DiscoverScreen.tsx`

### 4) Remove Support as a destination; move settings into a sheet

**Goal**: no “mode UI” or separate help/settings screen.

Implemented:
- Deleted `SupportScreen`.
- Added a **Settings sheet** overlay opened via Home header button.
- Moved **Manage Pinned** into the Library screen (top).

Files:
- Deleted: `src/ui/screens/SupportScreen.tsx`
- Added: `src/ui/overlays/SettingsSheet.tsx`
- Updated: `src/ui/App.tsx` (sheet mount + state)
- Updated: `src/ui/screens/LibraryScreen.tsx` (Pinned management)

### 5) Swipe-down gesture: primary entry to Command Palette

**Goal**: swipe-down from top to open palette (primary); icon remains secondary.

Implemented:
- Touch gesture detection on the `<main>` screen:
  - swipe start must be near the top
  - downward swipe threshold opens palette

Files:
- `src/ui/App.tsx`

### 6) Pinned: rows, not cards; place in all 3 required locations

**Goal**: pinned looks identical to Spotify content rows and appears:
- Top of Command Palette
- Top of Library
- Below queue in Now Playing

Implemented:
- Now Playing pinned section now renders **full-width rows** (not 84×84 cards).
- Library now has **Pinned** at the top with removal affordance.
- Command palette includes **Pinned** as the topmost section.

Files:
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/screens/LibraryScreen.tsx`
- `src/ui/screens/NowScreen.tsx`

Note:
- Pin icon is currently represented as a small **📌** marker in the row thumbnail; the spec calls for a small pin icon on the right. (Easy follow-up: add `pin` icon to `Icon.tsx` and place it on the right of pinned rows.)

### 7) “Where am I”: remove visible UI, keep as dev-only shortcut

**Goal**: stop duplicating screen reader output.

Implemented:
- Removed the ring/“Where am I” button from screen headers.
- Removed the “Where am I” action from the command palette list.
- Kept the underlying toast + Ctrl/⌘+W as a developer/testing affordance.

Files:
- `src/ui/components/HeaderBar.tsx` (supports avatar, custom icons; default ring no longer forced)
- `src/ui/screens/NowScreen.tsx`
- `src/ui/screens/SearchScreen.tsx`
- `src/ui/screens/LibraryScreen.tsx`
- `src/ui/overlays/CommandPalette.tsx`
- `src/ui/App.tsx`

### 8) Audio redundancy removed (directionally correct)

**Goal**: no “Playing…” / “Added…” spoken confirmations on taps.

State:
- The app still *calls* `speak()` in a few places (e.g. play/pause), but `src/ui/tts.ts` already guards most non-voice-input phrases.
- User-facing text was changed from “landmarks” to **pinned/unpinned** in App state updates.

Files:
- `src/ui/App.tsx` (strings updated: “pinned/unpinned”)
- `src/ui/tts.ts` (guard behavior)

### 9) Visual proportions & polish (applied)

Implemented:
- `index.html` title changed to **Spotify** (removes “Accessible Mode” label).
- Header height reduced (`.headerGradient` to ~140px).
- Typography scale corrected for Spotify-like list hierarchy:
  - `.title` → 16px / 20px line-height
  - `.subtitle` → 13px
  - `.navLabel` → 11px
- Tap targets improved:
  - `.miniIcon` → 44×44
  - Now controls non-primary → min height 56
- Album art container no longer uses centered “auto” margins; it respects padding-based layout.
- Overlay sheet is full-width.

Files:
- `index.html`
- `src/ui/styles.css`
- `src/ui/screens/NowScreen.tsx`

---

## Current structure (how to use the prototype)

- **Bottom tabs**: Home / Search / Your Library
- **Now Playing**: tap the mini-player
- **Command Palette**: swipe down from the top OR open via header affordance (where present)
- **Pinned**:
  - add pinned items via existing context-menu/long-press stubs in Search/Library rows
  - manage pinned at top of Library

---

## Known follow-ups (for “pixel perfect” + “real app smooth”)

These are not blockers for spec compliance, but they’re the most likely sources of “proportions feel off” feedback:

1) **Pin icon fidelity**
   - Replace the 📌 glyph with a Spotify-like pin SVG in `src/ui/components/Icon.tsx`
   - Place it on the **right** side of pinned rows (per spec)

2) **Command Palette motion fidelity**
   - Make it feel like Spotify’s search pull-down: tighter easing, overscroll behavior, no modal “backdrop” vibe
   - Consider using pointer events + spring-based animation (Framer Motion) for high fidelity

3) **Mini-player anchoring + “attached” feel**
   - Ensure it visually reads as part of the app chrome, not a floating element
   - Tune shadow/gradient and spacing around bottom nav

4) **Replace stub visuals that read “prototype”**
   - Placeholder album art and placeholder thumbnails should become Spotify-like skeletons (subtle shimmer, correct radii)

5) **Remove any remaining `speak()` calls that don’t match the voice-input/error-only rule**
   - Even if guarded, it’s better to remove the calls to avoid future regressions

---

## Code map (quick pointers)

- App routing + overlays: `src/ui/App.tsx`
- Bottom nav: `src/ui/components/BottomNavBar.tsx`
- Header system: `src/ui/components/HeaderBar.tsx`
- Command palette overlay: `src/ui/overlays/CommandPalette.tsx`
- Settings sheet overlay: `src/ui/overlays/SettingsSheet.tsx`
- Home: `src/ui/screens/DiscoverScreen.tsx`
- Search: `src/ui/screens/SearchScreen.tsx`
- Library (incl. Pinned management): `src/ui/screens/LibraryScreen.tsx`
- Now Playing: `src/ui/screens/NowScreen.tsx`
- Global styles/tokens: `src/ui/styles.css`
- TTS guard: `src/ui/tts.ts`

