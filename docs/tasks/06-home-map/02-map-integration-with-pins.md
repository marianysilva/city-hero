# Home · Map integration with pins

> **Type:** Screen feature · Map + data
> **Screen:** SCREEN 06 · Home · Hyperlocal Map
> **Effort:** M (2-3 days)
> **Dependencies:** `00-foundation/10-leaflet-map-wrapper.md`, `00-foundation/05-api-client.md`, `06-home-map/01-render-home-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `geo`

## Context

The map at the heart of Home: real OSM tiles, category-colored pins for
nearby reports, click-to-open-detail behavior. This task wires the
foundation map wrapper to the report data feed scoped by the active city's
city_id and the visible bounding box.

This task does not implement filters (task 03), user location (task 04),
or real-time updates (task 08) — but is the substrate they all build on.

## User Story

**As a** Citizen,
**I want** to see what's broken in my neighborhood at a glance,
**In order to** understand local priorities and identify problems I can support.

## Acceptance Criteria

### Scenario · Initial map render

**Given** the user lands on Home
**When** the map renders
**Then** the active city's centroid is the initial center (or the user's location if granted)
**And** the initial zoom level is configured (e.g., 16 — neighborhood scale)
**And** OSM tiles load and pan/zoom gestures work

### Scenario · Initial pins fetch

**Given** the map is rendered
**When** the bounding box stabilizes (after the initial tile load)
**Then** the screen calls the reports endpoint with the city scope, the bbox, and applied filters (none initially)
**And** pins render for each report returned
**And** each pin's icon and color reflect the report's category and status

### Scenario · Pan/zoom triggers re-fetch

**Given** the map is shown
**When** the user pans or zooms enough to change the bbox materially
**Then** the screen debounces the change (~300ms) and re-queries reports for the new bbox
**And** the previous pins update incrementally (new ones added, out-of-view ones removed)
**And** unchanged pins do not re-render

### Scenario · Pin tap opens detail

**Given** a pin is rendered
**When** the user taps it
**Then** the app opens the report's detail screen (Detail · Em Andamento, Detail · Ticket, or Detail · Reporte Mesclado depending on status)

### Scenario · Pin clustering at low zoom

**Given** many pins are within a small map area at low zoom
**When** the map renders
**Then** pins cluster into a count-bubble (delegated to the foundation wrapper)
**And** tapping the cluster zooms in to expand it

### Scenario · Empty state

**Given** the bbox returned no reports
**When** the screen handles the empty result
**Then** no pins are rendered (the map is "empty")
**And** the floating ticket card (task 06) handles the "no nearby report" state separately

### Scenario · Backend error

**Given** the reports endpoint returns 5xx
**When** the screen handles the error
**Then** no pins are removed (last-known set stays visible)
**And** a small non-blocking toast appears ("Não foi possível atualizar")
**And** the screen retries on the next bbox change or pull-to-refresh (task 09)

### Scenario · Multi-tenant scoping

**Given** the user is in city `porto-belo`
**When** the request is sent
**Then** the request includes the active city header
**And** the backend rejects if the city header doesn't match the user's authenticated city
**And** no pins from other cities ever appear

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/Home/
├── hooks/
│   ├── useReportsInBbox.ts
│   └── useDebouncedBbox.ts
└── components/
    └── HomeMap.tsx              ← thin wrapper around the foundation Map component
```

### Behavior

- `HomeMap` wraps the foundation Map component and supplies it with pins, the user-location prop (set by task 04), filter callbacks (task 03), and event handlers.
- `useDebouncedBbox` watches the map's region and debounces changes (~300ms) before triggering a re-fetch.
- `useReportsInBbox` is a TanStack Query hook keyed on `(cityId, bbox, filters)`. It fetches reports and exposes `data`, `isLoading`, `error`, `refetch`.
- Pin tap is forwarded to a screen-level handler that opens the detail screen.

### Caching

React Query caches per-bbox results for a few minutes; consecutive small pans hit the cache. Larger pans trigger a fresh fetch.

### Performance

- Pins are memoized; React Query's structural sharing avoids unnecessary re-renders.
- The map only re-renders pins that changed (added/removed), not the entire pin list.
- Heavy work (icon generation) is moved to a pure helper that's memoized per category/status combo.

## Backend (FastAPI)

### Endpoint

| Method | Path                                                 | Purpose                              |
|--------|------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/reports?bbox=...&category=...&status=...`   | List reports in the bbox             |

The endpoint accepts:

- `bbox` — `min_lng,min_lat,max_lng,max_lat`
- `category` — optional, multi-value
- `status` — optional, multi-value (default: `open`, `in_progress`)
- `limit` — bounded (e.g., max 500 per call); the response includes whether more exist
- `since` — for incremental updates (used by task 08)

It returns each report with: ID, lat/lng, category, status, support count, last activity, anonymized photo signed URL (for the popup preview), and a stable `version` (used to short-circuit redundant updates).

### Multi-tenant scoping

The backend scopes by the authenticated user's `city_id` (from the JWT claim) and the explicit `X-City-Id` header (cross-validated). Reports outside the city are never returned.

### Spatial index

Reports' geometries are indexed with PostGIS (GiST). Bbox queries use `ST_Intersects(geometry, bbox)`.

## Database (PostgreSQL + PostGIS)

### `reports` table (subset relevant here)

| Column          | Type             | Notes                                        |
|-----------------|------------------|----------------------------------------------|
| `id`            | UUID PK          |                                              |
| `city_id`       | UUID FK          | Multi-tenant scope                           |
| `category`      | varchar(50)      | `pothole`, `trash`, `lighting`, etc.         |
| `status`        | varchar(20)      | `open`, `in_progress`, `resolved`, `merged`  |
| `geo`           | geography(Point) | Indexed with GiST                            |
| `support_count` | int              |                                              |
| `last_activity_at` | timestamptz   |                                              |
| `photo_id`      | UUID FK          |                                              |
| `version`       | int              | Incremented on each update (for cache keys)  |
| `created_at`    | timestamptz      |                                              |

(Other columns like description, reporter, etc. are owned by the report-creation tasks.)

## Edge Cases

- **User far from the active city** (e.g., traveling): the map opens at the city's centroid, not the user's actual location. A small banner can suggest "Estou em outra cidade" with an entry to City Switch.
- **Bbox crosses the antimeridian** (rare for Brazil): not a concern for SC region; if needed later, the spatial query handles it.
- **Reports geo missing or invalid**: the backend filters them out at query time.
- **Very dense areas (1000+ pins in bbox)**: the API caps at the limit; the map message hints at zooming in.
- **Pin update during map pan**: pins added/removed asynchronously; no jarring flicker.

## Privacy / LGPD

- Pin photos are the **anonymized** versions only.
- Reporter identity is not exposed in the pin (only after tapping into detail).

## Analytics

| Event                       | When                                       | Props                                  |
|-----------------------------|--------------------------------------------|----------------------------------------|
| `home.map.pins_loaded`      | Reports fetched and rendered               | `count`, `bbox_size_km`                |
| `home.map.region_changed`   | Bbox changed (debounced)                   | `zoom`, `delta_km`                     |
| `home.map.pin_tapped`       | User taps a pin                            | `report_id`, `category`, `status`      |
| `home.map.pins_fetch_failed`| Backend error                              | `code`                                 |

## Tests

- **Unit (frontend)**: hook handles loading, success, error, refetch on bbox change; pin tap fires navigation.
- **Unit (backend)**: bbox filtering correct; multi-tenant scoping enforced; max limit respected.
- **Integration**: end-to-end fetch with seeded reports; pan triggers re-fetch.
- **E2E**: open Home, see pins, tap one, see detail.

## Definition of Done

- [ ] HomeMap component wired to the foundation map
- [ ] Debounced bbox query
- [ ] Reports API endpoint
- [ ] Multi-tenant enforcement
- [ ] Pin tap → detail navigation
- [ ] Caching via React Query
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (multi-tenant, REST conventions): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- TanStack Query: https://tanstack.com/query/latest
- PostGIS spatial functions: https://postgis.net/docs/reference.html

### Project context
- Foundation map wrapper: `00-foundation/10-leaflet-map-wrapper.md`
- Filter chips: `03-filter-chips.md`
- Real-time updates: `08-realtime-pin-updates.md`
- `CLAUDE.md`
