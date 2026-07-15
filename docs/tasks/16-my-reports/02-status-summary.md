# My Reports · Status summary (KPI strip + filter chips)

> **Type:** Screen feature · UI + state\
> **Screen:** SCREEN 16 · My Reports\
> **Effort:** S (≤1 day)\
> **Dependencies:** `16-my-reports/01-render-my-reports-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

Two stacked compact UI elements at the top of the scroll area:

- **KPI strip**: 4 small cards showing Total, Resolvidos (emerald), Em andamento (amber), Triagem
  (slate). Each is read-only and serves as an overview.
- **Filter chips row**: Todos (default), Pendentes ⚠️ N (if any offline), Em andamento, Resolvidos,
  Anônimos. Tapping a chip narrows the list below.

Together they let the user understand their portfolio at a glance and drill into a specific subset.

## User Story

**As a** Citizen,\
**I want** a status overview and filters,\
**In order to** quickly find a specific report or see my impact metrics.

## Acceptance Criteria

### Scenario · KPI strip render

**Given** the user has 47 reports (38 resolved, 7 in progress, 2 triage)\
**When** the strip renders\
**Then** four small cards appear: "47 Total", "38 Resolv.", "7 Andam.", "2 Triag."\
**And** the resolved cell uses emerald, in-progress amber, triage slate

### Scenario · Filter chips render

**Given** the user is on the screen\
**When** the chips render\
**Then** "Todos" (default active) appears first with a count badge\
**And** "Pendentes ⚠️ N" appears if there are offline-queued reports\
**And** "Em andamento", "Resolvidos", "Anônimos" appear next

### Scenario · Tap a filter

**Given** the user taps "Em andamento"\
**When** the action runs\
**Then** the chip becomes active\
**And** the list (task 04) refetches with the filter applied\
**And** the KPI strip stays unchanged (it always reflects the global totals)

### Scenario · Tap "Anônimos"

**Given** the user wants to see only anonymous reports\
**When** they tap "Anônimos"\
**Then** the list shows only `anonymous: true` reports\
**And** these show with the 🥷 indicator on each row (per the row component in task 04)

### Scenario · Tap a KPI card

**Given** the user taps the "Resolvidos" KPI cell\
**When** the action runs\
**Then** the filter chip "Resolvidos" becomes active (acting as a shortcut)\
**And** the list filters accordingly

### Scenario · Counts update in real time

**Given** a report's status changes (e.g., resolves in real time)\
**When** the WebSocket pushes the change\
**Then** the KPI strip updates with the new totals\
**And** the chips' badges update if they have counts

### Scenario · Persisted filter selection

**Given** the user picked a filter and left the screen\
**When** they return\
**Then** the filter persists for the session\
**And** is reset on app cold start (or after a long inactivity)

### Scenario · Localization

**Given** the user's language is en-US\
**When** the strip and chips render\
**Then** labels translate ("Total", "Resolved", "In progress", "Triage", "Pending", "Anonymous")

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates\
**Then** KPI cards are announced as a group ("Total 47, Resolved 38, In progress 7, Triage 2")\
**And** filter chips are announced with their state and counts

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/MyReports/
├── components/
│   └── KpiStrip.tsx
└── hooks/
    └── useMyReportsFilters.ts
```

The chip row renders the shared `FilterChipRow` from `@cityhero/design-system`. The screen owns the
chip definitions and the `onChipPress` callback that filters the data; no styling lives in this
screen's components. See `docs/engineering/component-inventory.md` (row `FilterChipRow`) and
`docs/engineering/design-system.md`.

### Component behavior

- `useMyReportsFilters` is a store (Zustand) holding the active filter and the global KPI totals.
- `KpiStrip` renders the four cards; tapping each maps to a corresponding filter (it calls the same
  store setter that the chips use).
- The screen builds the chip array and passes it to `FilterChipRow` with an `onChipPress(id)`
  callback that updates the store.
- The list (task 04) reads from the store; KPI totals are read from the user's profile or a
  dedicated endpoint.

### Chip list this screen passes to `FilterChipRow`

- `Todos` — initial `active: true`; `count` is the global total.
- `Pendentes` — only rendered when there are offline-queued reports; `icon` set to ⚠️, `count`
  reflects the offline queue size.
- `Em andamento` — filters to `status = in_progress`.
- `Resolvidos` — filters to `status = resolved`.
- `Anônimos` — filters to `anonymous = true`.
- The KPI strip taps reuse the same chip IDs to flip the active state.

## Backend (FastAPI)

The reports list endpoint accepts a `filter` query param matching the chip key (`all`, `pending`,
`in_progress`, `resolved`, `anonymous`). KPI totals can come from the same endpoint's headers or a
dedicated `/api/v1/users/me/reports/stats` endpoint (single-cell read).

## Database

No new schema. The `reports` table is queried by status, anonymity, and sync state (the pending
count comes from the offline queue locally).

## Edge Cases

- **No reports yet**: KPI cells show 0s; filter chips still work (yielding empty lists handled by
  task 05).
- **Recently resolved report (within the last few seconds)**: the count animates; the list reflows.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                       | When                   | Props        |
| --------------------------- | ---------------------- | ------------ |
| `my_reports.kpi_pressed`    | User tapped a KPI card | `kpi: total  | resolved | in_progress | triage` |
| `my_reports.filter_changed` | Chip tapped            | `from`, `to` |

## Tests

- **Unit**: store transitions; KPI tap maps to filter; chip counts update.
- **Integration**: filter change triggers list refetch.
- **A11y**: groups announced.

## Definition of Done

- [ ] KpiStrip component
- [ ] Chip list definition + filter callback (no local chip component)
- [ ] `FilterChipRow` integration verified visually in Storybook
- [ ] `useMyReportsFilters` store
- [ ] Persistence within session
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-my-reports-ui-base.md`
- Reports list (consumes filters): `04-reports-list.md`
- Shared chip molecule: `docs/engineering/component-inventory.md` (row `FilterChipRow`)
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`
