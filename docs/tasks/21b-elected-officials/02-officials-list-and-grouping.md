# Elected Officials · List + grouping

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 21b · Politicians of the City
> **Effort:** M (1-2 days)
> **Dependencies:** `21b-elected-officials/01-render-officials-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `data`

## Context

Fetches the elected officials for the active city, groups them by
level into the four group slots defined in task 01, paginates within
each large group (city council = 11; state assembly may exceed the
inline cap), and handles loading + network-error states. The screen
also fetches the KPI summary that powers the hero in task 01.

Each card is rendered by `OfficialCard`, a **molecule local to this
screen** (the only consumer today). The card surfaces: photo (or a
👤 fallback square), name (extrabold), party acronym in a colored
`Badge`, role + level, mandate range, votes received in the city,
and a CTA placeholder for the Portal da Transparência button (the
deeplink behavior itself is task 04). The card layout, copy, and
secondary share button match the prototype exactly.

> **Promotion rule:** `OfficialCard` lives at
> `apps/city-hero/src/screens/ElectedOfficials/components/OfficialCard.tsx`
> until a second consumer appears. If any other screen needs an
> "official-style person card", promote it to `packages/design_system`
> per the design-system promotion rule and update
> `docs/engineering/component-inventory.md`.

## User Story

**As a** Citizen,
**I want** to see who represents me, organized by level of government,
**In order to** scan the chain of representation quickly.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen with no filter
**When** the lists render
**Then** officials are grouped under the four section headers in fixed order: Executivo municipal · Câmara municipal · Assembleia Legislativa (UF) · Câmara dos Deputados + Senado
**And** within each group, officials sort by `role_rank asc, votes_in_city desc, name asc` (role_rank pins the mayor above the vice; the council president above other vereadores; otherwise role order is alphabetical)
**And** each card shows the fields listed in Context
**And** the section header includes the relevant scope qualifier (e.g., "Assembleia Legislativa (SC) · votação relevante na cidade")

### Scenario · In-group pagination

**Given** a group exceeds the inline cap (default: **2 cards visible per group on first render**)
**When** the group renders
**Then** the first 2 cards show
**And** a full-width "Ver os outros N {role_plural} →" button shows below them
**And** tapping the button expands the group inline (no navigation) and replaces itself with a "Mostrar menos" button
**And** the expansion fetches the remaining records lazily (cursor-paginated) if not already loaded

### Scenario · Inline cap per group

**Given** the four groups
**When** they render with no filter
**Then** the inline cap is:

- Executivo municipal: 2 (always shows both — never collapsed)
- Câmara municipal: 2 cards + collapse button
- Assembleia Legislativa (UF): 1 card + collapse button
- Câmara dos Deputados + Senado: 2 cards + collapse button
  **And** the cap values are sourced from a single config object — never hardcoded across components

### Scenario · Loading state

**Given** the screen mounts and data is in flight
**When** the lists render
**Then** each group slot shows a `Skeleton` (atom) representing 2 cards
**And** the KPI hero shows its own `Skeleton` (see task 01)
**And** the search and chip slots render in their idle state and are not interactive until first data arrives

### Scenario · Error state (network)

**Given** the fetch fails (timeout, 5xx, no connectivity)
**When** the error state renders
**Then** an inline `Banner` (atom, variant `warning`) replaces the four group slots with the copy "Não foi possível carregar os eleitos. Verifique sua conexão." and a "Tentar novamente" action
**And** the KPI hero, sources card, and disclaimer card still render — only the lists are affected
**And** tapping retry refetches both the summary and the list

### Scenario · Cached render (offline / second visit)

**Given** the user has visited the screen before and has cache
**When** they open it again with no connectivity
**Then** the cached lists render with a small "Dados de {date}" timestamp under the KPI hero
**And** the screen does not show the error banner

### Scenario · Tap a card body

**Given** the user taps a card body (not the Portal CTA, not the share button)
**When** the action runs
**Then** nothing navigates (this MVP has no per-official detail screen)
**And** a subtle haptic confirms the tap was registered without action
**And** the screen logs a `elected_officials.card_pressed` event (see Analytics) so we can decide later whether a detail screen is worth building

### Scenario · Localization

**Given** the user's locale is en-US
**When** lists render
**Then** section headers translate ("City executive", "City council", "State assembly", "Chamber of Deputies + Senate")
**And** role labels translate ("Mayor", "Vice-mayor", "City councillor", "State representative", "Federal representative", "Senator")
**And** the "votes in city" count uses locale number formatting

### Scenario · Performance

**Given** the council has many vereadores and the user expanded the group
**When** the list renders
**Then** the expanded cards lazy-load their photos and use the `Avatar` atom for the fallback
**And** scrolling stays smooth on mid-range devices

### Scenario · Accessibility

**Given** screen reader is on
**When** cards are navigated
**Then** each card is announced as a group with: name, party, role, level, mandate, votes
**And** the expand button is announced with its action ("expandir", "recolher")
**And** the error banner's retry action is focusable

## Frontend (React Native)

```
apps/city-hero/src/screens/ElectedOfficials/
├── components/
│   ├── OfficialsGroup.tsx
│   ├── OfficialCard.tsx
│   └── GroupExpandButton.tsx
├── hooks/
│   ├── useElectedOfficials.ts
│   └── useElectedOfficialsSummary.ts
└── config/
    └── group-caps.ts        (inline cap per group; single source)
```

- `useElectedOfficialsSummary` is a TanStack `useQuery` keyed on
  `city_id`. Powers the KPI hero in task 01.
- `useElectedOfficials` is a TanStack `useInfiniteQuery` keyed on
  `(city_id, level)`. Each group hook instance is independent so
  expanding one group doesn't force-refetch the others.
- `OfficialsGroup` is presentational + owns the expand/collapse state
  for its group (the group cap and the collapse copy come from
  `group-caps.ts`).
- `OfficialCard` is a local molecule; reuses the `Badge` and
  `Avatar` atoms from the design system. The Portal CTA renders as a
  disabled-shaped placeholder until task 04 wires the action.

## Backend (FastAPI)

| Method | Path                                                          | Purpose                           |
| ------ | ------------------------------------------------------------- | --------------------------------- |
| GET    | `/api/v1/cities/{id}/elected-officials/summary`               | Totals for the KPI hero           |
| GET    | `/api/v1/cities/{id}/elected-officials?level=&cursor=&limit=` | Paginated officials for one level |

- Both endpoints multi-tenant scope by `city_id`.
- `level` accepts: `municipal_executive`, `city_council`,
  `state_assembly`, `federal_lower`, `federal_senate`. The list
  endpoint may accept multiple values (`level=federal_lower&level=federal_senate`)
  so the "Câmara dos Deputados + Senado" group can be fetched in one
  request.
- Sort: server applies `role_rank asc, votes_in_city desc, name asc`
  as defined above.
- Response items expose: `id`, `name`, `party_acronym`, `party_name`,
  `role`, `level`, `mandate_start`, `mandate_end`, `votes_in_city`,
  `photo_url`, `has_transparency_id` (boolean — never the raw ID
  here; see task 04), `source`, `last_synced_at`. **CPF and
  `cpf_hash` are not included in any response.**
- The summary endpoint returns `{ total, by_level: { ... } }` plus
  `last_synced_at` for the "Dados de {date}" timestamp.

## Database (PostgreSQL)

Table `elected_officials` (created by task 05):

| Column            | Type        | Notes                                          |
| ----------------- | ----------- | ---------------------------------------------- |
| `id`              | uuid PK     |                                                |
| `city_id`         | uuid FK     | Multi-tenant scope; indexed                    |
| `full_name`       | text        | Public                                         |
| `cpf_hash`        | text        | Salted hash; **never returned by API**         |
| `party_acronym`   | text        | e.g., "PSD", "PT"                              |
| `party_name`      | text        | Full party name                                |
| `role`            | text        | "prefeito", "vice", "vereador", ...            |
| `level`           | text        | enum (see Backend `level` values)              |
| `mandate_start`   | date        |                                                |
| `mandate_end`     | date        |                                                |
| `votes_in_city`   | integer     | From TSE per-municipality result               |
| `transparency_id` | text NULL   | Portal da Transparência person ID; may be null |
| `photo_url`       | text NULL   | Hosted via official source or CDN cache        |
| `source`          | text        | "tse", "camara", "senado", "city_council"      |
| `last_synced_at`  | timestamptz | When the pipeline last refreshed this row      |

Indexes:

- `(city_id, level, votes_in_city desc)` for the list endpoint sort.
- `(city_id)` for the summary endpoint count.
- Unique on `(city_id, cpf_hash, mandate_start)` to prevent dupes
  when a politician is re-elected.

## Edge Cases

- **Photo missing or 404**: render the 👤 fallback square (`Avatar`
  atom in initial mode).
- **Mandate not yet started** (newly elected, takes office in
  January): row is hidden from the list until `mandate_start <= today`.
- **Mandate ended**: row hidden once `mandate_end < today`. Historical
  view is out of scope for the MVP.
- **Council president flag**: the role string may include the
  qualifier ("Vereador · Pres. da Câmara") sourced from the local
  council scraper. If unknown, render plain "Vereador".
- **Tied votes**: secondary sort by name keeps the order stable.
- **Long names**: card layout wraps the name on a second line; never
  truncates a politician's name with ellipsis (perceived as a slight).

## Privacy / LGPD

- All API responses are public data per LAI / Constitution art. 37.
- `cpf_hash` exists only for internal cross-reference with the
  Portal da Transparência ID and never leaves the backend.
- `has_transparency_id` is a boolean — the raw ID is only included
  in the response for task 04's CTA, scoped to the click.

## Analytics

| Event                               | When                                  | Props                        |
| ----------------------------------- | ------------------------------------- | ---------------------------- |
| `elected_officials.list_loaded`     | First page of any group rendered      | `city_id`, `level`, `count`  |
| `elected_officials.group_expanded`  | User tapped "Ver os outros N..."      | `level`, `count_revealed`    |
| `elected_officials.group_collapsed` | User tapped "Mostrar menos"           | `level`                      |
| `elected_officials.card_pressed`    | User tapped a card body               | `level`, `role`              |
| `elected_officials.list_error`      | Fetch failed                          | `city_id`, `level`, `reason` |
| `elected_officials.retry_pressed`   | User tapped retry on the error banner | `city_id`                    |

## Tests

- **Unit**: group sort order; group cap config; expand/collapse
  state; error banner shows for 5xx; cached state renders the
  timestamp.
- **Integration**: summary + list hooks resolve together;
  multi-level fetch returns the federal+senate group in one request.
- **A11y**: cards announced as groups; expand button announced.
- **Backend**: list endpoint paginates; multi-tenant scope filters by
  `city_id`; no CPF / `cpf_hash` in any response (assert on
  serializer).

## Definition of Done

- [ ] `OfficialsGroup` + `OfficialCard` + `GroupExpandButton`
- [ ] `useElectedOfficials` + `useElectedOfficialsSummary` hooks
- [ ] `group-caps.ts` single-source config
- [ ] Summary + list endpoints
- [ ] Loading, error, cached states
- [ ] Sort order verified server-side
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-officials-ui-base.md`
- Search + filter: `03-search-and-filter.md`
- Transparency deeplink: `04-transparency-deeplink.md`
- Data pipeline (moved to `docs/out-of-mvp/` — depends on Airflow + dbt): `../../out-of-mvp/21b-elected-officials/05-data-ingestion-pipeline.md`
- Component inventory (Avatar, Badge, Banner, Skeleton): `docs/engineering/component-inventory.md`
- `CLAUDE.md`
