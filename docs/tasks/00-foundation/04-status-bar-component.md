# Status Bar Component · Light/Dark variants with safe area

> **Type:** Foundation · Shared component\
> **Screen(s):** All\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `component`, `foundation`

## Context

A shared hook (`useStatusBarVariant`, see Frontend section) that handles the system status bar
appearance per screen — light/dark variant — and respects safe area insets (notch, dynamic island).
It manages the system bar style during navigation focus changes so each screen can declaratively own
its preferred variant without manually wiring focus/blur listeners itself.

The prototype shows two visual states (`statusBar('light')` / `statusBar('dark')`) controlling the
color of system text and icons.

## User Story

**As a** Mobile Developer,\
**I want** a single hook to control status bar appearance per screen,\
**In order to** avoid mismatch between screen background and system bar text color.

## Acceptance Criteria

### Scenario · Light status bar (dark background)

**Given** a screen with a dark background (e.g., Splash with brand gradient)\
**When** the screen mounts\
**Then** the status bar text/icons render in white\
**And** the system bar background blends with the screen header (no visible seam)

### Scenario · Dark status bar (light background)

**Given** a screen with a white/light background (e.g., Civic Feed)\
**When** the screen mounts\
**Then** the status bar text/icons render in dark gray\
**And** the system bar background appears white

### Scenario · Transition between screens

**Given** the user navigates from a dark-status-bar screen to a light one\
**When** the navigation animation runs\
**Then** the status bar fades to the new variant during the transition (~200ms)\
**And** there is no flash of the wrong color

### Scenario · Modal overlay

**Given** a modal opens above a screen\
**When** the modal mounts\
**Then** the modal can override the status bar style independently\
**And** when the modal closes, the underlying screen's status bar variant is restored

### Scenario · Edge-to-edge status bar (Android)

**Given** the app runs on Android\
**When** any screen renders\
**Then** the app draws edge-to-edge behind the status bar by default (Android's enforced
edge-to-edge display as of Expo SDK 54+ — `expo-status-bar`'s `translucent` and `backgroundColor`
props are deprecated no-ops on this SDK line and must not be relied on)\
**And** content respects the device's top safe area inset via `react-native-safe-area-context`,
which is now required rather than optional now that translucent-by-toggle is gone

## Frontend (React Native / Expo)

### Component location

Per [`component-inventory.md`](../../engineering/component-inventory.md)'s Hooks table, the
canonical deliverable is the **`useStatusBarVariant` hook** (not a rendered component in
`atoms`/`organisms`) — it has no visual output, so it belongs with the other behavior hooks:

```
packages/design_system/src/hooks/
├── useStatusBarVariant.ts
└── useStatusBarVariant.test.ts
```

A screen calls it directly; there is no separate `<StatusBar>` wrapper component to import (the task
title "Status Bar Component" refers to this hook-based unit, consistent with `useReducedMotion` and
`useTheme` living in the same folder).

### Hook behavior

- Signature:
  `useStatusBarVariant(variant: 'light' | 'dark' | 'auto', options?: { hidden?: boolean })`. `auto`
  resolves from the design system's active theme via `useTheme()` (dark theme → light status bar
  icons, and vice versa).
- Applies the variant with `useFocusEffect` imported from **`expo-router`** (not
  `expo-router/react-navigation`, which only re-exports a deprecated shim, and not
  `@react-navigation/native` directly — `expo-router`'s own export is typed against the app's route
  tree). On focus it applies the variant; the cleanup function returned from the effect callback
  restores whatever the previously-focused screen wanted, so stacked screens don't fight over the
  bar.
- Internally calls `expo-status-bar`'s current imperative API: `StatusBar.setStyle(style, animated)`
  for the `light`/`dark` color, and `StatusBar.setHidden(hidden, animation)` when `options.hidden`
  is set (full-screen experiences like the Camera modal). These are the SDK 56 method names — older
  Expo docs/tutorials refer to `setStatusBarStyle`/`setStatusBarHidden`, which were renamed; do not
  use the old names against this SDK line (`apps/city-hero` pins `expo-status-bar: ~56.0.4`).
- Does **not** add padding for the safe area; that's the host screen's job via
  `react-native-safe-area-context`'s `useSafeAreaInsets`.
- Does **not** set `translucent` or `backgroundColor` — both are deprecated no-ops on Android from
  Expo SDK 54+'s enforced edge-to-edge display (see the Edge Cases and Acceptance Criteria
  sections); there is nothing for this hook to toggle there anymore.

### Variant behavior

- `light` → white text/icons (`StatusBar.setStyle('light', animated)`).
- `dark` → near-black text/icons (`StatusBar.setStyle('dark', animated)`).
- `auto` → derived from the active theme's color scheme (dark mode → light status bar, and vice
  versa).

## Backend

Not applicable — purely client-side presentation logic, no server interaction.

## Database

Not applicable — no persisted state; the active variant is derived at render time from the focused
screen's props and the current theme, never stored.

## Edge Cases

- **Two stacked screens with different variants**: the focused (top-of-stack) screen wins.
- **Screen unmounts before its variant applies**: cleanup on focus-effect ensures no orphan state.
- **System notification banner appears**: status bar style is preserved (system handles).
- **Camera modal full-screen**: pass `hidden` to hide the status bar.
- **No focus context (root render)**: a sensible default (auto) is used until a screen takes focus.

## Privacy / LGPD

Not applicable — the component/hook renders no UI and holds no user or citizen data; it only toggles
system status bar chrome.

## Analytics

Not applicable (purely visual).

## Tests

- **Unit** (`renderHook` from `@testing-library/react-native`, per `testing-strategy.md`): calling
  the hook with each variant triggers the expected `expo-status-bar` imperative call
  (`StatusBar.setStyle`/`StatusBar.setHidden`, mocked); `auto` resolves the correct style from a
  mocked `useTheme()` for both light and dark theme; unmounting before the focus effect fires
  triggers no orphan call.
- **Integration**: two screens using the hook with different variants, mounted inside an
  `expo-router` stack — focusing each in turn applies its variant and restores the previous one on
  blur.
- **Manual/visual**: no Storybook story is required — this ships as a headless hook with no visual
  output, consistent with `useTheme`/`useReducedMotion` (neither has a `.stories.tsx` sibling in
  `packages/design_system/src/hooks/` today). Verify the two documented reference states manually:
  Splash's dark gradient background (light status bar) and Civic Feed's white background (dark
  status bar).

## Definition of Done

- [ ] `useStatusBarVariant` hook implemented in `packages/design_system/src/hooks/`
- [ ] Focus-effect-based application via `expo-router`'s `useFocusEffect` (auto-apply on screen
      focus, restore previous variant on blur)
- [ ] Auto mode honors the active theme (`useTheme()`)
- [ ] Uses the current SDK 56 `expo-status-bar` imperative API (`setStyle`/`setHidden`), not the
      renamed pre-56 `setStatusBarStyle`/`setStatusBarHidden` names
- [ ] No Storybook story (headless hook — see Tests section); manual QA covers the visual variants
- [ ] Unit tests passing
- [ ] Used by all screens in the app

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Expo Status Bar (verified current for SDK 56, including the `setStyle`/`setHidden` rename and the
  Android edge-to-edge deprecation of `translucent`/`backgroundColor`):
  https://docs.expo.dev/versions/latest/sdk/status-bar/
- Expo Router `useFocusEffect` (import from here, not `expo-router/react-navigation` or
  `@react-navigation/native` directly — this is the correctly-typed export for the app's route
  tree): https://docs.expo.dev/router/reference/hooks/
- Safe Area Context: https://github.com/th3rdwave/react-native-safe-area-context
- React Navigation focus effect (background only — the underlying mechanism `expo-router` wraps;
  don't import from here directly in this codebase):
  https://reactnavigation.org/docs/use-focus-effect

### Project context

- Prototype: `design/index.html` (search `statusBar(`)
- `CLAUDE.md`
