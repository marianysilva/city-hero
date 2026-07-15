# Leaflet Map Wrapper · OSM tiles + custom pins + clustering

> **Type:** Foundation · Map abstraction\
> **Screen(s):** Home · Map (06), Public Works (26), Public Work Detail (27), and any future screen
> needing a map\
> **Effort:** M (2 days)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/05-api-client.md`,
> `00-foundation/17-docker-dev-environment.md` (provides the PostGIS-enabled Postgres the
> bbox-filtered endpoints below require)\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `web`, `maps`, `frontend`, `foundation`

## Context

A reusable map component that renders OpenStreetMap tiles and accepts a list of pins (with
categories), the current user location, optional polygons (public-works boundaries), and emits
events for tap/drag interactions.

Two implementations are needed:

- **Web (Next.js admin)**: react-leaflet directly.
- **Mobile (React Native)**: use a maintained RN library (e.g., `react-native-leaflet-view` or a
  WebView-based wrapper) to render Leaflet, since react-native-maps targets Google/Apple Maps which
  don't fit OSM-first strategy.

Both expose the same prop API so callers don't care about the platform.

> **Scope note:** this task is for the **Citizen App** (`apps/city-hero`, React Native/Expo), which
> is the current MVP surface — the Next.js admin panel (`apps/web`) is out of MVP scope per
> `docs/tasks/README.md`'s "Out-of-MVP tasks" section (paused 2026-06-19). The web implementation
> below is kept only because `packages/design_system` is shared and the façade pattern
> (`Map.web.tsx` / `Map.native.tsx`) is the documented way this repo splits platform code — build
> the native path first; the web path is not blocking for MVP delivery.

> **Design-decision flag (library fit):** "Leaflet" is a web-first JS/DOM library with no native iOS
> or Android runtime, so it cannot render natively inside a React Native view — it only works in RN
> via a `react-native-webview` bridge (loading Leaflet inside an HTML page in a WebView) or a thin
> wrapper package that does the same thing internally (e.g. `react-native-leaflet-view`). That's a
> legitimate way to reuse OSM tiles without paying for Google Maps, but it comes with real costs:
> WebView-rendered maps hand gesture/pan/zoom handling to the JS engine inside the WebView instead
> of native UIKit/View gestures, pin taps round-trip through a JS bridge (`postMessage`), and
> Leaflet's own docs flag a memory-leak-on-remount issue (already captured below in Edge Cases) that
> is worse inside a WebView's own JS context. Checked via context7 against the two RN-native
> alternatives:
>
> - `react-native-maps` (`/react-native-maps/react-native-maps`) supports custom OSM raster tiles
>   via its `UrlTile` component (`urlTemplate="https://.../{z}/{x}/{y}.png"`, with `tileCachePath`
>   for offline caching) — but on Android it still requires bundling the Google Maps SDK (and, in
>   practice, a Google Maps API key) as the base map provider even when overlaying OSM tiles, and
>   its own docs warn that free OSM tile servers are explicitly **not recommended for production
>   Android use** and are for "small-scale testing" only on iOS — this matches the OSM tile-usage
>   policy already linked below and means a paid/self-hosted tile provider is required either way.
> - `@maplibre/maplibre-react-native` (MapLibre, a Mapbox-GL fork with no Google/Mapbox account
>   requirement) renders vector or raster OSM-compatible tiles natively (GPU-accelerated, no
>   WebView) and has no Google Maps dependency on Android, making it a closer fit for the
>   "OSM-first, cheaper" strategy in `README.md` than either react-native-maps or a
>   Leaflet-in-WebView wrapper.
>
> **Recommendation, not applied here unilaterally:** if native pan/zoom performance and avoiding a
> Google Maps SDK dependency matter more than staying literally on "Leaflet," MapLibre React Native
> is worth evaluating before implementation starts. This doc keeps the Leaflet/WebView premise from
> the original title and the prototype (`design/index.html`, which does use Leaflet.js since it's a
> plain web page) but the Frontend section below is written so the native implementation
> (`Map.native.tsx`) can swap its internals for MapLibre without changing the public prop API.

## User Story

**As a** Frontend Developer,\
**I want** a single map component working on web and mobile,\
**In order to** display reports, public works, and other geographic data without rewriting per
platform.

**As a** Citizen,\
**I want** to see issues and works on a familiar map,\
**In order to** understand my neighborhood at a glance.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the Home screen\
**When** the map mounts\
**Then** OpenStreetMap tiles load centered on the user's location (with fallback to the city
center)\
**And** the user's location is marked with a pulsing dot\
**And** the map can be panned and zoomed via touch gestures

### Scenario · Pin categories

**Given** the screen receives a list of report pins from the API\
**When** the map renders\
**Then** each pin uses a custom icon based on its category (pothole, trash, lighting, sidewalk,
etc.)\
**And** colors and emojis match the prototype's pin design\
**And** "in progress" pins have a small overlay indicator

### Scenario · Pin tap

**Given** the user taps a pin\
**When** the tap event fires\
**Then** the map emits a `pinTapped` event with the pin ID\
**And** the host screen handles the event (e.g., opens a bottom sheet with the report's summary)

### Scenario · Clustering at low zoom

**Given** there are many pins close together\
**When** the user zooms out\
**Then** pins cluster into a count-bubble\
**And** tapping the cluster zooms in to a level where the cluster expands

### Scenario · Polygons (public works)

**Given** a public-work polygon is provided\
**When** the map renders\
**Then** the polygon is drawn with a soft fill and a labeled border\
**And** it doesn't intercept pin taps inside it (unless pin tap is disabled)

### Scenario · Recenter on user

**Given** the user is panning around\
**When** they tap the "recenter" floating button\
**Then** the map smoothly animates back to the user's current location\
**And** the zoom level returns to the configured default

### Scenario · Offline tiles (cached)

**Given** the user previously viewed a tile\
**When** they open the map without connectivity\
**Then** the cached tiles render\
**And** uncovered areas show a low-contrast "offline" pattern

### Scenario · Accessibility

**Given** the user has screen reader on\
**When** they swipe through map controls\
**Then** focusable elements (recenter button, layer toggle) are reachable and labeled\
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

The thin façade delegates to the platform-specific implementation via the bundler's `.web` /
`.native` suffix resolution.

### Public API

The component receives:

- `center` (lat/lng) — initial center.
- `zoom` (number) — initial zoom.
- `pins` (array) — each with id, lat/lng, category, status, and optional label.
- `polygons` (array, optional) — each with id, geojson coordinates, fill, border.
- `userLocation` (lat/lng, optional) — the pulsing dot.
- Event callbacks: `onPinPress`, `onMapPress`, `onRegionChange`.

### Pin design

Pins follow the prototype's visual language: rounded "drop" shape (`50% 50% 50% 4px` rotated -45°)
with a category emoji and a category color background. A small badge in the corner indicates "in
progress" for pins with that status.

### Clustering

Use a clustering plugin compatible with both react-leaflet (web) and the chosen RN library. Cluster
colors and sizes follow the design tokens.

### User location

The user location dot uses a CSS pulse animation. On mobile, it's reactive to GPS updates from
`expo-location`.

### Performance

- Memoize pin rendering — re-render only when the pin list changes.
- Lazy-load tiles outside the viewport.
- Limit re-renders during pan/zoom (debounce `onRegionChange` to ~150ms).

## Backend (FastAPI)

The map component itself doesn't call backend, but typical hosts call:

| Endpoint                                      | Purpose                                        |
| --------------------------------------------- | ---------------------------------------------- |
| `GET /api/v1/reports?bbox=&category=&status=` | Fetch reports within a bounding box, filtered. |
| `GET /api/v1/public-works?bbox=`              | Fetch public-work polygons.                    |

Both follow the standard error/pagination conventions and respect multi-tenant scoping. Bounding-box
queries use PostGIS `ST_Intersects` against an indexed geometry column.

> **Current state (not yet true):** as of this writing, neither of these endpoints nor PostGIS exist
> in `apps/backend`. `docker-compose.yml`'s `db` service runs plain `postgres:16-alpine`, not a
> PostGIS-enabled image, and `apps/backend/app/models/` only contains `role.py` and `user.py` — no
> `Report` or `PublicWork` model, no geography/geometry column, anywhere in the codebase yet.
> Enabling the PostGIS extension and switching the `db` image is the job of
> `00-foundation/17-docker-dev-environment.md` (also not started); the `Report`/`PublicWork` tables
> with their geometry columns are owned by the screen tasks that create them (06-home-map,
> 26-public-works-list, 07-photo-upload-pipeline). This task's own scope is only the map
> **component** — it must be implementable against a mocked/stubbed version of these endpoints so it
> isn't blocked waiting on 17 or the screen tasks; wiring the real endpoints happens when those
> tasks land.

## Database

Reports and public-works tables include geometry columns indexed with GiST for fast bounding-box
queries. Schema details are owned by the screens that create reports/works (07-photo-upload-pipeline
plus screen tasks 06, 26).

> **Current state (not yet true):** no PostGIS extension is enabled and no geometry/geography column
> exists in any migration yet (`apps/backend` has no `alembic/versions` history beyond user/role
> tables at time of writing). This section documents the target schema shape the map component's
> backend calls will depend on once 17-docker-dev-environment.md (PostGIS setup) and the
> report/public-works screen tasks land — it is not a claim that the schema exists today.

## Edge Cases

- **No GPS permission**: fallback to the city's default center; show a banner offering to grant
  permission.
- **GPS sensor unavailable**: same as above.
- **Tile server down or rate-limited**: cached tiles render; uncovered areas show a placeholder.
- **Pin density extreme** (1000+ in a small area): clustering handles visual density; performance
  budget is enforced.
- **Map size = 0** (collapsed parent layout): the component re-measures on next layout pass.
- **Memory leaks on remount** (Leaflet's known issue): cleanup hook explicitly destroys the map
  instance on unmount.

## Privacy / LGPD

- The user's GPS coordinates are not transmitted to the OSM tile server beyond what the tile request
  implies (bounding box).
- For privacy-sensitive viewing modes (e.g., showing a denouncer's location publicly), the map
  jitters the location by a configurable radius.

## Analytics

| Event                  | When                          | Props                |
| ---------------------- | ----------------------------- | -------------------- |
| `map.pin_tapped`       | User taps a pin               | `pin_id`, `category` |
| `map.recenter_pressed` | User taps recenter button     | —                    |
| `map.region_changed`   | Pan/zoom complete (debounced) | `zoom`, `bbox`       |

## Tests

- **Unit**: pin icon rendering per category; cluster forms when pin density is high; props update
  propagates.
- **Integration**: tap on pin emits the right event with the right ID; recenter animates back to
  user location.
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
- react-native-webview (Leaflet-in-WebView bridge for the native path):
  https://github.com/react-native-webview/react-native-webview
- react-native-maps (checked as an alternative; see design-decision flag in Context — OSM tiles
  possible via `UrlTile`, but its own docs discourage free OSM tile servers in production and
  Android still needs the Google Maps SDK as base provider):
  https://github.com/react-native-maps/react-native-maps
- MapLibre React Native (checked as the closer-fit native, OSM-compatible, no-Google-Maps-dependency
  alternative; see design-decision flag in Context):
  https://github.com/maplibre/maplibre-react-native

### Project context

- Prototype: `design/index.html` (Home map and public-works renderings using Leaflet)
- `CLAUDE.md`
