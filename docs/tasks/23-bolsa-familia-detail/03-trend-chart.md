# Bolsa Família · Trend chart

> **Type:** Screen feature · UI + data viz\
> **Screen:** SCREEN 23 · Bolsa Família Detail\
> **Effort:** M (1-2 days)\
> **Dependencies:** `23-bolsa-familia-detail/01-render-bolsa-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `data-viz`

## Context

A line or bar chart showing the program's evolution semester-by-semester (or month-by-month) over
the past 24 months: beneficiaries count + total value. Tapping points reveals values; the chart uses
Recharts/Victory-style component or SVG.

## Acceptance Criteria

### Scenario · Default render

**Given** historic data is available\
**When** the chart renders\
**Then** the time axis shows semesters/months and values on the Y-axis\
**And** two series are visible: beneficiaries (line) + total value (bars or secondary line)\
**And** a small legend identifies them

### Scenario · Tap data point

**Given** the user taps a point\
**When** the action runs\
**Then** a tooltip shows the exact value for that point\
**And** dismissing happens on next tap or auto after 3s

### Scenario · Toggle series

**Given** a small legend with toggleable series\
**When** the user taps a series label\
**Then** that series hides/shows\
**And** the chart re-renders

### Scenario · Empty / partial data

**Given** the city is new to the program\
**When** the chart renders\
**Then** a soft empty state appears explaining the data coverage starts at {date}

### Scenario · Localization

**Given** en-US\
**When** rendered\
**Then** legend translates; values formatted per locale

### Scenario · Accessibility

**Given** SR is on\
**When** the chart is read\
**Then** an accessibility summary describes the trend ("Beneficiaries grew from 800 in Jan 2023 to
1240 in Apr 2026")

## Frontend

```
apps/city-hero/src/screens/BolsaFamiliaDetail/
└── components/
    └── ProgramTrendChart.tsx
```

Uses `victory-native` or a small custom SVG chart.

## Backend

The hero metrics endpoint (`02-hero-metrics`) extends to return the time series.

## Database

The `program_metrics_monthly` table holds time-series aggregates.

## Edge Cases

- **Data gaps in the middle of the series**: chart connects continuous segments with gap indicators.

## Privacy / LGPD

Aggregated.

## Analytics

| Event                              | When                | Props               |
| ---------------------------------- | ------------------- | ------------------- |
| `bolsa_familia.chart_rendered`     | Chart mounted       | `data_points_count` |
| `bolsa_familia.chart_point_tapped` | User tapped a point | `point_date`        |

## Tests

- **Unit**: chart renders with N points; tap shows tooltip.
- **Snapshot**: variants.
- **A11y**: summary description.

## Definition of Done

- [ ] ProgramTrendChart component
- [ ] Tap-to-reveal tooltip
- [ ] Series toggling
- [ ] A11y summary
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Library: victory-native or react-native-svg
- `CLAUDE.md`
