# SCREEN 23 · Bolsa Família Detail

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Detalhe · Bolsa Família'`)
> **Position in navigation:** From the featured card or programs grid on SCREEN 22

## Overview

The detail view of the Bolsa Família federal program for the active
city. Pulls data from the Portal da Transparência (federal) and the
prefecture's CadÚnico-aligned records. Includes:

- A hero card with the program description and key metrics (famílias,
  valor mensal, valor anual, % população).
- A trend chart (semester-by-semester) showing beneficiaries + total
  value over time.
- A breakdown by neighborhood (which `bairros` have the most
  beneficiaries — useful for identifying concentrations).
- A transparency notes section explaining what's public (per STF MS
  36.020/2020) and what's protected by LGPD.
- A primary "Denunciar irregularidade" CTA at the bottom that routes
  to SCREEN 24.

## Features (5 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · hero + scroll + sticky CTA](./01-render-bolsa-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Hero metrics card · KPIs + freshness](./02-hero-metrics.md) | S | task 01, `00-foundation/05-api-client.md` |
| 03 | [Trend chart · semester history](./03-trend-chart.md) | M | task 01 |
| 04 | [Neighborhood breakdown table](./04-neighborhood-breakdown.md) | M | task 01 |
| 05 | [Transparency notes + Denunciar CTA](./05-transparency-and-denunciar.md) | S | task 01 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (hero) ──┐
          ├─→ 03 (chart) ─┼─→ 05 (notes + CTA)
          └─→ 04 (table) ─┘
```

## Product notes

- **Per STF MS 36.020/2020**: the Bolsa Família beneficiary registry
  is **nominally public**, but the app aggregates per-neighborhood to
  avoid individual exposure unless the user drills into the official
  Portal da Transparência.
- **Per LGPD**: individual records aren't shown in the app. The
  prefecture's Open Data feed pre-aggregates them.
- **Data sources cited**: each metric shows its source ("Fonte: Portal
  da Transparência · jan/2026") so users can verify.
- **Comparison to similar cities** (optional polish): if the data
  exists, the screen can show how Pôrto Belo compares to similar
  coastal cities in SC.
