# Public Works List · List + row card

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 26 · Public Works List
> **Effort:** M (1-2 days)
> **Dependencies:** `26-public-works-list/01-render-works-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`

## Context

The scrollable list below the chips. Each row card shows: status pill (colored), title (e.g., "Recapeamento da Av. Atlântica"), address, dates (start/end or current period), budget (when public), contractor (when public), and a small progress bar. Tapping opens SCREEN 27 (Detail).

## Acceptance Criteria

### Scenario · Default render

**Given** the filter is "Todas"
**When** the list renders
**Then** rows appear sorted by `updated_at desc` (most recently active first)
**And** each row has status pill + title + address + dates + progress bar

### Scenario · Card details

**Given** a work has public data
**When** the card renders
**Then** budget shows ("R$ 2,4M") in slate
**And** contractor name (when set) is shown below

### Scenario · Status colors

**Given** different statuses
**When** rendered
**Then** color matches:
  - Em planejamento → slate
  - Em execução → amber (with pulsing dot if very recent activity)
  - Concluída parcialmente → sky
  - Suspensa → rose
  - Concluída → emerald (rare in this list — completed works archive)

### Scenario · Tap to detail

**Given** the user taps a card
**When** the action runs
**Then** the app navigates to SCREEN 27 with the work's ID

### Scenario · Pagination

**Given** many works
**When** the user scrolls
**Then** the next page fetches via cursor

### Scenario · Real-time updates

**Given** a work's status changes
**When** the WS pushes
**Then** the card updates inline (status pill + progress)

### Scenario · Empty per filter

**Given** the filter yields zero results
**When** the empty state renders (per task 05)
**Then** suggests broadening the filter

### Scenario · Accessibility

**Given** SR is on
**When** navigated
**Then** each card is a button announcing its status, title, address, dates

## Frontend

```
apps/mobile/src/screens/PublicWorks/
├── components/
│   ├── WorksList.tsx
│   └── WorkCard.tsx
└── hooks/
    └── usePublicWorks.ts
```

## Backend

| Method | Path                                                                  | Purpose                              |
|--------|-----------------------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/cities/{id}/public-works?status=&category=&cursor=&limit=`   | Paginated active works               |

Multi-tenant scoped. Sorted by `updated_at desc`.

## Database

`public_works` table with: id, city_id, title, address, category, status, start_date, end_date, budget, contractor, geo, progress_pct, updated_at, source_url. Indexes on `(city_id, status, updated_at desc)`.

## Edge Cases

- **Budget undefined**: hide the field; don't show "R$ 0".
- **Contractor info confidential during bidding**: shows "Em licitação".
- **Progress not reported**: omit the bar; show only dates.

## Privacy / LGPD

Public information.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `public_works.list_loaded`         | First page rendered                        | `count`, `filter`                     |
| `public_works.card_pressed`        | User tapped                                | `work_id`, `status`                  |

## Tests

- **Unit**: card variants per status; pagination.
- **Integration**: filter change refetches.
- **A11y**: cards as buttons.

## Definition of Done

- [ ] WorksList + WorkCard components
- [ ] usePublicWorks hook
- [ ] Backend endpoint
- [ ] Status color tokens
- [ ] Real-time integration
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Detail (destination): `docs/tasks/27-public-work-detail/`
- `CLAUDE.md`
