# Camera · Fallback to Manual Report

> **Type:** Screen feature · Resilience
> **Screen:** SCREEN 08 · Camera with AI (live)
> **Effort:** S (≤1 day)
> **Dependencies:** `08-camera-live/01-render-camera-ui-base.md`, `08-camera-live/02-camera-permission.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `resilience`

## Context

The camera screen is the primary capture path, but several conditions
can make it unusable: permission denied, hardware unavailable, AI fails
to detect anything across a long session, or the user simply prefers to
type things out. The **Manual Report** screen (SCREEN 09) is the always-
available fallback: pick a category from a list, drop a pin on a map,
add an optional photo, write a description.

This task ensures that fallback is **discoverable from every dead-end**
on the camera screen — never a "stuck" state.

## User Story

**As a** Citizen unable to use the camera (denied, broken, AI doesn't recognize),
**I want** a clear path to report manually,
**In order to** not lose the moment.

## Acceptance Criteria

### Scenario · Permission denied → fallback CTA

**Given** the camera permission was denied
**When** the denied overlay appears (per `02-camera-permission.md`)
**Then** one of the CTAs is "Reportar sem foto" / "Report without photo"
**And** tapping it navigates to the Manual Report screen
**And** the camera modal closes

### Scenario · Hardware unavailable → fallback CTA

**Given** the device has no camera
**When** the screen shows the hardware-unavailable overlay
**Then** the primary CTA is "Reportar sem foto"
**And** tapping it navigates to the Manual Report screen

### Scenario · No detection for a long time

**Given** the user has the viewfinder active and no AI detection has fired for ~30 seconds (despite movement / scene changes)
**When** the no-detection hint persists
**Then** the hint expands to suggest the fallback ("Não reconhecemos · escolher manualmente?")
**And** tapping the suggestion opens Manual Report with the camera's captured location attached (if available)

### Scenario · User explicitly opts out

**Given** the camera is running normally
**When** the user taps a small "Manual" or "Sem IA" affordance (e.g., long-press on the shutter, or a small link on the tip card)
**Then** Manual Report opens with the current location and any in-progress photo discarded

### Scenario · Manual Report inherits camera state

**Given** the user is in `enrich` mode (task 09) and falls back to manual
**When** Manual Report opens
**Then** it's still in enrich mode (attached to the existing report)
**And** the user picks category / writes description as needed
**And** the photo (if any) goes through the standard upload + anonymization pipeline

### Scenario · Manual Report doesn't strand the user

**Given** the user falls back to Manual Report and decides to try the camera again
**When** they tap "Tentar câmera" on Manual Report
**Then** they return to the camera modal in the prior state (permission still denied if applicable; or fresh if granted)

### Scenario · Accessibility

**Given** screen reader is on
**When** any fallback CTA appears
**Then** it's clearly labeled and announces its destination ("Report without photo, opens manual report screen")

## Frontend (React Native)

### Where it lives

The fallback affordances live in components owned by other tasks (the denied overlay from task 02, the no-detection hint from task 03, etc.). This task wires them to a shared navigation hook:

```
apps/mobile/src/screens/Camera/
└── hooks/
    └── useFallbackToManual.ts
```

### Behavior

- `useFallbackToManual` exposes a single navigation function that:
  - Closes the camera modal cleanly.
  - Opens the Manual Report screen, passing any context: the camera's mode (`new_report` / `enrich`), the location fix (if any), and an in-progress photo (almost never, since fallback usually happens before capture).
- The function is called from multiple places — keeping it centralized ensures consistent behavior and analytics.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **User falls back, then realizes they want to try the camera again**: returning to the camera reopens fresh; any partial Manual Report state is preserved as a draft if the user navigates back.
- **Fallback during the AI-loading window**: the user can skip the wait; manual entry is available immediately.
- **Fallback removes pressure on the user to enable permissions**: ensure the user doesn't feel forced to grant camera permission to use the app at all.

## Privacy / LGPD

- Manual Report can accept a gallery photo, but per anti-fraud, any gallery photo is flagged for moderation (per `docs/user-stories.md` Anti-Spoofing & GPS Validation).
- No additional permissions are required for Manual Report beyond what the user already granted.

## Analytics

| Event                                      | When                                       | Props                                |
|--------------------------------------------|--------------------------------------------|---------------------------------------|
| `camera.fallback_to_manual_offered`        | A CTA appears                              | `from_state`                          |
| `camera.fallback_to_manual_pressed`        | User chose fallback                        | `from_state`, `had_photo: bool`      |

## Tests

- **Unit**: navigation function passes the right context; mode is preserved.
- **Integration**: from each entry point (permission denied, hardware unavailable, long no-detection, explicit opt-out), the fallback works correctly.
- **E2E**: simulate permission denied → choose fallback → land on Manual Report with the correct mode.

## Definition of Done

- [ ] `useFallbackToManual` shared hook
- [ ] Wired from all relevant components / states
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Manual Report screen: `docs/tasks/09-manual-report/`
- Render UI base: `01-render-camera-ui-base.md`
- Camera permission: `02-camera-permission.md`
- Live AI detection (no-detection state): `03-live-ai-detection.md`
- Enrich mode: `09-enrich-mode.md`
- `CLAUDE.md`
