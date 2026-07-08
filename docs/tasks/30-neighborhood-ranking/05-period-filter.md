# Neighborhood Ranking · Period filter

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 30 · Neighborhood Ranking
> **Effort:** S (≤1 day)
> **Dependencies:** `30-neighborhood-ranking/01-render-ranking-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A small filter row below the scope toggle with three options: **Mensal** (default, current month), **Anual** (current year), **Total** (lifetime). Switching changes the XP aggregation period and re-fetches the leaderboard.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen renders
**When** the period filter appears
**Then** "Mensal" is active
**And** "Anual" and "Total" appear inactive

### Scenario · Switch period

**Given** the user picks "Anual"
**When** the action runs
**Then** the period flips active
**And** the leaderboard refetches with year-to-date XP

### Scenario · Period reset countdown

**Given** "Mensal" is active
**When** the filter renders
**Then** a small "Reset em N dias" hint shows
**And** at the end of the month, the leaderboard archives and resets

### Scenario · Past periods (future enhancement)

**Given** the user wants to see last month's leaderboard
**When** they tap "Mensal" with a small chevron
**Then** a picker shows past months
**And** for MVP, only the current month is selectable

### Scenario · Persisted in session

**Given** the user picked a period
**When** they leave and return
**Then** the period persists; resets on cold start

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** "Monthly" / "Yearly" / "All time"

### Scenario · Accessibility

**Given** SR is on
**When** the user navigates
**Then** each option is announced with state

## Frontend

```
apps/city-hero/src/screens/NeighborhoodRanking/
├── components/
│   └── PeriodFilter.tsx
└── hooks/
    └── useRankingPeriod.ts
```

## Backend

The leaderboard endpoint accepts a `period` query: `monthly` | `yearly` | `total`. The backend aggregates XP differently per period.

## Database

`monthly_xp_snapshots` table for fast monthly queries; year totals computed from monthly snapshots; lifetime from `users.xp`.

## Edge Cases

- **Period transitions mid-session** (midnight on the 1st): a small refresh handles.
- **Backend slow for "Total"**: cache results aggressively.

## Privacy / LGPD

Period rankings are aggregate; same anonymization rules apply.

## Analytics

| Event                    | When         | Props        |
| ------------------------ | ------------ | ------------ |
| `ranking.period_changed` | User toggled | `to: monthly | yearly | total` |

## Tests

- **Unit**: filter state; refetch on change.
- **Snapshot**: each state.
- **A11y**: labeled.

## Definition of Done

- [ ] PeriodFilter component
- [ ] useRankingPeriod hook
- [ ] Reset countdown
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Top + context (consumes period): `03-top-and-context.md`
- `CLAUDE.md`
