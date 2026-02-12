# Status Bar Component · Light/Dark variants with safe area

> **Type:** Foundation · Shared component
> **Screen(s):** All
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `component`, `foundation`

## Context

A wrapper component that handles the system status bar appearance per screen
— light/dark variant — and respects safe area insets (notch, dynamic island).
It manages the system bar style during navigation transitions so each screen
can declaratively own its preferred variant without manually toggling on
focus/blur events.

The prototype shows two visual states (`statusBar('light')` / `statusBar('dark')`)
controlling the color of system text and icons.

## User Story

**As a** Mobile Developer,
**I want** a single component to control status bar appearance per screen,
**In order to** avoid mismatch between screen background and system bar text color.

## Acceptance Criteria

### Scenario · Light status bar (dark background)

**Given** a screen with a dark background (e.g., Splash with brand gradient)
**When** the screen mounts
**Then** the status bar text/icons render in white
**And** the system bar background blends with the screen header (no visible seam)

### Scenario · Dark status bar (light background)

**Given** a screen with a white/light background (e.g., Civic Feed)
**When** the screen mounts
**Then** the status bar text/icons render in dark gray
**And** the system bar background appears white

### Scenario · Transition between screens

**Given** the user navigates from a dark-status-bar screen to a light one
**When** the navigation animation runs
**Then** the status bar fades to the new variant during the transition (~200ms)
**And** there is no flash of the wrong color

### Scenario · Modal overlay

**Given** a modal opens above a screen
**When** the modal mounts
**Then** the modal can override the status bar style independently
**And** when the modal closes, the underlying screen's status bar variant is restored

### Scenario · Translucent status bar (Android)

**Given** the app runs on Android
**When** any screen renders
**Then** the status bar is translucent and the screen content can extend behind it
**And** content respects the device's top safe area inset

## Frontend (React Native / Expo)

### Component location

```
packages/design_system/src/components/StatusBar/
├── StatusBar.tsx
├── StatusBar.types.ts
└── StatusBar.test.tsx
```

### Component behavior

- Receives a variant prop with values `light`, `dark`, or `auto`. `auto` chooses based on the active theme color scheme.
- Optionally accepts a translucent flag (Android only) and a hidden flag (full-screen experiences like the Camera).
- Applies the variant when the screen receives navigation focus and reverts on blur, so navigation between screens always reflects the focused screen's preference.
- Renders nothing visually — it's a side-effect component that delegates to the platform's status bar APIs.
- Does **not** add padding for the safe area; that's the host screen's job using a safe-area inset hook.

### Variant behavior

- `light` → white text/icons.
- `dark` → near-black text/icons.
- `auto` → derived from the active theme's color scheme (dark mode → light status bar, and vice versa).

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Two stacked screens with different variants**: the focused (top-of-stack) screen wins.
- **Screen unmounts before its variant applies**: cleanup on focus-effect ensures no orphan state.
- **System notification banner appears**: status bar style is preserved (system handles).
- **Camera modal full-screen**: pass `hidden` to hide the status bar.
- **No focus context (root render)**: a sensible default (auto) is used until a screen takes focus.

## Privacy / LGPD

Not applicable.

## Analytics

Not applicable (purely visual).

## Tests

- **Unit**: renders correctly for each variant; auto resolves based on color scheme.
- **Integration**: changing focus between screens swaps the variant.
- **Visual**: Storybook page with both variants on contrasting backgrounds.

## Definition of Done

- [ ] StatusBar component implemented in `packages/design_system`
- [ ] Focus-effect-based application (auto-apply on screen focus)
- [ ] Auto mode honors the active theme
- [ ] Storybook page with all variants
- [ ] Unit tests passing
- [ ] Used by all screens in the app

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- Expo Status Bar: https://docs.expo.dev/versions/latest/sdk/status-bar/
- Safe Area Context: https://github.com/th3rdwave/react-native-safe-area-context
- React Navigation focus effect: https://reactnavigation.org/docs/use-focus-effect

### Project context
- Prototype: `design/index.html` (search `statusBar(`)
- `CLAUDE.md`
