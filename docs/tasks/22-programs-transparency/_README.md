# SCREEN 22 · Programs & Transparency

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Programas & Transparência'`)
> **Position in navigation:** From the More menu, the home discovery card (after 3rd report), or the My Reports bridge card

## Overview

The hub that unifies all the social programs and budget transfers
flowing through the prefecture — federal, state, and municipal. The
screen turns the app into a **canal de controle social**. Cards pull
data from the **Portal da Transparência** (federal) + the prefecture's
own Open Data feed (per convênio). **Bolsa Família** is the featured
pilot because its registry is nominally public (STF MS 36.020/2020).
Smaller cards (BPC, Merenda, Habitação) link to detail screens with
less granularity where LGPD protects individual records.

Each program detail has a "Denunciar irregularidade" CTA that routes
to the official channels (CGU, Ministério Público, Ouvidoria) —
CityHero does **not** store the report, only orchestrates the routing.

## Features (6 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header + share + scrollable layout](./01-render-programs-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Summary strip · 11 programas + R$ investido + beneficiários](./02-summary-strip.md) | S | task 01 |
| 03 | [Filter chips · Social, Saúde, Educação, Habitação, Estrutural](./03-category-chips.md) | S | task 01 |
| 04 | [Featured Bolsa Família card · highlight + key metrics](./04-featured-card.md) | M | task 01 |
| 05 | [Programs grid · 2-column cards with metric + level badge](./05-programs-grid.md) | M | task 01, `00-foundation/05-api-client.md` |
| 06 | [Educational footer + Denunciar irregularity entry](./06-footer-and-denunciar.md) | S | task 01 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (summary) ──┐
          ├─→ 03 (chips) ────┤
          ├─→ 04 (featured) ─┼─→ 06 (footer)
          └─→ 05 (grid) ─────┘
```

## Product notes

- **Open data sources are configurable per program**: federal (Portal
  da Transparência), state (varies), municipal (per-prefecture
  agreement). The card displays the data source for credibility.
- **Featured program is configurable**: the prefecture chooses the
  pilot. For Pôrto Belo MVP, Bolsa Família is featured.
- **"Denunciar irregularidade"** is a thin orchestrator: it generates a
  pre-formatted complaint with the right authority's contact info, then
  hands off (mailto, web form deep link, or in-app helper). CityHero
  doesn't store the complaint.
- **3 governmental levels are tagged**: federal, estadual, municipal —
  helps users understand who's responsible.
- **Numbers freshness matters**: the summary strip and program cards
  show "Atualizado em {date}" — citizens distrust stale data.
