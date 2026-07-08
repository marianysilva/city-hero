# City Profile · Report status mini-dashboard

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 20 · City Profile
> **Effort:** M (1-2 days)
> **Dependencies:** `20-city-profile/01-render-city-profile-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `data-viz`

## Context

A small section titled "Situação dos reportes" with a 2-column grid of
status cards: **Abertos** (rose, "Aguardando análise"), **Em triagem**
(sky, "IA classificando"), **Em andamento** (amber, "Equipes
designadas"), **Resolvidos este mês** (emerald). Each card has a
colored icon square, the count, the status label, and a short
description.

This complements the personal stats in My Reports (`16-my-reports/02`)
with city-wide totals — citizens can see what the prefecture is
processing in aggregate.

## User Story

**As a** Citizen,
**I want** to see the city's overall report load,
**In order to** contextualize my own reports within the system's volume.

## Acceptance Criteria

### Scenario · Default render

**Given** the data is loaded
**When** the dashboard renders
**Then** the section label "SITUAÇÃO DOS REPORTES" appears
**And** below: a 2-column grid of 4 status cards
**And** each card has a colored icon square, count (large bold), status label, and short description

### Scenario · Status colors

**Given** each card represents a status
**When** rendered
**Then** colors match the rest of the app:
  - Abertos → rose
  - Em triagem → sky
  - Em andamento → amber
  - Resolvidos este mês → emerald

### Scenario · Counts update in real time

**Given** new reports are created or status changes (via WebSocket)
**When** the change happens
**Then** the relevant card's count updates with a small pulse animation
**And** the user sees the city's activity is live

### Scenario · Tap a card to filter

**Given** the user taps "Em andamento"
**When** the action runs
**Then** the app navigates to a city-wide report list filtered to that status (a variant of the feed scoped to city, all reports, in_progress)
**And** the user can browse, support, share from there

### Scenario · "Resolvidos este mês" emphasis

**Given** the resolved count is the emotional payoff
**When** the card renders
**Then** it gets slightly larger or visual emphasis (a soft glow or a small "✓ X% sobre o mês passado" annotation)

### Scenario · Localization

**Given** the user's language is en-US
**When** the cards render
**Then** labels are in English ("Open · Awaiting analysis", "In triage · AI classifying", "In progress · Teams assigned", "Resolved this month")

### Scenario · Real-time WebSocket subscription

**Given** the screen is open
**When** the user is on the screen
**Then** a WS subscription to city-level metrics events runs
**And** updates are batched/throttled to avoid render storms

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the cards
**Then** each card is announced as a group with the count and status label
**And** activating a card announces the navigation destination

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CityProfile/
└── components/
    ├── ReportStatusDashboard.tsx
    └── StatusCard.tsx
└── hooks/
    └── useCityReportStatusCounts.ts
```

### Component behavior

- `useCityReportStatusCounts` is a hook that fetches the counts and subscribes to real-time updates.
- `ReportStatusDashboard` renders the section and grid.
- `StatusCard` is a presentational tappable card.

## Backend (FastAPI)

### Endpoint

| Method | Path                                                  | Purpose                                |
|--------|-------------------------------------------------------|----------------------------------------|
| GET    | `/api/v1/cities/{id}/reports/status-counts`           | Counts by status (city-wide)          |

Returns: `{ open, in_triage, in_progress, resolved_this_month, ... }`. Multi-tenant scoping enforced (cross-city access requires admin role).

The data is computed from the operational DB with appropriate indexes, or from a cached snapshot updated every few minutes.

### Real-time delivery

Status-count updates can ride on the same pub/sub stream as report events (per `06-home-map/08`), filtered to city-scope subscribers.

## Database

The `reports` table is queried with status filters. An index on `(city_id, status)` supports fast counting.

## Edge Cases

- **Very high counts (e.g., 1000+)**: numbers format compactly ("1,2k").
- **Stale snapshot**: if cached, a small "atualizado há X min" hint can appear.
- **Backend down**: cards show "—" until data is available; no jarring zero states.

## Privacy / LGPD

Aggregate data only.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `city_profile.dashboard_rendered`  | Mounted                                    | `total_open`, `total_in_progress`    |
| `city_profile.status_card_pressed` | User tapped a card                         | `status`                              |

## Tests

- **Unit**: card rendering per status; tap navigation; real-time updates.
- **Integration**: hook subscribes/unsubscribes correctly.
- **A11y**: card groups announced; navigation destinations clear.

## Definition of Done

- [ ] ReportStatusDashboard + StatusCard
- [ ] useCityReportStatusCounts hook with real-time
- [ ] Backend status-counts endpoint
- [ ] City-wide filtered list as navigation target
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (multi-tenant, real-time): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-city-profile-ui-base.md`
- Real-time pattern: `06-home-map/08-realtime-pin-updates.md`
- My Reports KPI strip (comparison): `16-my-reports/02-status-summary.md`
- `CLAUDE.md`
