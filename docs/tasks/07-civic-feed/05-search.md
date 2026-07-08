# Civic Feed · Search

> **Type:** Screen feature · UX
> **Screen:** SCREEN 07 · Civic Feed
> **Effort:** S (≤1 day)
> **Dependencies:** `07-civic-feed/02-feed-list-and-pagination.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `ux`

## Context

A search overlay opened from the feed header's 🔍 button. The user types
keywords and the results stream live: matches in description, address,
or category, scoped to the user's city and current filters (radius +
sort). Tapping a result opens its detail screen. Recent searches are
remembered for fast re-runs.

## User Story

**As a** Citizen,
**I want** to find a specific report quickly,
**In order to** check on something I heard about or follow up on a previous interaction.

## Acceptance Criteria

### Scenario · Open search overlay

**Given** the user taps the 🔍 button on the feed header
**When** the action runs
**Then** a search overlay slides in from the top, replacing the feed temporarily
**And** the search input is auto-focused; the keyboard appears
**And** "Cancelar" appears at the top right

### Scenario · Type to search

**Given** the search overlay is open
**When** the user types a query (≥3 characters)
**Then** the request is debounced (~300ms)
**And** the results list updates with matches: description text, address area, category labels
**And** the matched substrings can be highlighted (semi-bold + brand color)
**And** results are paginated (20 at a time, infinite scroll)

### Scenario · Search results respect filters

**Given** the user has the feed filtered to 2km + Mais apoiados
**When** they search
**Then** results are scoped to the same radius (2km from user)
**And** sorted by `most_supported` (or by relevance — see backend section)
**And** the user can toggle "Tudo na cidade" to widen to the whole city for the search

### Scenario · Tap a result

**Given** results are showing
**When** the user taps one
**Then** the appropriate detail screen opens (status-dependent, same logic as feed cards)
**And** the search overlay closes

### Scenario · Recent searches

**Given** the user previously searched for things
**When** they open the search overlay (empty input)
**Then** up to 5 recent search queries appear as chips
**And** tapping a chip re-runs that search
**And** a small "Limpar" affordance clears the recent list

### Scenario · No results

**Given** the user typed a query that returned zero results
**When** the empty state renders
**Then** a message echoes the query ("Nada encontrado pra 'xyz'")
**And** suggests next actions: broaden the radius, try a category chip, or report something new

### Scenario · Backend error

**Given** the search endpoint returns 5xx
**When** the overlay handles the error
**Then** an error state appears with a retry CTA
**And** the user can clear the input and try a different query

### Scenario · Cancel and close

**Given** the user wants to leave search
**When** they tap "Cancelar" (or hit the system back button on Android)
**Then** the overlay closes with a slide-down animation
**And** the user returns to the feed in the same scroll position

### Scenario · Accessibility

**Given** screen reader is on
**When** the user opens search
**Then** the input is announced with its label
**And** results are announced as the list updates (live region)
**And** the cancel button is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CivicFeed/
├── components/
│   ├── FeedSearchOverlay.tsx
│   └── SearchResultRow.tsx
└── hooks/
    ├── useFeedSearch.ts
    └── useRecentSearches.ts
```

### Behavior

- The overlay is a stack-modal-presentation screen layered above the feed.
- `useFeedSearch` is a TanStack `useInfiniteQuery` keyed on `(cityId, query, radius_km, scope)`. It debounces the query and returns paginated matches.
- `useRecentSearches` keeps the last 5 unique queries in local storage; capped and pruned automatically.
- `SearchResultRow` is a compact variant of the feed card (one-line description, photo thumbnail, category, status).

### UX details

- The input has a clear (×) button when text is present.
- The "Tudo na cidade" toggle switches the search scope from the user's radius to city-wide.
- Highlighting matched substrings makes scanning faster.

## Backend (FastAPI)

### Endpoint

| Method | Path                                                 | Purpose              |
| ------ | ---------------------------------------------------- | -------------------- |
| GET    | `/api/v1/feed/search?q=&radius_km=&sort=&scope=local | city&cursor=&limit=` | Search feed items |

The backend:

- Validates `q` length (min 2 chars; max 100).
- Filters by city, radius (when `scope=local`), and the query (full-text search on description, fuzzy match on address area, exact match on category labels).
- Returns the same item shape as the feed list (so the result row can reuse most of the rendering).

### Search implementation

- Use PostgreSQL full-text search (`tsvector` index on description) for fast text matching.
- Optionally combine with trigram similarity for typo tolerance.
- For MVP, server-side ranking is by recency + relevance score; "most_supported" applies as a secondary sort.

## Database

A `tsvector` column on `reports` (e.g., `description_tsv`) plus a GIN index supports full-text search performance. An Alembic migration adds and populates it via a trigger.

## Edge Cases

- **Query too short** (<3 chars): no request is sent; the overlay shows recent searches.
- **Diacritics**: the tsvector configuration uses Portuguese normalization so "São" matches "sao".
- **Very common words** (e.g., "rua"): the search returns recent matches; user can refine.
- **Result not in current radius (when scope=local)**: the result row shows a "fora do raio" badge.

## Privacy / LGPD

- Recent searches are stored locally on the device only; never sent to the backend.
- The query itself is logged (anonymously) for analytics; ensure no obvious PII (e.g., email-like patterns) is preserved.

## Analytics

| Event                        | When                   | Props                        |
| ---------------------------- | ---------------------- | ---------------------------- |
| `feed.search_opened`         | Overlay opens          | —                            |
| `feed.search_typed`          | User types (debounced) | `query_length`, `scope`      |
| `feed.search_result_pressed` | User taps a result     | `report_id`, `position`      |
| `feed.search_no_result`      | Zero results           | `query` (sanitized), `scope` |

## Tests

- **Unit (frontend)**: hook handles debounce; recent searches bounded at 5; result row renders correctly.
- **Unit (backend)**: tsvector matches expected tokens; trigram tolerance works; multi-tenant scoping.
- **Integration**: end-to-end search; pagination; scope toggle.
- **E2E**: open search → type → see results → tap → see detail → back to search → close → return to feed.

## Definition of Done

- [ ] Search overlay component
- [ ] Search hook with debounce + infinite scroll
- [ ] Recent searches persistence
- [ ] Backend full-text search endpoint
- [ ] tsvector column + GIN index migration
- [ ] Empty-state and error UX
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- PostgreSQL full-text search: https://www.postgresql.org/docs/current/textsearch.html
- pg_trgm extension: https://www.postgresql.org/docs/current/pgtrgm.html
- TanStack infinite queries: https://tanstack.com/query/latest/docs/react/guides/infinite-queries

### Project context

- Feed list: `02-feed-list-and-pagination.md`
- Filter chips: `04-filter-chips.md`
- `CLAUDE.md`
