# City Select · Cities catalog API + render list

> **Type:** Screen feature · Data fetch\
> **Screen:** SCREEN 02 · Choose City\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/05-api-client.md`, `02-city-select/01-render-city-select-ui.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `database`, `screen`

## Context

A read-only catalog of supported cities, returned by the backend and rendered as the screen's list.
Each city has a status (`active` for pilot cities; `coming_soon` for those in negotiation or
waitlist), a flag/emoji, a short subtitle, and geographic metadata (centroid + bounding box) used
later for GPS auto-detect.

This task owns the catalog: backend endpoint, schema, seed data, and the client-side fetch +
rendering hookup.

## User Story

**As a** Citizen,\
**I want** to see the list of cities CityHero supports,\
**In order to** pick mine — or see when mine is coming.

## Acceptance Criteria

### Scenario · Fetch catalog on screen mount

**Given** the user lands on the City Select screen\
**When** the screen mounts\
**Then** the cities catalog is fetched from the backend\
**And** while loading, a list skeleton is shown (3 rows)\
**And** on success, the list renders the active and coming-soon cities

### Scenario · Catalog response shape

**Given** the backend returns a list of cities\
**When** the response is parsed\
**Then** each city has at minimum: `id`, `name`, `state`, `slug`, `status`, `flag_emoji`,
`subtitle`, `centroid` (lat/lng), `bbox` (min/max lat/lng)\
**And** the response is paginated only if the catalog grows large; for v1 a flat list is acceptable

### Scenario · Active vs coming-soon ordering

**Given** the response includes mixed-status cities\
**When** the list renders\
**Then** active cities appear first, then coming-soon\
**And** within each group, ordering is alphabetical by name

### Scenario · Backend error

**Given** the API returns a 5xx\
**When** the screen handles the error\
**Then** a friendly error state is shown with a "Tentar de novo" button\
**And** the user can retry without losing the rest of the screen\
**And** if the user is offline, the offline state takes priority

### Scenario · Cached catalog (warm start)

**Given** the catalog was fetched in a previous session\
**When** the screen opens again with no connectivity\
**Then** the cached catalog renders immediately\
**And** a small "Lista pode estar desatualizada" hint appears\
**And** when connectivity returns, the catalog refreshes silently

### Scenario · Localized subtitles

**Given** the user's language is en-US\
**When** the catalog renders\
**Then** subtitles like "Pilot · 18k citizens" / "Coming soon · negotiating" are rendered in
English\
**And** in pt-BR they're "Piloto · 18mil cidadãos" / "Em breve · em negociação"

## Backend (FastAPI)

### Endpoint

| Method | Path             | Purpose                          |
| ------ | ---------------- | -------------------------------- |
| GET    | `/api/v1/cities` | Public catalog, no auth required |

The endpoint accepts an optional `state` query (e.g., `state=SC`) to filter by Brazilian state.
Future filters (region, country) can be added without breaking the contract.

### Response shape

The response is an object containing an array of city items. Each item has the fields described in
the acceptance criteria. The response also includes a `last_updated_at` timestamp for client cache
invalidation.

### Caching

The backend can cache the catalog response in memory (or Redis) for a few minutes — the catalog
changes rarely. Cache headers (`Cache-Control: max-age=300`) help the API client.

### Public visibility

This endpoint is the **only** city-related public read endpoint. Tenanted endpoints (reports, etc.)
require authenticated context.

## Database (PostgreSQL + PostGIS)

### `cities` table

| Column            | Type               | Notes                               |
| ----------------- | ------------------ | ----------------------------------- |
| `id`              | UUID PK            |                                     |
| `name`            | varchar(120)       |                                     |
| `state`           | varchar(2)         | Brazilian state code (SC, RJ, etc.) |
| `country`         | varchar(2)         | ISO country code; default `BR`      |
| `slug`            | varchar(120)       | Unique, kebab-case identifier       |
| `status`          | varchar(20)        | `active`, `coming_soon`             |
| `flag_emoji`      | varchar(10)        |                                     |
| `subtitle_key_pt` | varchar(120)       | i18n key for the pt-BR subtitle     |
| `subtitle_key_en` | varchar(120)       | i18n key for the en-US subtitle     |
| `centroid`        | geography(Point)   | For GPS auto-detect                 |
| `bbox`            | geography(Polygon) | Bounding box of the city            |
| `created_at`      | timestamptz        |                                     |
| `updated_at`      | timestamptz        |                                     |

A GiST index on `centroid` and `bbox` supports nearest-city queries. Subtitle keys point to i18n
strings to keep translations together with the rest of the catalog.

### Seed data

Initial seed (Alembic data migration): Pôrto Belo (active), Bombinhas, Itapema, Balneário Camboriú
(coming_soon), all in SC.

## Frontend (React Native)

### Where the data layer lives

```
apps/city-hero/src/screens/CitySelect/
├── hooks/
│   └── useCitiesCatalog.ts
└── api/
    └── citiesEndpoint.ts
```

The screen uses a TanStack Query hook backed by the API client. The hook returns: `data`,
`isLoading`, `error`, `refetch`. Cache duration is moderate (e.g., 5 minutes) so a fresh fetch
happens at most once per session.

### Skeleton state

While loading, the screen shows three skeleton rows. The skeleton respects the design system's
shimmer/pulse pattern.

### Error state

On error, a centered error component appears in place of the list with the error message and a retry
button. The GPS card and search stay visible if relevant.

## Edge Cases

- **Catalog empty** (zero cities): show an empty state ("Em breve em sua região"); offer the
  waitlist (per task 06).
- **Catalog has a city without bbox** (rare bad data): GPS auto-detect ignores it; rendering still
  works.
- **Stale cached catalog with a removed city**: server response wins; the removed city disappears.
- **Catalog grew to hundreds of cities**: switch to paginated/virtualized list; UI components are
  designed to handle either.

## Privacy / LGPD

- The catalog is public and contains no PII.
- The endpoint can be consumed unauthenticated.

## Analytics

| Event                      | When                          | Props                               |
| -------------------------- | ----------------------------- | ----------------------------------- |
| `city_select.fetched`      | Catalog returned successfully | `count_active`, `count_coming_soon` |
| `city_select.fetch_failed` | Backend error                 | `status`, `code`                    |

## Tests

- **Unit (frontend)**: hook returns correct states; renders skeleton, list, error, empty.
- **Unit (backend)**: endpoint returns sorted catalog; respects optional `state` filter; cache
  headers set.
- **Integration**: end-to-end fetch from the seeded DB.
- **Schema migration**: Alembic data migration seeds at least the SC pilot cities.

## Definition of Done

- [ ] `cities` table + Alembic migration + seed data
- [ ] Public catalog endpoint
- [ ] Cache headers and (optionally) Redis cache
- [ ] Frontend hook and integration with the rendering screen
- [ ] Skeleton, error, and empty states
- [ ] Localized subtitles
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (REST conventions, multi-tenant exception):
  `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- TanStack React Query: https://tanstack.com/query/latest
- PostGIS Point/Polygon: https://postgis.net/docs/manual-3.4/reference.html

### Project context

- Render UI: `01-render-city-select-ui.md`
- API client: `00-foundation/05-api-client.md`
- i18n: `00-foundation/13-i18n.md`
- `CLAUDE.md`
