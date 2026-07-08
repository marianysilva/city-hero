# Public Works List · Mini map preview

> **Type:** Screen feature · UI + geo
> **Screen:** SCREEN 26 · Public Works List
> **Effort:** M (1-2 days)
> **Dependencies:** `26-public-works-list/01-render-works-ui-base.md`, `00-foundation/10-leaflet-map-wrapper.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `geo`

## Context

A small map preview at the top of the screen (~140-180dp tall) showing all active works as colored pins (color per status). The user's location is shown as a pulse. Tapping a pin scrolls the list below to the corresponding row. Tapping the map area itself toggles to full-screen map mode (via task 01's toggle).

## Acceptance Criteria

### Scenario · Default render

**Given** active works exist
**When** the preview renders
**Then** a compact map fills the slot
**And** pins appear color-coded per status
**And** if the user has location, a pulse dot shows their position
**And** the map auto-fits to show all pins (or zooms to user's neighborhood)

### Scenario · Tap a pin

**Given** the user taps a pin
**When** the action runs
**Then** the list scrolls to the corresponding row (and highlights it briefly)
**And** the map slightly zooms on the tapped pin

### Scenario · Tap map area (not pin)

**Given** the user wants the full map view
**When** they tap an empty area
**Then** the screen toggles to full-screen map mode (per task 01)

### Scenario · No works

**Given** no active works
**When** the preview renders
**Then** the map shows the city centroid with a soft empty hint
**And** the user can still browse the empty list below

### Scenario · Filter applied

**Given** the user picked a filter (task 03)
**When** the preview re-renders
**Then** only matching works' pins appear

### Scenario · Real-time updates

**Given** a work is added/updated
**When** the WS pushes it
**Then** the pin appears/updates on the map

### Scenario · Accessibility

**Given** SR is on
**When** the map is focused
**Then** a summary is announced ("12 active works on the map")
**And** an alternative button "View list" is accessible

## Frontend

```
apps/city-hero/src/screens/PublicWorks/
└── components/
    └── WorksMapPreview.tsx
```

Uses the foundation map component with compact configuration.

## Backend

Active works query (per task 04) provides the list with lat/lng.

## Database

`public_works.geo` (PostGIS Point) is indexed.

## Edge Cases

- **User outside the city**: map centers on city centroid.
- **Dense pin clusters**: clustering applies.

## Privacy / LGPD

Public data; no PII.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `public_works.map_pin_tapped`      | User tapped a pin                          | `work_id`                             |
| `public_works.map_area_tapped`     | User tapped empty area                     | —                                     |

## Tests

- **Unit**: pin rendering by status; tap behavior.
- **Integration**: filter changes update pins.
- **A11y**: map summary read; alternative view accessible.

## Definition of Done

- [ ] WorksMapPreview component
- [ ] Foundation map integration
- [ ] Pin tap → scroll list
- [ ] Status color tokens
- [ ] Real-time updates
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Foundation map: `00-foundation/10-leaflet-map-wrapper.md`
- `CLAUDE.md`
