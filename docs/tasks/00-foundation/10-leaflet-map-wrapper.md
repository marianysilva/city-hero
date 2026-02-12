# Leaflet Map Wrapper · OSM tiles + custom pins + clustering

> **Type:** Foundation · Map abstraction
> **Screen(s):** Home · Map (06), Public Works (26), Public Work Detail (27), and any future screen needing a map
> **Effort:** M (2 days)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `web`, `maps`, `frontend`, `foundation`

## Context

A reusable map component that renders OpenStreetMap tiles and accepts a list
of pins (with categories), the current user location, optional polygons
(public-works boundaries), and emits events for tap/drag interactions.

Two implementations are needed:

- **Web (Next.js admin)**: react-leaflet directly.
- **Mobile (React Native)**: use a maintained RN library (e.g., `react-native-leaflet-view` or a WebView-based wrapper) to render Leaflet, since react-native-maps targets Google/Apple Maps which don't fit OSM-first strategy.

Both expose the same prop API so callers don't care about the platform.

## User Story

**As a** Frontend Developer,
**I want** a single map component working on web and mobile,
**In order to** display reports, public works, and other geographic data without rewriting per platform.

**As a** Citizen,
**I want** to see issues and works on a familiar map,
**In order to** understand my neighborhood at a glance.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the Home screen
**When** the map mounts
**Then** OpenStreetMap tiles load centered on the user's location (with fallback to the city center)
**And** the user's location is marked with a pulsing dot
**And** the map can be panned and zoomed via touch gestures

### Scenario · Pin categories

**Given** the screen receives a list of report pins from the API
**When** the map renders
**Then** each pin uses a custom icon based on its category (pothole, trash, lighting, sidewalk, etc.)
**And** colors and emojis match the prototype's pin design
**And** "in progress" pins have a small overlay indicator

### Scenario · Pin tap

**Given** the user taps a pin
**When** the tap event fires
**Then** the map emits a `pinTapped` event with the pin ID
**And** the host screen handles the event (e.g., opens a bottom sheet with the report's summary)

### Scenario · Clustering at low zoom

**Given** there are many pins close together
**When** the user zooms out
**Then** pins cluster into a count-bubble
**And** tapping the cluster zooms in to a level where the cluster expands

### Scenario · Polygons (public works)

**Given** a public-work polygon is provided
**When** the map renders
**Then** the polygon is drawn with a soft fill and a labeled border
**And** it doesn't intercept pin taps inside it (unless pin tap is disabled)

### Scenario · Recenter on user

**Given** the user is panning around
**When** they tap the "recenter" floating button
**Then** the map smoothly animates back to the user's current location
**And** the zoom level returns to the configured default

### Scenario · Offline tiles (cached)

**Given** the user previously viewed a tile
**When** they open the map without connectivity
**Then** the cached tiles render
**And** uncovered areas show a low-contrast "offline" pattern

### Scenario · Accessibility

**Given** the user has screen reader on
**When** they swipe through map controls
**Then** focusable elements (recenter button, layer toggle) are reachable and labeled
**And** pins have alternative text indicating category and location

## Frontend (React Native + Web)

### Component location

```
packages/design_system/src/components/Map/
├── Map.tsx                  ← thin façade
├── Map.web.tsx              ← Next.js implementation
├── Map.native.tsx           ← React Native implementation
├── Map.types.ts
└── pinIcons.ts              ← custom pin renderers
```

The thin façade delegates to the platform-specific implementation via the bundler's `.web` / `.native` suffix resolution.

### Public API

The component receives:

- `center` (lat/lng) — initial center.
- `zoom` (number) — initial zoom.
- `pins` (array) — each with id, lat/lng, category, status, and optional label.
- `polygons` (array, optional) — each with id, geojson coordinates, fill, border.
- `userLocation` (lat/lng, optional) — the pulsing dot.
- Event callbacks: `onPinPress`, `onMapPress`, `onRegionChange`.

### Pin design

Pins follow the prototype's visual language: rounded "drop" shape (`50% 50% 50% 4px` rotated -45°) with a category emoji and a category color background. A small badge in the corner indicates "in progress" for pins with that status.

### Clustering

Use a clustering plugin compatible with both react-leaflet (web) and the chosen RN library. Cluster colors and sizes follow the design tokens.

### User location

The user location dot uses a CSS pulse animation. On mobile, it's reactive to GPS updates from `expo-location`.

### Performance

- Memoize pin rendering — re-render only when the pin list changes.
- Lazy-load tiles outside the viewport.
- Limit re-renders during pan/zoom (debounce `onRegionChange` to ~150ms).

## Backend (FastAPI)

The map component itself doesn't call backend, but typical hosts call:

| Endpoint                                                   | Purpose                                               |
|------------------------------------------------------------|-------------------------------------------------------|
| `GET /api/v1/reports?bbox=&category=&status=`              | Fetch reports within a bounding box, filtered.       |
| `GET /api/v1/public-works?bbox=`                           | Fetch public-work polygons.                          |

Both follow the standard error/pagination conventions and respect multi-tenant scoping. Bounding-box queries use PostGIS `ST_Intersects` against an indexed geometry column.

## Database

Reports and public-works tables include geometry columns indexed with GiST for fast bounding-box queries. Schema details are owned by the screens that create reports/works (07-photo-upload-pipeline plus screen tasks 06, 26).

## Edge Cases

- **No GPS permission**: fallback to the city's default center; show a banner offering to grant permission.
- **GPS sensor unavailable**: same as above.
- **Tile server down or rate-limited**: cached tiles render; uncovered areas show a placeholder.
- **Pin density extreme** (1000+ in a small area): clustering handles visual density; performance budget is enforced.
- **Map size = 0** (collapsed parent layout): the component re-measures on next layout pass.
- **Memory leaks on remount** (Leaflet's known issue): cleanup hook explicitly destroys the map instance on unmount.

## Privacy / LGPD

- The user's GPS coordinates are not transmitted to the OSM tile server beyond what the tile request implies (bounding box).
- For privacy-sensitive viewing modes (e.g., showing a denouncer's location publicly), the map jitters the location by a configurable radius.

## Analytics

| Event                       | When                              | Props                                  |
|-----------------------------|-----------------------------------|----------------------------------------|
| `map.pin_tapped`            | User taps a pin                   | `pin_id`, `category`                   |
| `map.recenter_pressed`      | User taps recenter button         | —                                      |
| `map.region_changed`        | Pan/zoom complete (debounced)     | `zoom`, `bbox`                         |

## Tests

- **Unit**: pin icon rendering per category; cluster forms when pin density is high; props update propagates.
- **Integration**: tap on pin emits the right event with the right ID; recenter animates back to user location.
- **Visual**: Storybook page with various pin sets and zoom levels.

## Definition of Done

- [ ] Map component with same prop API on web and mobile
- [ ] OSM tiles loading
- [ ] Custom pin icons per category
- [ ] Clustering at low zoom
- [ ] User location pulse
- [ ] Polygon support
- [ ] Recenter button
- [ ] Tile cache for offline viewing
- [ ] A11y tested
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references
- Leaflet: https://leafletjs.com/
- react-leaflet: https://react-leaflet.js.org/
- OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/
- expo-location: https://docs.expo.dev/versions/latest/sdk/location/

### Project context
- Prototype: `design/index.html` (Home map and public-works renderings using Leaflet)
- `CLAUDE.md`
