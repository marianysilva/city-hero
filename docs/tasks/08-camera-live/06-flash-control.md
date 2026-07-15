# Camera · Flash control

> **Type:** Screen feature · UI + camera config\
> **Screen:** SCREEN 08 · Camera with AI (live)\
> **Effort:** S (≤1 day)\
> **Dependencies:** `08-camera-live/01-render-camera-ui-base.md`,
> `08-camera-live/02-camera-permission.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A flash toggle on the camera's top bar that cycles through three modes: auto, on, off. Useful for
nighttime reporting (broken streetlights are a prime CityHero category) and dim indoor situations.
The state is remembered for the session but resets to "auto" on a new session — most users want the
camera to do the right thing by default.

## User Story

**As a** Citizen reporting at night,\
**I want** quick control over the flash,\
**In order to** capture clearly without fumbling.

## Acceptance Criteria

### Scenario · Default mode

**Given** the user opens the camera\
**When** the flash control renders\
**Then** the default mode is `auto` (system decides)\
**And** the icon reflects the auto state (lightning bolt with "A" annotation)

### Scenario · Tap to cycle

**Given** the user taps the flash button\
**When** the action runs\
**Then** the mode cycles in order: `auto` → `on` → `off` → `auto`\
**And** the icon updates to reflect each state (auto, filled bolt, struck-through bolt)\
**And** light haptic feedback fires

### Scenario · Capture honors the mode

**Given** the user has selected `on`\
**When** they tap the shutter\
**Then** the camera fires the flash during capture\
**And** the same applies to `auto` (only when needed) and `off` (never)

### Scenario · Devices without flash

**Given** a device has no flash (front-only or hardware-limited)\
**When** the camera screen mounts\
**Then** the flash button is hidden\
**And** the layout adjusts so the top bar remains balanced

### Scenario · Mode persists in session

**Given** the user set the mode to `off`\
**When** they capture a photo and return to capture another in the same session\
**Then** the mode remains `off`\
**And** if they close and reopen the camera, the mode resets to `auto`

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user focuses the flash button\
**Then** the current mode is announced ("Flash, automatic")\
**And** activating it announces the new mode

### Scenario · Low battery

**Given** the device is in low battery mode\
**When** the user picks `on`\
**Then** the camera library may refuse to fire the flash; the system surfaces a brief toast if
appropriate\
**And** the mode is honored as best the platform allows

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Camera/
├── components/
│   └── FlashToggle.tsx
└── hooks/
    └── useFlashMode.ts
```

### Behavior

- `useFlashMode` holds the current mode in component-scoped state and exposes a cycle function. It
  also reads the device's flash availability from the camera library.
- `FlashToggle` is a small icon-only button rendered in the camera top bar.
- The mode is passed to the camera library's capture API.

### Visual states

| Mode   | Icon                             |
| ------ | -------------------------------- |
| `auto` | ⚡ with a small "A" annotation   |
| `on`   | Filled ⚡                        |
| `off`  | ⚡ with a diagonal strikethrough |

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Camera library reports flash mode not supported on the current lens**: gracefully ignore the
  mode at capture; the user-facing mode stays as set.
- **Multiple back lenses (one with flash, one without)**: MVP uses the default lens; if lens
  switching is added later, the flash availability follows the lens.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                       | When                             | Props |
| --------------------------- | -------------------------------- | ----- |
| `camera.flash_mode_changed` | User cycles the mode             | `to`  |
| `camera.flash_unavailable`  | Device reports no flash hardware | —     |

## Tests

- **Unit**: mode cycles correctly; unavailable case hides the toggle; capture uses the right mode.
- **Snapshot**: each icon variant.
- **A11y**: button labeled and announces state changes.

## Definition of Done

- [ ] FlashToggle component
- [ ] `useFlashMode` hook
- [ ] Capture passes the mode to the camera library
- [ ] Unavailable-device case
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- react-native-vision-camera flash modes:
  https://react-native-vision-camera.com/docs/api/interfaces/CameraProps
- expo-camera flash mode: https://docs.expo.dev/versions/latest/sdk/camera/

### Project context

- Render UI base: `01-render-camera-ui-base.md`
- Capture / shutter: `04-capture-shutter.md`
- `CLAUDE.md`
