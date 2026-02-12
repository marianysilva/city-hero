# Programs · Summary strip

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 22 · Programs & Transparency
> **Effort:** S (≤1 day)
> **Dependencies:** `22-programs-transparency/01-render-programs-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `backend`, `screen`

## Context

A gradient (teal → indigo) summary card showing city-wide rolled-up
metrics: "{city} · abr/2026", "11 programas monitorados", plus three
KPI cells: R$ investido/ano, beneficiários, níveis de governo. This
anchors the user in the scale of what they're about to see.

## Acceptance Criteria

### Scenario · Default render

**Given** the data is loaded
**When** the strip renders
**Then** a gradient teal→indigo card appears below the header
**And** displays: 🔍 icon, "{city} · {month/year}" kicker, "{N} programas monitorados" headline
**And** three KPI cells: "R$ {value}M investido/ano", "{N} beneficiários", "{N} níveis de gov."

### Scenario · Data freshness

**Given** the data has a `last_updated_at`
**When** the strip renders
**Then** a small footnote "Atualizado em {date}" appears
**And** clicking shows the data source

### Scenario · Real-time recompute

**Given** new programs are added or values change
**When** the data refreshes
**Then** the strip recomputes seamlessly

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** copy translates ("11 programs monitored", "{currency} invested/year", etc.)

### Scenario · Accessibility

**Given** SR is on
**When** the strip is read
**Then** it's announced as a group with the city, period, and the three KPIs

## Frontend

```
apps/mobile/src/screens/Programs/
├── components/
│   └── SummaryStrip.tsx
└── hooks/
    └── useProgramsCitySummary.ts
```

The hook fetches `/api/v1/cities/{id}/programs/summary` (count, total budget, beneficiaries, levels).

## Backend

| Method | Path                                              | Purpose                              |
|--------|---------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/cities/{id}/programs/summary`            | Aggregated metrics                  |

Sourced from dbt-materialized tables that join Portal da Transparência + municipal data.

## Database

Analytical fact tables aggregate by city + program.

## Edge Cases

- **Data sources stale**: footnote shows the actual freshness; user knows.
- **Cities with few programs**: numbers honest (e.g., "3 programas monitorados").

## Privacy / LGPD

Aggregate data only.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `programs.summary_rendered`    | Strip mounted                              | `programs_count`, `freshness_days`   |
| `programs.freshness_pressed`   | User tapped freshness footnote             | —                                     |

## Tests

- **Unit**: render with numbers; localization; missing freshness fallback.
- **Snapshot**: variants.
- **A11y**: group announced.

## Definition of Done

- [ ] SummaryStrip component
- [ ] useProgramsCitySummary hook
- [ ] Backend summary endpoint
- [ ] Freshness footnote
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/coding-standards.md`, `architecture-patterns.md`, `testing-strategy.md`
- Render UI base: `01-render-programs-ui-base.md`
- `features.md` § 4 + § 6 (analytics pipeline)
- `CLAUDE.md`
