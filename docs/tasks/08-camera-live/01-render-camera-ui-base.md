# Camera · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 08 · Camera with AI (live)
> **Effort:** M (1-2 days)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout for the camera screen: a full-screen viewfinder, top
overlay with back button + anonymization indicator + flash button,
bottom overlay with the central shutter, and a contextual tip
("Enquadre o problema e toque para capturar"). Vignette gradients
(top and bottom) keep controls legible over any camera frame.

This task does not implement the camera feed itself (that's task 02
permission + the platform's camera library), the live AI detection
(task 03), or the capture (task 04) — but defines the slots they fill.

## User Story

**As a** Citizen tapping the camera FAB,
**I want** an immediately recognizable, full-screen camera UI,
**In order to** point and shoot without fumbling.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the camera (modal presentation)
**When** the screen renders
**Then** the status bar variant is `light` (white text/icons over a dark background)
**And** the viewfinder fills the entire screen behind the overlays
**And** a top vignette (140dp) and bottom vignette (190dp) provide contrast for controls
**And** the top overlay shows: back button (left), "ANONIMIZAÇÃO ATIVA" badge with pulsing green dot (center), flash toggle (right)
**And** the bottom overlay shows: a centered 80dp circular shutter button (white outer, dark inner ring)
**And** an info tip card sits above the shutter with brand-friendly copy

### Scenario · Top bar buttons

**Given** the screen is rendered
**When** the user taps the back button
**Then** the camera modal closes (delegates to the host screen)
**And** if the user taps the anonymization badge
**Then** a small modal explains the LGPD anonymization (delegated to task 07)
**And** if the user taps the flash button
**Then** the flash toggle action runs (delegated to task 06)

### Scenario · Tip card

**Given** the screen renders
**When** the tip card is visible
**Then** it shows two short lines: "Enquadre o problema e toque para capturar" and "Evite capturar dados sensíveis e expor pessoas"
**And** the card uses a translucent white background with a subtle border
**And** the tip dismisses after the first capture (or after 10s) and doesn't reappear that session

### Scenario · Modal presentation

**Given** the camera is opened from the bottom nav FAB or elsewhere
**When** the modal animates in
**Then** it slides up with a standard spring animation
**And** when dismissed, slides down
**And** the underlying screen (Home, Feed, etc.) is preserved beneath

### Scenario · Hardware back / swipe gesture

**Given** the camera is open
**When** the user presses Android back or swipes down
**Then** the modal closes (same as tapping back)

### Scenario · Notch and dynamic island

**Given** a device with a notch or dynamic island
**When** the screen renders
**Then** the top overlay respects the safe area inset
**And** controls are not occluded

### Scenario · No back camera available

**Given** an unusual device with no back camera
**When** the screen renders
**Then** the layout still renders cleanly (the empty viewfinder shows a placeholder message handled by task 02)

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the screen
**Then** the back button is labeled
**And** the anonymization badge is labeled and tappable
**And** the flash button is labeled with its current state
**And** the shutter button is labeled "Capturar foto"
**And** there's a hardware-button alternative for capture (volume buttons on Android, see DoD)

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/Camera/
├── CameraScreen.tsx
├── CameraScreen.styles.ts
├── CameraScreen.test.tsx
└── components/
    ├── CameraTopBar.tsx
    ├── CameraShutter.tsx
    └── CameraTipCard.tsx
```

### Component behavior

- `CameraScreen` is the modal root. It hosts the viewfinder placeholder (filled by the camera library in task 02) and the overlays.
- `CameraTopBar` is presentational with `onBack`, `onAnonymizationInfo`, `onFlashToggle` callbacks and a `flashState` prop.
- `CameraShutter` has a tap callback (`onCapture`) and a brief tap-down animation.
- `CameraTipCard` shows the tip; visibility is controlled by an internal timer + dismissal flag.

### Layout slots

The screen exposes named slots for the other tasks:

- `viewfinder` — the camera library renders here (task 02).
- `detection-overlay` — the AI bounding box renders here (task 03).
- `top-bar`, `bottom-controls`, `tip` — handled by this task.
- `error-overlay` — for permission denied / fallback screens (task 02 / 08).

### Theming

The screen always uses dark-on-light overlays regardless of the OS theme — the camera viewfinder is the dominant background.

## Backend

Not applicable to this task.

## Database

Not applicable.

## Edge Cases

- **Modal opened over a deeper modal stack**: the camera is always front-most; gestures don't leak to underlying screens.
- **Custom font not loaded**: fallback to system sans-serif until ready.
- **Memory pressure**: the camera screen's renders are lightweight; heavy work (AI, capture) is in subsequent tasks.

## Privacy / LGPD

The "ANONIMIZAÇÃO ATIVA" badge is a deliberate trust signal even before the user captures. The tip text reinforces the same message ("Evite capturar dados sensíveis e expor pessoas").

## Analytics

| Event                  | When                            | Props             |
| ---------------------- | ------------------------------- | ----------------- |
| `camera.opened`        | Modal mounts                    | `mode: new_report | enrich`  |
| `camera.back_pressed`  | User taps back / swipes down    | —                 |
| `camera.tip_dismissed` | Tip auto-hides or first capture | `via: timeout     | capture` |

## Tests

- **Unit**: renders all overlays; back button fires callback; shutter callback fires; tip auto-hides.
- **Snapshot**: light + dark variants of overlays.
- **A11y**: all interactive elements labeled; reading order correct.

## Definition of Done

- [ ] CameraScreen base layout
- [ ] CameraTopBar with all three controls
- [ ] CameraShutter with tap animation
- [ ] CameraTipCard with auto-hide
- [ ] Modal presentation
- [ ] Hardware back / swipe-down close
- [ ] Hardware-button capture alternative on Android (volume keys)
- [ ] Accessibility verified
- [ ] Tests passing
- [ ] Slots ready for tasks 02–09 to plug in

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Navigation modal presentation: https://reactnavigation.org/docs/modal/
- React Native Safe Area Context: https://github.com/th3rdwave/react-native-safe-area-context

### Project context

- Prototype: `design/index.html` (search `title: 'Câmera com IA (ao vivo)'`)
- `CLAUDE.md`
