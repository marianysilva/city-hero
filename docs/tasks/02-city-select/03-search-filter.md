# City Select · Search and filter

> **Type:** Screen feature · UX\
> **Screen:** SCREEN 02 · Choose City\
> **Effort:** S (≤1 day)\
> **Dependencies:** `02-city-select/02-cities-catalog-api.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A search input above the list lets users find a specific city by typing. For the MVP catalog (a
handful of cities), client-side filtering is enough. This task is also forward-compatible with a
server-side search endpoint when the catalog grows.

## User Story

**As a** Citizen looking for a specific city,\
**I want** to type and have the list filter live,\
**In order to** find my city without scrolling.

## Acceptance Criteria

### Scenario · Live filtering

**Given** the catalog has multiple cities\
**When** the user types into the search input\
**Then** the list filters in real time, showing only matches\
**And** matches are case- and accent-insensitive (e.g., "sao paulo" matches "São Paulo")\
**And** matches highlight the matched substring in the city name

### Scenario · Empty state for no results

**Given** the user typed something that doesn't match any city\
**When** the filter yields zero results\
**Then** the list shows an empty state with the typed text echoed back ("Nenhuma cidade chamada
'xyz'")\
**And** offers a CTA: "Avise-me quando tiver" (joins waitlist for the typed query)

### Scenario · Clear button

**Given** the user has typed something\
**When** an X button appears at the right of the input\
**Then** tapping it clears the input and restores the full list\
**And** focus stays on the input so the user can keep typing

### Scenario · Search includes coming-soon cities

**Given** the user types the name of a coming-soon city\
**When** the filter runs\
**Then** the matching coming-soon city is shown\
**And** tapping it offers to join the waitlist (per task 06)

### Scenario · Recent searches

**Given** the user has searched for a city before in this session\
**When** they focus the search input again\
**Then** recent searches appear as chips/quick-suggestions below the input\
**And** tapping a chip re-runs that search

### Scenario · Server-side search (future)

**Given** the catalog grows beyond ~50 cities\
**When** the user types\
**Then** queries with 3+ characters hit the backend instead of filtering locally\
**And** debouncing (~300ms) avoids excessive requests

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CitySelect/
├── hooks/
│   └── useCitySearch.ts
└── components/
    └── CityEmptyResults.tsx
```

### Behavior

- The search input is controlled by the screen's local state (or a small Zustand store if shared
  elsewhere).
- The `useCitySearch` hook receives the raw catalog and the search term, returns the filtered list.
- Filtering normalizes both the catalog name and the search query (lowercase, strip diacritics)
  before matching.
- When the search yields no results, the empty-state component renders with the echoed query and the
  "Notify me" CTA.
- A history of the last 5 searches is held in the hook for chip suggestions.

### Performance

For the expected catalog size (≤50 cities), filtering happens synchronously on every keystroke
without performance issues. For larger catalogs, the hook will swap to a debounced server query.

### Highlighting

The matched substring within the city name is wrapped in a styled span (semi-bold + brand color) so
the user sees why a row matched.

## Backend (FastAPI)

### Optional server-side search (future)

If the catalog grows large, a search endpoint could be added:

| Method | Path                    | Purpose                         |
| ------ | ----------------------- | ------------------------------- |
| GET    | `/api/v1/cities/search` | Returns up to 20 matches by `q` |

For MVP, this is **not** built — local filtering on the catalog is enough.

## Database

Not applicable for MVP (local filter). For server-side search (future), a trigram index on
`cities.name` accelerates ILIKE queries.

## Edge Cases

- **Search with only spaces**: treated as empty; full list restored.
- **Special characters in query** (regex metacharacters): the query is escaped; a literal substring
  search is used.
- **Diacritics differing in input vs catalog**: normalization handles "Pôrto Belo" matched by "porto
  belo".
- **Long query**: layout doesn't break; input scrolls horizontally if needed.
- **Software keyboard's autocomplete suggestions**: the input accepts them normally.

## Privacy / LGPD

- Search queries are kept locally (recent searches) and not sent to the backend in MVP.
- If a server-side search endpoint is added, queries are logged anonymously for analytics; no user
  identity attached.

## Analytics

| Event                          | When                                  | Props               |
| ------------------------------ | ------------------------------------- | ------------------- |
| `city_select.search_typed`     | User types into the input (debounced) | `query_length`      |
| `city_select.search_no_result` | Filter yields 0 results               | `query` (truncated) |
| `city_select.search_clear`     | User taps the clear button            | —                   |

## Tests

- **Unit**: filter normalization handles diacritics, casing, partial matches; recent-searches list
  bounded at 5.
- **Integration**: typing into the input filters the list; clearing restores it; no-results state
  shows correct query echo.
- **A11y**: search input is labeled; no-results state is announced.

## Definition of Done

- [ ] Search input integrated in the City Select screen
- [ ] Filtering hook with normalization
- [ ] Empty-state component with echoed query and waitlist CTA
- [ ] Clear button
- [ ] Recent searches chips
- [ ] Tests passing per strategy

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`
- Architecture: `docs/engineering/architecture-patterns.md`

### Library / framework references

- String normalization (diacritics):
  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize

### Project context

- Cities catalog: `02-cities-catalog-api.md`
- Waitlist: `06-waitlist-coming-soon.md`
- `CLAUDE.md`
