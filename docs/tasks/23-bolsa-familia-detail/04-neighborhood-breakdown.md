# Bolsa Família · Neighborhood breakdown

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 23 · Bolsa Família Detail
> **Effort:** M (1-2 days)
> **Dependencies:** `23-bolsa-familia-detail/01-render-bolsa-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `data`

## Context

A scrollable table listing the city's neighborhoods with their Bolsa Família metrics: famílias atendidas, % famílias do bairro, valor mensal repassado. Useful for identifying concentrations of need.

## Acceptance Criteria

### Scenario · Default render

**Given** breakdown data is available
**When** the table renders
**Then** rows appear (one per bairro) sorted by `families desc`
**And** each row shows bairro name + families count + % share + monthly value
**And** a "Outros" footer aggregates very small bairros if needed

### Scenario · Filter / search

**Given** the city has many neighborhoods
**When** the user uses a search input or filter
**Then** rows filter accordingly

### Scenario · Tap a row

**Given** the user taps a bairro
**When** the action runs
**Then** the bairro's profile screen opens (future) or a sheet shows the same data with context
**And** for MVP, tap is a no-op with informational hover

### Scenario · Privacy guard

**Given** a bairro has fewer than the minimum threshold (e.g., 5 families)
**When** the row renders
**Then** the exact count is replaced with "<5 famílias" to avoid identifying individuals (LGPD)
**And** other cells show "—"

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** column labels translate; values formatted per locale

### Scenario · Accessibility

**Given** SR is on
**When** the table is read
**Then** announced as a table with column headers and row data

## Frontend

```
apps/mobile/src/screens/BolsaFamiliaDetail/
└── components/
    └── NeighborhoodBreakdown.tsx
```

## Backend

| Method | Path                                                                          | Purpose                              |
|--------|-------------------------------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/cities/{id}/programs/bolsa-familia/breakdown-by-neighborhood`        | Neighborhood breakdown                |

Multi-tenant scoped. Applies the privacy threshold server-side.

## Database

`program_metrics_by_neighborhood` aggregates per-bairro per-program per-month.

## Edge Cases

- **Few neighborhoods**: table still works; small list is fine.
- **Stale data**: footnote indicates freshness.

## Privacy / LGPD

The k-anonymity threshold (k=5 default) hides small-count rows to prevent re-identification.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `bolsa_familia.breakdown_rendered` | Table mounted                              | `row_count`, `privacy_hidden_count`  |
| `bolsa_familia.breakdown_searched` | User searched                              | `query_length`                        |

## Tests

- **Unit**: rendering; sort; search filter; privacy threshold.
- **Snapshot**: with and without privacy-hidden rows.
- **A11y**: table announced correctly.

## Definition of Done

- [ ] NeighborhoodBreakdown component
- [ ] Backend endpoint with privacy threshold
- [ ] Search/filter
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Cross-cutting: `docs/engineering/`
- `CLAUDE.md`
