# Manual Report · Mini-map location confirm + drag pin

> **Type:** Screen feature · UI + geo
> **Screen:** SCREEN 09 · Manual Report
> **Effort:** M (1-2 days)
> **Dependencies:** `09-manual-report/01-render-manual-ui-base.md`, `00-foundation/10-leaflet-map-wrapper.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `geo`

## Context

A small Leaflet preview map below the category grid showing the report's
location with a pin. The user can confirm or adjust the location by
dragging the pin (or tapping "Ajustar" to enter a full-screen map
mode). The map's accuracy matters here — this is the confirmation
moment before the report is submitted — so the foundation map wrapper
is used (real OSM tiles), not the stylized illustration of the
onboarding screens.

## User Story

**As a** Citizen confirming the report location,
**I want** a quick visual check and the ability to nudge the pin,
**In order to** correct any GPS imprecision before submitting.

## Acceptance Criteria

### Scenario · Default render with valid GPS

**Given** the user has a fresh fix
**When** the mini-map renders
**Then** the map is centered on the fix with a soft accuracy halo
**And** a pin marker shows at the fix's coordinates
**And** the address is displayed below the map ("R. São Pedro, 320 · Confirme ou arraste o pin")
**And** an "Ajustar" link is shown for full-screen adjustment

### Scenario · Drag the pin

**Given** the map is rendered with the pin
**When** the user drags the pin to a different position
**Then** the pin follows the drag
**And** on release, the address re-reverse-geocodes for the new position
**And** the report's coordinates update accordingly
**And** light haptic feedback fires on release

### Scenario · Tap "Ajustar"

**Given** the user wants a bigger map for precision
**When** they tap "Ajustar"
**Then** a full-screen map screen opens
**And** the same pin shows; the user can pan, zoom, and reposition with finer control
**And** "Confirmar" returns to the manual report screen with the new location
**And** "Cancelar" returns with the original location

### Scenario · Pin within city bounds

**Given** the user is dragging the pin
**When** the position is outside the active city's bounding box
**Then** a soft warning appears ("Fora de {city_name}")
**And** the user can still confirm (the server will reject if the report is meaningfully outside the city)
**And** the warning encourages reverting

### Scenario · No GPS available

**Given** the user has no location permission or no fix
**When** the mini-map renders
**Then** the map defaults to the active city's centroid with no pin
**And** a banner suggests granting location or manually dragging the pin to the actual location
**And** the user can drag-to-place

### Scenario · Reverse geocoding fails

**Given** the user drags the pin
**When** reverse geocoding fails (offline or backend error)
**Then** the address area shows the raw coordinates as a fallback
**And** a small retry affordance is shown
**And** the report can still be submitted (server-side geocoding will catch up)

### Scenario · Map tile cache

**Given** the user is offline
**When** the mini-map renders
**Then** cached tiles render where available
**And** uncovered areas show the foundation map's offline indicator

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the map area
**Then** the current address is announced
**And** an alternative input (e.g., a "Editar endereço" link) lets the user adjust without dragging
**And** the "Ajustar" link is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ManualReport/
├── components/
│   ├── MiniMap.tsx
│   └── AdjustMapScreen.tsx
└── hooks/
    └── useReportLocation.ts
```

### Behavior

- `useReportLocation` holds the report's coordinates (lat, lng), the address, and reverse-geocode state. It's the canonical source for the screen's CTA gating (location is required).
- `MiniMap` uses the foundation map wrapper (`00-foundation/10`) configured for compactness (smaller dimensions, fixed zoom).
- `AdjustMapScreen` is a full-screen modal also using the foundation map for finer control.

### Map configuration

The mini-map uses a slightly lower zoom than Home (e.g., 17 for street-level precision). The full-screen adjust map allows zooming up to the foundation's max.

### Pin drag

The foundation map's pin component supports drag if configured. The drag event surfaces to a callback that updates the report's coordinates.

## Backend (FastAPI)

This task does not introduce new backend endpoints — reverse geocoding can use the device's platform API (free, offline-capable) or an external geocoding service. For city-bound validation, the same logic as the cities catalog (`02-city-select/02`) applies — the city's bounding box is already cached client-side.

## Database

The `reports.geo`, `reports.address` columns are owned by the report-creation task and are populated from this screen's state at submit.

## Edge Cases

- **Pin off-screen after drag**: scroll the map to recenter on the new pin.
- **Snap-to-street option** (future enhancement): for urban accuracy. Not in MVP.
- **Drag in dense areas with overlapping pins**: only the report's own pin is interactive on this screen.

## Privacy / LGPD

- Coordinates and address travel with the report submission; no transmission outside that.
- The map's tile requests go to OSM tile servers; per OSM policy, no user identification.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `manual_report.pin_dragged`        | User dragged the pin                       | `delta_m`                             |
| `manual_report.adjust_opened`      | User opened full-screen adjust             | —                                     |
| `manual_report.outside_city_warning_shown` | Pin moved outside city            | —                                     |
| `manual_report.reverse_geocode_failed` | Reverse geocode error                  | `code`                                |

## Tests

- **Unit**: hook updates on drag; reverse geocode caches; CTA gating reflects location presence.
- **Integration**: drag pin → address updates; adjust screen confirm/cancel paths.
- **A11y**: map area announced; alternative input works.

## Definition of Done

- [ ] MiniMap component using the foundation map
- [ ] AdjustMapScreen full-screen mode
- [ ] `useReportLocation` hook
- [ ] Pin drag with haptic + reverse geocode
- [ ] City-bound warning
- [ ] Offline tile caching
- [ ] Accessibility alternative input
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- Leaflet pin draggable: https://leafletjs.com/reference.html#marker-draggable
- expo-location reverse geocode: https://docs.expo.dev/versions/latest/sdk/location/

### Project context
- Render UI base: `01-render-manual-ui-base.md`
- Foundation map wrapper: `00-foundation/10-leaflet-map-wrapper.md`
- Cities catalog (city bbox source): `02-city-select/02-cities-catalog-api.md`
- `CLAUDE.md`
