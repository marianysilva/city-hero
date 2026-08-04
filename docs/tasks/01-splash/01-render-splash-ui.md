# Splash · Render UI (logo + branding + min duration)

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 01 · Splash / Welcome\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`\
> **Status:** 🟢 Done (this task only — 02-05 in this folder are still not started; no parent
> `onReady`/routing hand-off exists yet, see Definition of Done) —
> `apps/city-hero/src/screens/Splash` (`SplashScreen.tsx` +
> `components/AnimatedLogo.tsx`/`LoadingIndicator.tsx`), mounted at the app's `index` route (the
> stock Expo Router tab template — `(tabs)/`, `modal.tsx`, and their only consumers
> `EditScreenInfo`/`ExternalLink`/`useClientOnlyValue` — were removed as dead mock boilerplate,
> along with the now-unused `expo-symbols`/`expo-web-browser` dependencies). Uses
> `expo-linear-gradient` (newly added) for the logo mark's brand-orange → civic-purple gradient and
> the subtle brand-50 → white background gradient; entrance animation via Reanimated respects
> `useReducedMotion()`. Name/tagline render through `useTranslation()` (`common.appName`/
> `common.appTagline`), so the existing `EXPO_PUBLIC_DEFAULT_LOCALE` dev override
> (`00-foundation/13-i18n.md`) flips the splash between pt-BR/en-US on restart with no additional
> wiring — verified in a browser build with the env var toggled both ways. Telemetry
> (`splash.mounted`/`splash.timeout`/`splash.navigated`) is a `console.info` placeholder pending the
> real observability package (`00-foundation/20-observability-package.md`). **Diverges from the
> current prototype file** (`design/src/screens/01-splash.js`, which now shows confetti, 6 rotating
> taglines, and email/Gov.br CTA buttons for a later onboarding/login revision) — this
> implementation follows this task's own Acceptance Criteria instead (single static tagline, no
> CTAs, no routing logic), since tasks 02 (init sequence), 03 (routing decision), and the login
> screen's own task (`01a-login/02-email-password-auth.md`) own that behavior and aren't built yet.
> Not built: snapshot tests (no snapshot-testing convention exists yet in this repo) and the
> background-pause/resume animation edge case (listed under Edge Cases, not part of this task's
> Acceptance Criteria).\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The visual rendering of the Splash screen. No routing logic or checks — purely presentation. App
logo + name + tagline ("Sua cidade nas suas mãos") + subtle entrance animation.

It also enforces the **minimum display time** (800ms) to avoid the splash flickering when
initialization checks complete instantly.

## User Story

**As a** Citizen opening the app for the first time or returning after closing it,\
**I want** to see a loading screen with the CityHero brand,\
**In order to** confirm I opened the right app while it prepares.

## Acceptance Criteria

### Scenario · Default render

**Given** the app is initializing\
**When** the splash renders\
**Then** the CityHero logo appears centered with a brand-orange to civic-purple gradient\
**And** the name "CityHero" appears below the logo in extrabold weight\
**And** the tagline "Sua cidade nas suas mãos" appears below the name\
**And** the background is a subtle brand-50 to white gradient\
**And** the status bar variant is light (white text and icons)

### Scenario · Entrance animation

**Given** the app opened\
**When** the screen renders\
**Then** the logo fades in and scales from 0.85 to 1.0 over ~400ms\
**And** the name and tagline fade in and translate slightly upward, with a small delay after the
logo\
**And** the animation does not block the parent's initialization sequence

### Scenario · Minimum display time

**Given** the initialization sequence finished in under 800ms\
**When** the splash receives the "ready to navigate" signal\
**Then** navigation only happens after 800ms have elapsed since mount\
**And** if checks take longer than 800ms, navigation happens immediately when ready

### Scenario · Maximum time (timeout)

**Given** the initialization sequence has not finished within 5 seconds\
**When** the 5s threshold is reached\
**Then** the splash shows a discreet "Loading..." indicator below the tagline\
**And** continues waiting up to 10s total\
**And** after 10s, it forces navigation to Home with an `init_partial` flag\
**And** logs the telemetry event `splash.timeout`

### Scenario · System dark mode

**Given** the system is in dark mode\
**When** the splash renders\
**Then** color tokens follow the dark theme (background → deep slate, text → near-white)\
**And** the logo gradient remains the same (brand identity is constant)

### Scenario · Accessibility

**Given** screen reader is enabled\
**When** the splash renders\
**Then** the reader announces "CityHero. Sua cidade nas suas mãos. Loading."\
**And** the animation respects the user's reduce-motion preference (no scale or translate when on)

## Frontend (React Native / Expo)

### Component location

```
apps/city-hero/src/screens/Splash/
├── SplashScreen.tsx
├── SplashScreen.styles.ts
├── SplashScreen.test.tsx
└── components/
    ├── AnimatedLogo.tsx
    └── LoadingIndicator.tsx
```

### Component behavior

- The screen accepts a callback (`onReady`) provided by its parent (which is doing the init sequence
  in task 02). When called, it triggers the navigation hand-off, but only after the minimum display
  time has elapsed.
- The animated logo runs its entrance animation on mount. It checks the user's reduce-motion
  preference and skips animation when the preference is on.
- The loading indicator is hidden by default and appears only after a 5s threshold, signaling to the
  user that something is taking longer than expected.
- A hard timeout at 10s force-completes the splash with a partial-init flag, logged to telemetry for
  analysis.

### Constants

| Constant                 | Default | Purpose                                      |
| ------------------------ | ------- | -------------------------------------------- |
| `MIN_SPLASH_DURATION_MS` | 800     | Minimum on-screen time to register the brand |
| `SHOW_LOADING_AFTER_MS`  | 5000    | When to surface the loading indicator        |
| `HARD_TIMEOUT_MS`        | 10000   | When to force-navigate with partial state    |

### Animation

Use a Reanimated-based animation pipeline: shared values for opacity, scale, and translation; smooth
timing curves; cleanup on unmount.

### Accessibility

- Container is announced as a polite live region.
- A descriptive `accessibilityLabel` includes the brand, tagline, and "Loading" status.
- Reduce-motion preference is honored.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **App goes to background mid-splash**: pause the animation, resume from the same point on return.
- **Orientation change during splash**: the app is portrait-only; ignore.
- **Custom font not loaded**: fallback to system sans-serif until ready, without flicker.
- **Logo asset fails to load**: fallback to a bundled raster version.
- **Fatal error before mount**: handled by the global error boundary
  (`00-foundation/15-error-boundary.md`).

## Privacy / LGPD

Not applicable (no user data).

## Analytics

| Event              | When                                  | Props                  |
| ------------------ | ------------------------------------- | ---------------------- |
| `splash.mounted`   | On mount                              | `app_version`, `os`    |
| `splash.timeout`   | Hard timeout reached                  | `init_state` (partial) |
| `splash.navigated` | Just before handing off to navigation | `duration_ms`          |

## Tests

- **Unit**: renders logo, name, and tagline; the minimum display time is enforced even when the
  parent signals readiness immediately; reduce-motion preference disables animation; the loading
  indicator surfaces after the configured threshold.
- **Snapshot**: light and dark variants.
- **E2E**: cold start opens the app, splash is visible, navigates after a reasonable delay.

## Definition of Done

- [x] SplashScreen implemented matching this task's Acceptance Criteria (not the current prototype
      file's later onboarding/login revision — see Status)
- [x] Entrance animation
- [x] Minimum display time enforced
- [x] Conditional loading indicator after threshold
- [x] Hard timeout with telemetry (placeholder `console.info` pending
      `00-foundation/20-observability-package.md` — see Status)
- [x] Accessibility: live region, label, reduce-motion respected
- [x] Dark mode functional
- [x] Unit tests
- [ ] Snapshot tests — not built, no snapshot-testing convention exists yet in this repo
- [ ] Code review approved

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references

- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/
- Expo Font: https://docs.expo.dev/versions/latest/sdk/font/
- Accessibility Info (RN): https://reactnative.dev/docs/accessibilityinfo

### Project context

- Prototype: `design/index.html` (search `title: 'Splash / Boas-vindas'`)
- Design tokens: `00-foundation/02-design-tokens.md`
- `CLAUDE.md`
