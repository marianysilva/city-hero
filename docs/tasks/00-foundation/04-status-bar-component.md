# Status Bar Component · Light/Dark variants with safe area

> **Type:** Foundation · Shared component\
> **Screen(s):** All\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`\
> **Status:** ✅ Done — `useStatusBarVariant` is implemented in
> `packages/design_system/src/hooks/useStatusBarVariant.ts` per spec: `light`/`dark`/`auto`
> (resolved from `useTheme().scheme`), applied via `expo-router`'s `useFocusEffect` using the
> current SDK 56 `expo-status-bar` API (`StatusBar.setStyle`/`setHidden`, not the deprecated pre-56
> names), with an `options.hidden` escape hatch for full-screen experiences. No Storybook story,
> matching `useTheme`/`useReducedMotion` (headless hooks, no visual output).
>
> **Deviation from the original spec, discovered during implementation**: `packages/design_system`
> is consumed by both `apps/city-hero` (Expo, has `expo-router`/`expo-status-bar`) and `apps/web`
> (Next.js, does not — and can't parse their native React Native source through Vite). Barrel-
> exporting the hook from `src/hooks/index.ts` (as the sibling hooks are) broke `apps/web`'s
> `__tests__/design-system.test.tsx` — confirmed via `git stash`, reproducing the failure on a clean
> tree with only the barrel export added. Fixed by NOT re-exporting the hook from the shared barrel
> (a comment in `hooks/index.ts` explains why) and instead adding a dedicated
> `@city-hero/design-system/hooks/useStatusBarVariant` subpath export — `apps/city-hero`-only.
> `expo-router`/`expo-status-bar` were added as optional `peerDependencies` (+ matching
> `devDependencies`, pinned to `apps/city-hero`'s versions) so the package's own `tsc`/`vitest` can
> resolve and mock them.
>
> That subpath is served by a **physical** file at
> `packages/design_system/hooks/useStatusBarVariant.ts` (re-exporting
> `../src/hooks/useStatusBarVariant`), not just a `package.json` `exports` map entry pointing into
> `src/`: Metro (`apps/city-hero`'s bundler) doesn't enable `unstable_enablePackageExports` for
> client bundles by default, so it falls back to classic resolution — a literal
> `hooks/useStatusBarVariant.*` file relative to the package root. Verified empirically, not just by
> static analysis: temporarily wired the hook into `apps/city-hero/app/_layout.tsx`, ran
> `npx expo export -p web`, confirmed a clean 1331-module bundle with the hook's code present in the
> output, then reverted the temporary wiring (`git diff` on `_layout.tsx` is clean).
>
> **Wired into both screens that exist today**: `SplashScreen.tsx` (`useStatusBarVariant('light')` —
> fixed, since its background is high-contrast/saturated in both themes) and `LoginScreen.tsx`
> (`useStatusBarVariant('auto')` — its background genuinely flips per theme), replacing each
> screen's own hand-rolled `<StatusBar style={...} />` (`expo-status-bar`'s declarative component;
> Login's inline `scheme === "dark" ? "light" : "dark"` ternary was literally the same logic `auto`
> now centralizes). Verified: `npx turbo run lint typecheck test` (16/16), `apps/city-hero`'s own
> `npx jest` (11 suites/53 tests), and `./scripts/test-e2e-mobile.sh` against a real
> `expo start --web` (11/11, including per-theme background assertions and Splash↔Login navigation)
> all pass. `LoginScreen.test.tsx`/`SplashScreen.test.tsx` mock `expo-router`'s `useFocusEffect` as
> always-focused (a plain effect) since these are standalone unit tests with no real navigation
> container — real focus/blur semantics are covered by the hook's own dedicated test suite instead.
> "Used by all screens in the app" now holds for the two screens that exist; screens added later
> (07-civic-feed, etc.) pick this up as part of their own task, not a gap in this one.\
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

- **Unit** (implemented with `renderHook` from `@testing-library/react`, not
  `@testing-library/react-native` as originally written here — `testing-strategy.md`'s own
  "Frontend" section is explicit that `packages/design_system` runs on Vitest + RTL, since it
  renders through `react-native-web`, never native RN; `@testing-library/react-native` is
  `apps/city-hero`'s Jest-only tool. `expo-router` and `expo-status-bar` are mocked with `vi.mock`):
  calling the hook with each variant triggers the expected `expo-status-bar` imperative call
  (`StatusBar.setStyle`/`StatusBar.setHidden`, mocked); `auto` resolves the correct style from a
  real `<ThemeProvider>` for both light and dark theme; never gaining focus (including through
  unmount) triggers no orphan call; a dependency change while focused re-applies without needing to
  regain focus.
- **Integration**: two screens using the hook with different variants, both kept mounted throughout
  (matching `react-native-screens`' real behavior of never unmounting a screen just because it lost
  focus) — focusing each in turn applies its variant, and blurring the top one restores the
  underlying screen's variant, with neither ever remounting. The `expo-router` mock models real
  `focus`/`blur` events (not mount/unmount as a stand-in) specifically so this scenario is faithful.
- **Manual/visual**: no Storybook story is required — this ships as a headless hook with no visual
  output, consistent with `useTheme`/`useReducedMotion` (neither has a `.stories.tsx` sibling in
  `packages/design_system/src/hooks/` today). Verify the two documented reference states manually:
  Splash's dark gradient background (light status bar) and Civic Feed's white background (dark
  status bar).

## Definition of Done

- [x] `useStatusBarVariant` hook implemented in `packages/design_system/src/hooks/`
- [x] Focus-effect-based application via `expo-router`'s `useFocusEffect` (auto-apply on screen
      focus, restore previous variant on blur) — holds for any screen/overlay that is its own
      `expo-router` route (see the code comment on the hook for the precondition; an in-tree overlay
      component, not a routed one, would not get the restore-on-blur behavior for free)
- [x] Auto mode honors the active theme (`useTheme()`)
- [x] Uses the current SDK 56 `expo-status-bar` imperative API (`setStyle`/`setHidden`), not the
      renamed pre-56 `setStatusBarStyle`/`setStatusBarHidden` names
- [x] No Storybook story (headless hook — see Tests section); manual QA of the visual variants is
      covered by `./scripts/test-e2e-mobile.sh`'s per-theme background-color assertions on Splash
      and Login (real `expo start --web`, not a mock)
- [x] Unit tests passing
      (`cd packages/design_system && npx vitest run src/hooks/useStatusBarVariant.test.tsx` — 9/9;
      `cd apps/city-hero && npx jest` — 11 suites/53 tests; full `npx turbo run lint typecheck test`
      also green across the monorepo)
- [x] Used by all screens in the app — Splash and Login, the two that exist today; see Status above

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
