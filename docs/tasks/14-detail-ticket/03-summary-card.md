# Detail · Ticket · Summary card variant

> **Type:** Screen feature · UI + content variant
> **Screen:** SCREEN 14 · Detail · Ticket (resolved)
> **Effort:** S (≤1 day)
> **Dependencies:** `14-detail-ticket/01-render-detail-ticket-ui-base.md`, `13-detail-in-progress/03-summary-card.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The summary card on the resolved-detail screen reuses the **same
component** from SCREEN 13's task 03 with two stat-row differences:

- The third stat changes from "SLA restante" (countdown) to **"Atendido
  em N dias"** (positive framing of the resolution duration).
- The third stat's color is emerald (resolved) instead of amber
  (in-progress).

Title, attribution, and the first two stats (Apoios, Comentários) work
identically.

## User Story

**As a** Citizen viewing a resolved report,
**I want** to see how long it took to resolve at a glance,
**In order to** internalize the prefecture's responsiveness.

## Acceptance Criteria

### Scenario · Default render

**Given** the report is resolved
**When** the summary card renders
**Then** the title, attribution, and Apoios + Comentários stats render exactly as on SCREEN 13
**And** the third stat is "Atendido em" with the duration ("2d" or "1 semana", etc.)
**And** the duration is computed from `created_at` to `resolved_at`
**And** the duration cell uses emerald color (positive)

### Scenario · Very fast resolution

**Given** the duration is under 24 hours
**When** the stat renders
**Then** it shows "em <1d" or "em 6h" (specific) depending on magnitude
**And** an optional small "⚡" prefix for very fast (under 6 hours) emphasizes speed

### Scenario · Very long resolution

**Given** the duration is over 30 days
**When** the stat renders
**Then** it shows "em 1 mês" / "em 2 meses" abstractly
**And** there's no shame framing — just facts

### Scenario · Attribution unchanged

**Given** the report is identified or anonymous
**When** the attribution renders
**Then** it follows the same rules as SCREEN 13 (identified → reporter name; anonymous → 🥷 Herói Anônimo; owner → "Você reportou")
**And** distance from user still applies

### Scenario · Real-time stat updates

**Given** the stats can still change after resolution (rare: someone supports a resolved report for the visibility / historical interest)
**When** the WebSocket pushes a count change
**Then** the stat updates
**And** "Atendido em" doesn't change (it's based on resolved_at, not now)

### Scenario · Localization

**Given** the user's language is en-US
**When** the card renders
**Then** "Atendido em" is "Resolved in"
**And** the duration formats follow English ("in 2 days", "in 1 week")

### Scenario · Accessibility

**Given** screen reader is on
**When** the card is read
**Then** the stat row is announced ("34 supports, 8 comments, resolved in 2 days")

## Frontend (React Native)

### Where it lives

Reuses the `SummaryCard` and `StatsRow` components from `13-detail-in-progress/03`. This task adds a `variant: 'resolved' | 'in_progress'` prop and the conditional stat content.

```
apps/mobile/src/screens/DetailTicket/
└── components/
    └── (reuses SummaryCard from DetailInProgress, with variant prop)
```

### Variant behavior

When `variant === 'resolved'`, the third stat:

- Label changes to "Atendido em" / "Resolved in".
- Value is `formatDuration(created_at, resolved_at)`.
- Color is emerald.

When `variant === 'in_progress'`, the behavior is per SCREEN 13.

The screen passes the appropriate variant based on the report's state.

## Backend (FastAPI)

The report detail response includes `resolved_at` (when applicable). No new endpoint.

## Database

The `reports.resolved_at` field is set when the report transitions to `resolved`. Schema owned by the report lifecycle flow.

## Edge Cases

- **`resolved_at` missing on a resolved report** (data inconsistency): fall back to the latest timeline event's date.
- **Resolution duration changed mid-render** (rare race): re-render uses the new value; no animation needed.

## Privacy / LGPD

Same as SCREEN 13's summary card; no new PII handling.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_ticket.summary_rendered`   | Card mounted                               | `resolution_duration_days_bucket`     |

## Tests

- **Unit**: duration formatting (sub-day, days, weeks, months); variant prop switches the third stat.
- **Snapshot**: each duration bucket.
- **A11y**: read order verified.

## Definition of Done

- [ ] Variant prop added to SummaryCard
- [ ] Duration formatter
- [ ] Emerald color for resolved stat
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture (variant pattern): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- date-fns formatDistance: https://date-fns.org/v3.0.0/docs/formatDistance

### Project context
- Render UI base: `01-render-detail-ticket-ui-base.md`
- SCREEN 13 summary card: `13-detail-in-progress/03-summary-card.md`
- `CLAUDE.md`
