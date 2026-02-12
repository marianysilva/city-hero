# Home · User location pulse + recenter button

> **Type:** Screen feature · Geo + UX
> **Screen:** SCREEN 06 · Home · Hyperlocal Map
> **Effort:** S (≤1 day)
> **Dependencies:** `06-home-map/02-map-integration-with-pins.md`, `05-onboarding-neighborhood/02-location-permission.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `geo`

## Context

A pulsing dot on the map showing the user's current GPS location, plus a
small floating "recenter" button that smoothly animates the map back to
the user's position. Both depend on location permission having been
granted (asked during onboarding step 5 or later in Settings).

When permission is not granted, the user dot is hidden and the recenter
button takes the user to the active city's centroid instead.

## User Story

**As a** Citizen using the map,
**I want** to see where I am and easily return to my location,
**In order to** stay oriented while exploring or after panning around.

## Acceptance Criteria

### Scenario · Permission granted, GPS available

**Given** location permission is granted and a fresh fix is available
**When** the map renders
**Then** a pulsing blue dot appears at the user's coordinates
**And** the dot updates as the user moves (subscribed to location changes)
**And** a recenter button floats in a corner of the map (e.g., bottom-right above the bottom nav)

### Scenario · Permission granted, no fix yet

**Given** the OS hasn't returned a fix yet (still acquiring)
**When** the map renders
**Then** no dot appears yet
**And** the dot fades in once the first fix arrives

### Scenario · Permission denied

**Given** the user denied location permission
**When** the map renders
**Then** no user dot is shown
**And** the recenter button still appears, but it recenters to the active city's centroid
**And** the recenter button has a small "no location" hint icon

### Scenario · Recenter tap

**Given** the user has panned away from their location
**When** they tap the recenter button
**Then** the map smoothly animates back to the user's coordinates (or city centroid if no GPS)
**And** the zoom level returns to the configured default (e.g., 16)
**And** light haptic feedback fires

### Scenario · Recenter tap when already centered

**Given** the user is already centered (within a small threshold)
**When** they tap recenter
**Then** the map performs a small "wiggle" animation as feedback
**And** the zoom returns to default if it had been changed

### Scenario · Permission requested from this screen

**Given** the user denied permission earlier and tapped the "no location" hint icon
**When** the action runs
**Then** the OS permission dialog reappears (or system settings if permanent)

### Scenario · Battery saver / low accuracy mode

**Given** the OS is in low-accuracy mode
**When** location updates arrive
**Then** the dot still renders (with reduced precision visualized as a slightly larger uncertainty halo)
**And** UX continues to work

### Scenario · Background to foreground

**Given** the user backgrounds the app and returns
**When** the screen resumes
**Then** location subscription is re-established if needed
**And** the dot updates to the latest fix

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the recenter button
**Then** it's labeled with the action ("Recenter map on my location")
**And** the user-location dot itself is not focusable (it's a passive indicator)

## Frontend (React Native / Expo)

### Where it lives

```
apps/mobile/src/screens/Home/
├── components/
│   └── RecenterButton.tsx
└── hooks/
    └── useUserLocationStream.ts
```

### Behavior

- `useUserLocationStream` subscribes to location updates with a configured update distance (e.g., 10m) and accuracy mode (Balanced). It returns the current `userLocation` (lat/lng) or `null` if unavailable.
- The user-location prop is passed to the foundation Map component (which renders the pulsing dot internally).
- `RecenterButton` is a small floating button. On tap, it calls a callback exposed by the map wrapper to animate to a target.

### Performance

Location updates trigger React state changes; debouncing/throttling avoids excessive re-renders.

### Resource usage

- Subscription is paused when the screen is in background.
- The stream is cleaned up on unmount.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Stale fix**: ignore fixes older than a few minutes.
- **GPS spoofing detection (anti-fraud)**: not in this task; lives in the report-creation flow (foundation 09 / future tasks). Here, the location is informational only.
- **Map not yet initialized**: the recenter button is disabled until the map is ready.
- **Tile cache covers the user's area but the map hasn't rendered them yet**: a tile-load shimmer is acceptable while tiles arrive.

## Privacy / LGPD

- Coordinates are used only on-device for display and recentering. **They are not transmitted to the backend in this task.**
- The user can disable location any time in OS settings; the dot disappears immediately.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `home.recenter_pressed`        | User taps recenter                         | `had_location: bool`                  |
| `home.location_unavailable`    | Permission denied or no fix on render      | `reason: denied|acquiring|disabled`  |

## Tests

- **Unit (frontend)**: hook subscribes/unsubscribes correctly; recenter button fires the right callback.
- **Integration**: granted permission yields a dot; recenter animates to the fix; denied permission falls back to centroid.
- **E2E**: simulate a user panning away and tapping recenter.

## Definition of Done

- [ ] User location subscription hook
- [ ] User-location prop wired to the Map
- [ ] Recenter button with animation hook
- [ ] Behavior for granted/denied/acquiring states
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- expo-location: https://docs.expo.dev/versions/latest/sdk/location/
- React Native AppState (for background pause): https://reactnative.dev/docs/appstate

### Project context
- Map integration: `02-map-integration-with-pins.md`
- Foundation map wrapper: `00-foundation/10-leaflet-map-wrapper.md`
- Onboarding location permission: `05-onboarding-neighborhood/02-location-permission.md`
- `CLAUDE.md`
