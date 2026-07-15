# Services & Public Works · Search overlay

> **Type:** Screen feature · UI + state\
> **Screen:** SCREEN 25 · Services & Public Works\
> **Effort:** S (≤1 day)\
> **Dependencies:** `25-services-public-works/02-service-cards-grid.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A modal overlay opened from the search icon. The user types a keyword (e.g., "iluminação") and
matching services are listed inline. The matching considers the label, subtitle, and a small
keywords array per service (e.g., "luz" matches "iluminação").

## Acceptance Criteria

### Scenario · Open and search

**Given** the user taps the search icon\
**When** the overlay opens\
**Then** an input is auto-focused with the keyboard up\
**And** typing filters results live (debounced ~250ms)

### Scenario · Search results

**Given** the user typed\
**When** matches appear\
**Then** results show service rows (icon + label + subtitle)\
**And** matched substrings are highlighted

### Scenario · Tap result

**Given** the user taps a result\
**When** the action runs\
**Then** the same navigation as the grid card runs\
**And** the overlay closes

### Scenario · Recent searches

**Given** the user previously searched\
**When** they reopen the overlay (empty input)\
**Then** recent searches appear as chips\
**And** tapping re-runs them

### Scenario · No results

**Given** the search yields zero results\
**When** the empty state renders\
**Then** suggests alternatives or contacts (e.g., "Não achou? Veja os Telefones Úteis no rodapé.")

### Scenario · Cancel

**Given** the user wants to close\
**When** they tap Cancel or system back\
**Then** the overlay slides down and closes

### Scenario · Localization

**Given** en-US\
**When** rendered\
**Then** placeholders and copy translate

### Scenario · Accessibility

**Given** SR is on\
**When** the overlay opens\
**Then** the input is announced as a search field\
**And** results are read as a list

## Frontend

```
apps/city-hero/src/screens/ServicesPublicWorks/
├── components/
│   └── ServicesSearchOverlay.tsx
└── hooks/
    ├── useServiceSearch.ts
    └── useRecentSearches.ts
```

## Backend

For MVP, client-side filtering on the catalog (small N). Future: server-side search with relevance
ranking.

## Database

`city_services.search_keywords` field holds the per-service keyword array.

## Edge Cases

- **Diacritics**: normalized; "iluminacao" matches "iluminação".
- **Catalog very large**: switch to server-side search.

## Privacy / LGPD

Recent searches stored locally only.

## Analytics

| Event                            | When                   | Props          |
| -------------------------------- | ---------------------- | -------------- |
| `services.search_opened`         | Overlay opened         | —              |
| `services.search_typed`          | User typed (debounced) | `query_length` |
| `services.search_result_pressed` | User tapped a result   | `service_key`  |
| `services.search_no_result`      | Empty result           | `query`        |

## Tests

- **Unit**: normalize match; recent searches bounded; tap navigation.
- **Snapshot**: with and without results.
- **A11y**: input labeled; results announced.

## Definition of Done

- [ ] ServicesSearchOverlay component
- [ ] useServiceSearch + useRecentSearches hooks
- [ ] Diacritics-insensitive match
- [ ] Empty state with contacts hint
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Service cards grid: `02-service-cards-grid.md`
- `CLAUDE.md`
