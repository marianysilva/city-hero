# City Profile · Improvement insights card

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 20 · City Profile
> **Effort:** M (1-2 days)
> **Dependencies:** `20-city-profile/01-render-city-profile-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `data-viz`

## Context

A celebratory card with an emerald gradient: a 📈 icon, "JUNTOS, ESTE
ANO" kicker, a hero metric ("Sua cidade está 23% melhor"), and a
short explanation ("Problemas abertos caíram 23% vs. mês passado.
Tempo médio de resolução: 4,2 dias (antes: 7,8)."). Below: a small
**6-month bar chart** showing the open-problems trend with a color
gradient (lighter for older months, darker for recent).

The card is the **emotional anchor** of the dashboard — citizens come
here to feel that things are getting better, and the numbers must
prove it.

## User Story

**As a** Citizen,
**I want** a clear, hopeful summary of the city's progress,
**In order to** feel engaged and proud.

## Acceptance Criteria

### Scenario · Default render

**Given** the data is loaded
**When** the card renders
**Then** an emerald gradient card is shown
**And** a 📈 icon on the left
**And** "JUNTOS, ESTE ANO" uppercase kicker
**And** the hero metric "Sua cidade está {N}% melhor" with the percentage in emerald-600
**And** a short paragraph explaining the metric concretely
**And** a 6-month bar chart at the bottom with month labels

### Scenario · Bar chart render

**Given** the 6-month data array is loaded
**When** the chart renders
**Then** 6 bars appear with varying heights matching the data
**And** the bars use a color gradient (lighter emerald for older, darker for recent)
**And** month labels appear below each bar ("Nov", "Dez", "Jan", "Fev", "Mar", "Abr")

### Scenario · Improvement is positive

**Given** the comparison shows improvement (current < previous)
**When** the card renders
**Then** the percentage is shown as "X% melhor" in emerald
**And** the tone is celebratory

### Scenario · Improvement is negative

**Given** the comparison shows regression (current > previous)
**When** the card renders
**Then** the metric is shown honestly ("Aumentou X%") in amber or rose
**And** the tone is informative, not blaming
**And** the chart still shows the trend

### Scenario · No comparison data

**Given** the city is new to CityHero and doesn't have 6 months of history
**When** the card renders
**Then** softer copy is used ("Acompanhando o progresso desde {month}")
**And** the chart shows the available months (could be 1-5 bars)

### Scenario · Real-time chart updates

**Given** new data arrives (a month closes, the chart shifts)
**When** the update fires
**Then** the chart re-renders with the new data
**And** the message recomputes

### Scenario · Tap chart

**Given** the user taps any bar
**When** the action runs
**Then** a small tooltip shows the exact value for that month
**And** dismissing the tooltip is automatic on the next tap

### Scenario · Localization

**Given** the user's language is en-US
**When** the card renders
**Then** copy is in English ("Together, this year", "Your city is X% better", "Open problems dropped X% vs. last month. Avg resolution time: X days (before: Y).")
**And** month labels are in English ("Nov", "Dec", "Jan", etc.)

### Scenario · Accessibility

**Given** screen reader is on
**When** the card is read
**Then** the kicker, metric, paragraph are read in order
**And** the chart has an accessibility description ("Open-problems trend: November 85, December 78, January 72, February 68, March 55, April 47 — improving over time")

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CityProfile/
└── components/
    ├── ImprovementInsightsCard.tsx
    └── MonthlyTrendChart.tsx
```

### Component behavior

- `ImprovementInsightsCard` accepts the trend data and metric values.
- `MonthlyTrendChart` is a simple bar chart (SVG-based or `victory-native`).
- The component reads from the city profile data hook (task 01) or a dedicated insights endpoint.

### Chart library

For MVP, a small custom SVG implementation is sufficient (6 bars). For richer interactions later, `victory-native` or `react-native-svg-charts` are options.

## Backend (FastAPI)

### Endpoint

The data may come from a dedicated insights endpoint:

| Method | Path                                                  | Purpose                                  |
|--------|-------------------------------------------------------|------------------------------------------|
| GET    | `/api/v1/cities/{id}/insights/improvement`            | Returns trend data + comparison metrics |

The response includes the 6-month series, the comparison metric (% change), and the avg-resolution-time data.

The values come from dbt-materialized analytical tables (per `features.md` § 4) — not computed at query time on the operational DB.

## Database

Analytical fact tables (via dbt + Airflow per `features.md` § 6 stack)  materialize per-month aggregations:

- `fact_monthly_open_problems_by_city` (city_id, month, count)
- `fact_monthly_resolution_time_by_city` (city_id, month, avg_days)

The endpoint reads from these.

## Edge Cases

- **Data missing for a month** (e.g., backfill gap): the bar shows as a placeholder; the metric notes the gap.
- **Very recent month with incomplete data** (e.g., mid-current-month): the bar uses a softer color and is labeled "parcial".
- **Cold-start cities with no trends yet**: softer copy and a single bar suffice.

## Privacy / LGPD

Aggregate data only. No individual identification.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `city_profile.insights_rendered`   | Card mounted                               | `improvement_pct`, `month_count`     |
| `city_profile.insights_chart_tapped` | User tapped a bar                       | `month`, `value`                      |

## Tests

- **Unit**: metric computation (positive/negative); chart renders with N bars; tooltip on tap.
- **Snapshot**: positive, negative, no-comparison variants.
- **A11y**: chart description verified.

## Definition of Done

- [ ] ImprovementInsightsCard component
- [ ] MonthlyTrendChart component
- [ ] Backend insights endpoint reading from dbt tables
- [ ] Tooltip on tap
- [ ] Localized copy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (analytical data tables): `docs/engineering/architecture-patterns.md`
- Observability (data freshness): `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native SVG (for the custom chart): https://github.com/software-mansion/react-native-svg
- victory-native (alternative): https://commerce.nearform.com/open-source/victory/

### Project context
- Render UI base: `01-render-city-profile-ui-base.md`
- Analytical pipeline (data source): `features.md` § 4 + § 6
- `CLAUDE.md`
