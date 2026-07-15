# Civic Feed · List + pagination + infinite scroll

> **Type:** Screen feature · Data + UX\
> **Screen:** SCREEN 07 · Civic Feed\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/05-api-client.md`, `07-civic-feed/01-render-feed-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `database`, `screen`

## Context

The data and rendering of the feed list itself: a paginated, virtualized scroll of feed items scoped
to the user's city and current filters (radius + sort). Cursor-based pagination is preferred so
insertions don't shift offsets while the user scrolls.

This task does not implement the individual card visual (task 03) or filter behavior (task 04) — but
defines the contract those tasks plug into.

## User Story

**As a** Citizen,\
**I want** a smooth, fast feed of recent reports near me,\
**In order to** scan many items without lag.

## Acceptance Criteria

### Scenario · Initial load

**Given** the user opens the Feed tab\
**When** the list mounts\
**Then** the first page of feed items loads (e.g., 20 items)\
**And** while loading, a list skeleton shows (3-5 placeholder cards)\
**And** the list scrolls smoothly with no visible jank during the initial render

### Scenario · Infinite scroll

**Given** the user scrolls near the end of the loaded items\
**When** the list reaches a threshold (e.g., 80% scrolled)\
**Then** the next page is fetched and appended\
**And** a small loading indicator appears at the bottom while fetching\
**And** if there are no more items, a friendly end marker shows ("Você chegou ao fim · faça um
reporte 📸")

### Scenario · Pagination is cursor-based

**Given** the user is scrolling\
**When** new items are inserted at the top by another user (real-time, task 09)\
**Then** the user's scroll position does not shift\
**And** the cursor for "next page" remains valid

### Scenario · Filter changes reset the list

**Given** the user changes the radius from 10km to 2km (task 04)\
**When** the new filter applies\
**Then** the list scrolls to top and refetches the first page with the new filter\
**And** the previous data is cleared from the visible list

### Scenario · Backend error

**Given** the API returns 5xx\
**When** the list handles the error\
**Then** if it's the initial load, an error state appears with "Tentar de novo"\
**And** if it's a subsequent page, the existing items remain and a small inline error appears with
retry\
**And** the user can refetch without losing the current scroll

### Scenario · Empty state

**Given** the API returns zero items for the current filter\
**When** the list handles the response\
**Then** a friendly empty state appears ("Tudo tranquilo no seu raio · vire o herói e reporte algo
📸")\
**And** the empty state includes a CTA to open the camera

### Scenario · Multi-tenant scoping

**Given** the user is in city `porto-belo`\
**When** the request is sent\
**Then** the request includes the city scope header\
**And** the backend rejects if the city scope doesn't match the JWT\
**And** no items from other cities ever appear

### Scenario · Lazy image loading

**Given** the list contains many cards with photos\
**When** scrolling fast\
**Then** off-screen photos don't load until close to the viewport\
**And** memory usage stays reasonable

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the list\
**Then** each item is read in order\
**And** the end marker is announced\
**And** loading indicators are announced as live regions

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CivicFeed/
├── hooks/
│   └── useFeedItems.ts        ← TanStack infinite query
└── components/
    └── FeedList.tsx
```

### Component behavior

- `useFeedItems` is a TanStack `useInfiniteQuery` keyed on `(cityId, radius, sort)`. It calls the
  feed endpoint with `cursor` and `limit` params. It returns `data`, `fetchNextPage`, `hasNextPage`,
  `isFetchingNextPage`, `error`, `refetch`.
- `FeedList` is a virtualized list (FlashList preferred, FlatList acceptable) that renders feed
  items using the card component (task 03).
- Threshold-based `onEndReached` triggers `fetchNextPage`.
- Lazy image loading is handled by the card component via the platform's image library (e.g.,
  `expo-image` with lazy loading).

### Performance

- Estimated item size for the virtualized list improves render performance.
- Photos are sized appropriately on the server (thumbnail variant) so the client doesn't download
  full-resolution.
- Offscreen items are unmounted by the virtualization library.

## Backend (FastAPI)

### Endpoint

| Method | Path                                           | Purpose                   |
| ------ | ---------------------------------------------- | ------------------------- |
| GET    | `/api/v1/feed?radius_km=&sort=&cursor=&limit=` | Paginated hyperlocal feed |

The endpoint accepts:

- `radius_km` — 1, 2, 5, 10 (capped server-side to a max).
- `sort` — `recent` (default) or `most_supported`.
- `cursor` — opaque pagination cursor; first page omits this.
- `limit` — bounded (e.g., max 50 per call, default 20).
- The user's location is derived from the request: either an explicit `lat`/`lng` query param (if
  the client provides one) or the user's saved home location, falling back to the city centroid.

It returns:

- `items` — array of feed items (shape: id, reporter info or anonymous flag, distance, category,
  status, photo URL, description, support count, comment count, created_at, current user's support
  state).
- `next_cursor` — string or null when no more items.

### Multi-tenant scoping

Backend scopes by the JWT's `city_id` and the explicit city scope header. Cross-validation enforced
by middleware.

### Sort and filter logic

- `recent`: `ORDER BY created_at DESC`.
- `most_supported`: `ORDER BY support_count DESC, created_at DESC`.
- Radius filter uses PostGIS `ST_DWithin(geo, user_point, radius_meters)`.

### Cursor format

The cursor is a base64-encoded JSON of the last item's sort key + ID — ensures stability when items
are inserted.

## Database (PostgreSQL + PostGIS)

The `reports` table (already defined in earlier tasks) is queried with the radius filter and sort.
The composite index on `(city_id, created_at DESC)` and a separate index on
`(city_id, support_count DESC, created_at DESC)` support the two sort modes.

## Edge Cases

- **User location not available**: fallback to the city centroid; the radius search still works.
- **Cursor invalid (e.g., item deleted)**: backend handles gracefully and continues from the next
  valid item.
- **Very dense neighborhoods**: pagination keeps response size manageable.
- **Item visibility changes** (e.g., a moderator removes a report): subsequent fetches don't include
  it; on-screen items can stay until the next refresh.
- **Photo not yet anonymized** (still in pipeline): the feed item shows a category emoji placeholder
  until the anonymized photo is ready.

## Privacy / LGPD

- Anonymous reports return the post fully (description, photo, location) but with the reporter
  masked (no name, generic avatar).
- Photos served are the **anonymized** variant only.
- The user's location used for the radius query is sent only as needed; coordinates are not stored
  beyond the request.

## Analytics

| Event                        | When                                    | Props                         |
| ---------------------------- | --------------------------------------- | ----------------------------- |
| `feed.list_initial_loaded`   | First page rendered                     | `count`, `radius_km`, `sort`  |
| `feed.list_next_page_loaded` | Subsequent page rendered                | `count`, `cursor_age_seconds` |
| `feed.list_load_failed`      | Backend error                           | `code`                        |
| `feed.list_end_reached`      | User scrolls to the end (no more items) | `total_loaded`                |

## Tests

- **Unit (frontend)**: hook handles loading, success, error, infinite scroll; cursor format works
  across pages.
- **Unit (backend)**: filter and sort logic; cursor-based pagination remains stable with insertions;
  multi-tenant enforcement.
- **Integration**: end-to-end with seeded reports; filter change resets the list.
- **E2E**: scroll through 3+ pages; observe smoothness; verify end-marker.

## Definition of Done

- [ ] FeedList component with virtualization
- [ ] useFeedItems hook with infinite query
- [ ] Backend feed endpoint with radius + sort + cursor pagination
- [ ] Composite indexes on `reports`
- [ ] Skeleton, error, and empty states
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (REST, multi-tenant, pagination): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- TanStack Query infinite queries:
  https://tanstack.com/query/latest/docs/react/guides/infinite-queries
- Shopify FlashList: https://shopify.github.io/flash-list/
- expo-image: https://docs.expo.dev/versions/latest/sdk/image/
- PostGIS spatial functions: https://postgis.net/docs/reference.html

### Project context

- Render UI base: `01-render-feed-ui-base.md`
- Feed item card: `03-feed-item-card.md`
- Filter chips: `04-filter-chips.md`
- `CLAUDE.md`
