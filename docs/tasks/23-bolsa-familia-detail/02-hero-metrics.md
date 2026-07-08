# Bolsa Família · Hero metrics card

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 23 · Bolsa Família Detail
> **Effort:** S (≤1 day)
> **Dependencies:** `23-bolsa-familia-detail/01-render-bolsa-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `backend`, `screen`

## Context

A gradient hero card (sky → teal) showing program KPIs for the active city: famílias atendidas, valor mensal total, valor anual estimado, % da população. A small "Fonte: Portal da Transparência · {month/year}" freshness footnote and a "Ver no Portal" external link.

## Acceptance Criteria

### Scenario · Default render

**Given** data is loaded
**When** the card renders
**Then** gradient card shows program emoji + name + short description
**And** a 4-cell KPI grid: famílias, valor mensal, valor anual, % população
**And** footer: source + freshness + external link

### Scenario · External link

**Given** the user wants the source data
**When** they tap "Ver no Portal"
**Then** the OS browser opens the Portal da Transparência page for the city's program

### Scenario · Data missing for a KPI

**Given** the city lacks a specific metric
**When** the cell renders
**Then** it shows "—" with a tooltip-explainer

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** "Families served", "Monthly value", "Annual estimate", "% population"; currency formats per locale

### Scenario · Accessibility

**Given** SR is on
**When** the card is read
**Then** announced as a group with program identity and each KPI's value + label

## Frontend

```
apps/city-hero/src/screens/BolsaFamiliaDetail/
├── components/
│   └── HeroMetricsCard.tsx
└── hooks/
    └── useBolsaFamiliaMetrics.ts
```

## Backend

| Method | Path                                                          | Purpose                              |
|--------|---------------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/cities/{id}/programs/bolsa-familia`                  | Program-specific metrics             |

Multi-tenant scoped; the backend joins federal Portal da Transparência with the city's local data.

## Database

A normalized `program_metrics` table aggregates per-city per-program data.

## Edge Cases

- **Data > 6 months stale**: warning footnote.

## Privacy / LGPD

Aggregated only.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `bolsa_familia.hero_rendered`      | Card mounted                               | `families_count`, `freshness_days`   |
| `bolsa_familia.external_link_pressed` | User opened Portal                      | —                                     |

## Tests

- **Unit**: rendering with full + missing data; external link.
- **Snapshot**: states.
- **A11y**: group + KPIs labeled.

## Definition of Done

- [ ] HeroMetricsCard component
- [ ] useBolsaFamiliaMetrics hook
- [ ] Backend endpoint
- [ ] External link integration
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-bolsa-ui-base.md`
- Portal da Transparência (federal): https://portaldatransparencia.gov.br/
- `CLAUDE.md`
