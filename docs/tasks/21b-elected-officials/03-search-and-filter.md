# Elected Officials · Search + filter chips

> **Type:** Screen feature · UI + state\
> **Screen:** SCREEN 21b · Politicians of the City\
> **Effort:** S (≤1 day)\
> **Dependencies:** `21b-elected-officials/01-render-officials-ui-base.md`,
> `21b-elected-officials/02-officials-list-and-grouping.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

Fills the `search` and `filter-chips` slots from task 01 and wires them to the list hooks from
task 02. The search is a debounced name-matcher; the chips are a single-select level filter: **Todos
· Municipal · Estadual · Federal · Senador**. Both controls narrow the lists below — when a filter
or query is active, the 4-group structure collapses into a single flat result list under a
"Resultados" header (the group headers become noise when the user already filtered).

This task **only** integrates the shared components — it does not define a local search input or a
local chip component.

## User Story

**As a** Citizen,\
**I want** to find a specific representative by name or by level of government,\
**In order to** get to their Portal da Transparência link without scrolling.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen\
**When** the controls render\
**Then** the `search` slot is filled by the shared `SearchBar` atom with placeholder "Buscar
político…"\
**And** the `filter-chips` slot is filled by the shared `FilterChipRow` (sticky) with chips:
`Todos · 23` (active), `Municipal`, `Estadual`, `Federal`, `Senador`\
**And** the "Todos" chip shows the total count from the summary endpoint\
**And** the other chips do **not** show counts (kept clean; counts on every chip add visual noise
the prototype intentionally omits)

### Scenario · Tap a level chip

**Given** the user taps "Federal"\
**When** the action runs\
**Then** "Federal" becomes the active chip (slate-900 + white) and "Todos" becomes inactive\
**And** the group sections collapse and a single flat result list renders under a "Resultados ·
{count}" header\
**And** only officials with `level = federal_lower` appear (note: `Senador` is a separate chip, see
next scenario)\
**And** the result list paginates with cursor as needed

### Scenario · Level chip semantics

**Given** the chip-to-level mapping\
**When** a chip is active\
**Then** the mapping is:

- Todos → no level filter
- Municipal → `municipal_executive` ∪ `city_council`
- Estadual → `state_assembly`
- Federal → `federal_lower`
- Senador → `federal_senate` **And** the mapping is sourced from a single config
  (`level-chip-mapping.ts`) — never duplicated across hook and component

### Scenario · Search by name

**Given** the user types in the search bar\
**When** they pause for **300 ms**\
**Then** the query fires server-side and the result list updates\
**And** matching is **diacritic-insensitive and case-insensitive** ("joao" matches "João")\
**And** matching is a substring on `full_name` (not full-text — name list is small)\
**And** the group sections collapse like in the level-chip scenario (results render flat under
"Resultados · {count}")

### Scenario · Search + filter combined

**Given** the user has "Federal" active and types "helena"\
**When** the query resolves\
**Then** results match both: federal_lower officials whose name contains "helena"\
**And** clearing the search keeps the level filter active\
**And** clearing the level filter (tapping "Todos") keeps the search active

### Scenario · Empty results

**Given** the active query + filter yields zero results\
**When** the empty state renders\
**Then** the flat result list area shows a quiet empty state with the message "Ninguém encontrado
para essa busca." and a "Limpar filtros" link\
**And** the KPI hero, sources card, and disclaimer card remain visible

### Scenario · Reset

**Given** the user has filters active and taps "Limpar filtros" from the empty state OR clears the
search and taps "Todos"\
**When** the reset runs\
**Then** the screen restores to the default grouped view (task 02) without re-fetching the summary

### Scenario · Persistence

**Given** the user picked a filter or search query\
**When** they leave the screen and return within the same session\
**Then** the filter persists for the session\
**And** both reset on cold start

### Scenario · Localization

**Given** en-US\
**When** chips render\
**Then** labels translate ("All · 23", "City", "State", "Federal", "Senator")\
**And** the "Resultados · {count}" label translates\
**And** the search placeholder translates ("Search politician…")

### Scenario · Accessibility

**Given** SR is on\
**When** the user navigates chips\
**Then** each is announced with label and selection state ("Federal, selecionado")\
**And** the search bar is announced as a search field\
**And** typing announces the result-count update via a polite live region

## Frontend (React Native)

```
apps/city-hero/src/screens/ElectedOfficials/
├── components/
│   └── OfficialsResultsList.tsx     (flat list shown when filter/search active)
├── hooks/
│   ├── useOfficialsLevelFilter.ts
│   └── useOfficialsSearch.ts
└── config/
    └── level-chip-mapping.ts        (chip → level enum mapping; single source)
```

- This task does **not** create any chip or input component. It passes chip definitions (id, label,
  active) to the shared `FilterChipRow` and renders the shared `SearchBar` atom.
- `useOfficialsLevelFilter` owns the active chip id and exposes the derived level array (via
  `level-chip-mapping.ts`).
- `useOfficialsSearch` debounces input by 300 ms and exposes the current query.
- When either filter or search is active, `OfficialsResultsList` replaces the four groups from task
  02 and consumes an extended `useElectedOfficials` hook variant that accepts `level[]` + `q`.

## Backend (FastAPI)

The list endpoint from task 02 gains two query params:

| Param   | Type     | Notes                                                 |
| ------- | -------- | ----------------------------------------------------- |
| `level` | repeated | Already defined in task 02 (accepts multiple values)  |
| `q`     | string   | Substring match on `full_name`, diacritic-insensitive |

- `q` is matched server-side using PostgreSQL `unaccent()` + `ILIKE`. The screen relies on the
  backend for the diacritic insensitivity so a future web view shares the same semantics.
- `q` length: min 1, max 64. Server returns 400 on overflow.
- Multi-tenant scoping by `city_id` still mandatory.

## Database

- `elected_officials.full_name` indexed via a `unaccent_lower(full_name)` functional index so
  `ILIKE` queries with `q` are fast.

## Edge Cases

- **Very short query (1 char)**: still allowed; returns generously.
- **Query contains accented characters**: the input is normalized client-side before sending so the
  URL stays clean.
- **User selects "Senador" in a city with no senators in the roster (rare but possible until the
  federal sync runs)**: shows the empty state with the standard "Limpar filtros" hint.

## Privacy / LGPD

The search query is sent to the backend but never logged with PII (server logs strip the `q` param).

## Analytics

| Event                                | When                                | Props                          |
| ------------------------------------ | ----------------------------------- | ------------------------------ |
| `elected_officials.filter_changed`   | Chip tapped                         | `from`, `to`                   |
| `elected_officials.search_submitted` | Debounce fired with non-empty query | `query_length`, `result_count` |
| `elected_officials.search_cleared`   | User cleared the search input       | —                              |
| `elected_officials.filters_reset`    | User tapped "Limpar filtros"        | —                              |

> **Privacy note:** `query_length` is logged, not the query text.

## Tests

- **Unit**: chip → level mapping; debounce timing; reset logic; active-filter→flat-list switch.
- **Integration**: filter + search combine; empty state renders; persistence across navigation.
- **A11y**: chips labeled with state; search labeled; live region announces result count.
- **Backend**: `unaccent` query returns expected matches for accented names; multi-tenant scoping
  holds with filters.

## Definition of Done

- [ ] `SearchBar` and `FilterChipRow` integrated (no local chip / input components)
- [ ] `useOfficialsLevelFilter` + `useOfficialsSearch` hooks
- [ ] `level-chip-mapping.ts` single-source config
- [ ] `OfficialsResultsList` flat result view
- [ ] Backend `q` and multi-`level` params
- [ ] `unaccent` functional index
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-officials-ui-base.md`
- List + grouping (consumed): `02-officials-list-and-grouping.md`
- Component inventory (SearchBar, FilterChipRow, Badge): `docs/engineering/component-inventory.md`
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`
