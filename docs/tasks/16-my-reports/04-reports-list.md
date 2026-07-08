# My Reports · Reports list

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 16 · My Reports
> **Effort:** M (1-2 days)
> **Dependencies:** `16-my-reports/01-render-my-reports-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `ux`

## Context

The actual list of reports — each rendered as a compact row inside a
single white card with rounded corners. Each row has: a category-color
square with emoji, a title ("Buraco · R. São Pedro"), date + age
("22/03 · há 2 dias"), and a status pill on the right ("RESOLVIDO",
"EM ANDAMENTO", "TRIAGEM"). Resolved rows include a small secondary
line with the user's XP earned and a "Foto depois disponível ✓"
indicator.

Anonymous reports show with a 🥷 indicator (small) in the row. Tapping
a row routes to the correct detail screen based on status.

## User Story

**As a** Citizen,
**I want** my reports list to be scannable and clickable,
**In order to** revisit any one quickly.

## Acceptance Criteria

### Scenario · Default render

**Given** the user has reports
**When** the list renders
**Then** rows appear in a single white card with rounded corners
**And** each row has: category square with emoji, title, date + relative age, status pill
**And** rows are separated by subtle dividers

### Scenario · Resolved row extras

**Given** a row is resolved
**When** it renders
**Then** below the title, a secondary line shows the XP earned (value sourced from the backend) and a "Foto depois disponível ✓" indicator
**And** tapping such a row routes to SCREEN 14 (Detail · Ticket)

### Scenario · In-progress row

**Given** a row is in progress
**When** rendered
**Then** the status pill is amber "EM ANDAMENTO"
**And** tapping routes to SCREEN 13 (Detail · Em andamento)

### Scenario · Triagem row

**Given** a row is in triage (not yet picked up by the prefecture's pipeline)
**When** rendered
**Then** the status pill is slate "TRIAGEM"
**And** tapping routes to SCREEN 13 (Detail · Em andamento) — the user still sees their report; the timeline reflects the early state

### Scenario · Merged row

**Given** a row was merged into a parent (per SCREEN 17)
**When** rendered
**Then** the status pill is slate "MESCLADO"
**And** tapping routes to SCREEN 17 (Detail · Reporte Mesclado)

### Scenario · Anonymous indicator

**Given** a row's report is anonymous
**When** rendered
**Then** a small 🥷 emoji or "Anônimo" pill appears next to the title (or below it)
**And** the row otherwise behaves identically

### Scenario · Pagination

**Given** the user has many reports
**When** scrolling near the end of the loaded items
**Then** the next page is fetched (cursor-based)
**And** loading indicators show during fetch
**And** the end-of-list marker indicates "Você chegou ao fim"

### Scenario · Filter applied

**Given** the user picked a filter (per task 02)
**When** the list renders
**Then** only matching rows are shown
**And** the count badge on the filter chip matches the filtered count

### Scenario · Pull-to-refresh

**Given** the user pulls down
**When** the gesture completes
**Then** the list refetches from page 1
**And** real-time updates merge cleanly

### Scenario · Real-time updates

**Given** a report's status changes via real-time
**When** the change arrives
**Then** the relevant row updates inline (status pill change with a small animation)
**And** if a filter excludes the row's new state, it fades out

### Scenario · Offline pending items

**Given** the offline queue has items (handled by task 03's card)
**When** the list renders
**Then** the queued items do **not** also appear in the list (they're conceptually separate)
**And** when they sync, they appear in the list naturally

### Scenario · Performance with many rows

**Given** the user has 100+ reports
**When** the list renders
**Then** virtualization is used (FlashList preferred) so rendering stays smooth
**And** images and chips lazy-load

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the list
**Then** each row is announced as a group with the title, date, and status
**And** the anonymous indicator is announced when present

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/MyReports/
├── components/
│   ├── ReportRow.tsx
│   └── ReportsList.tsx
└── hooks/
    └── useMyReports.ts
```

### Component behavior

- `useMyReports` is a TanStack `useInfiniteQuery` keyed on the user, city, and active filter. It returns `data`, `fetchNextPage`, `hasNextPage`, `refetch`, etc.
- `ReportsList` is a virtualized list (FlashList) that renders rows.
- `ReportRow` is presentational with status pill, XP indicator, anonymous indicator, and a tap callback that routes by status.

## Backend (FastAPI)

### Endpoint

| Method | Path                                                          | Purpose                              |
|--------|---------------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/users/me/reports?filter=&cursor=&limit=`             | Paginated list of the user's reports |

The endpoint:

- Filters by status / anonymity / pending (which is purely client-side).
- Returns rows sorted by `created_at desc` (most recent first).
- Multi-tenant scoping enforced.

## Database

Reuses the `reports` table. An index on `(user_id, created_at desc)` supports fast pagination.

## Edge Cases

- **Recently deleted reports** (soft-deleted by the user): hidden by default; could be shown under a future "Excluídos" filter.
- **Reports from a previous city** (the user switched cities): filtered by current `city_id` by default; future feature could allow cross-city view for the user.
- **Multi-status row variations** (rare ad-hoc states like "Bloqueado"): rendered with a generic muted style and the appropriate label.

## Privacy / LGPD

- The list only shows the user's own reports.
- For anonymous reports, the 🥷 indicator reminds the user of their privacy choice.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `my_reports.list_loaded`           | First page rendered                        | `count`, `filter`                     |
| `my_reports.row_pressed`           | User tapped a row                          | `report_id`, `status`                 |
| `my_reports.next_page_loaded`      | Subsequent page rendered                   | `count`                               |
| `my_reports.pull_to_refresh`       | User pulled to refresh                     | —                                     |

## Tests

- **Unit (frontend)**: row variants (status, anonymous, resolved + XP indicator); routing by status; virtualization renders correctly.
- **Unit (backend)**: filter behavior; cursor stability; multi-tenant scoping.
- **Integration**: filter change triggers refetch; real-time updates merge.
- **E2E**: tap a resolved row → SCREEN 14 opens; tap an in-progress row → SCREEN 13.

## Definition of Done

- [ ] ReportRow + ReportsList components
- [ ] useMyReports hook with infinite scroll
- [ ] Backend endpoint with filter + pagination
- [ ] Status routing on row tap
- [ ] Real-time updates wired
- [ ] Pull-to-refresh
- [ ] Anonymous indicator
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (REST, multi-tenant, pagination): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- TanStack Query infinite queries: https://tanstack.com/query/latest/docs/react/guides/infinite-queries
- Shopify FlashList: https://shopify.github.io/flash-list/

### Project context
- Render UI base: `01-render-my-reports-ui-base.md`
- Status summary (drives filter): `02-status-summary.md`
- Detail screens (destinations): `docs/tasks/13-detail-in-progress/`, `docs/tasks/14-detail-ticket/`, `docs/tasks/17-detail-merged/`
- `CLAUDE.md`
