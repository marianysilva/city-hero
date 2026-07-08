# SCREEN 20 · City Profile

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Perfil da Cidade'`)
> **Position in navigation:** From the More menu

## Overview

The civic transparency dashboard — **the city in numbers**. A gradient
hero with the city's name and "Cidade CityHero · desde mar/2025" badge,
a description block, quick demographic facts (population, heroes,
neighborhoods, km²), a hero "Sua cidade está 23% melhor" insights card
with a 6-month bar chart, a mini-dashboard of report statuses
(Abertos, Em triagem, Em andamento, Resolvidos), and below — more
specific KPIs and a connection to the Programs hub.

Per `features.md` "Transparency Portal (Public View)", this screen
acts as the citizen-facing window into the city's performance. It
turns abstract claims ("we're improving") into concrete, visualizable
data.

## Features (6 tasks)

| #   | Task                                                                                                    | Effort | Depends on                          |
| --- | ------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------- |
| 01  | [Render UI base · scrollable layout, hero slot, sticky bottom nav](./01-render-city-profile-ui-base.md) | S      | `00-foundation/02-design-tokens.md` |
| 02  | [Hero · gradient + city identity](./02-hero-identity.md)                                                | S      | task 01                             |
| 03  | [About + quick facts grid](./03-about-and-quick-facts.md)                                               | S      | task 01                             |
| 04  | [Improvement insights card · message + bar chart](./04-insights-card.md)                                | M      | task 01                             |
| 05  | [Report status mini-dashboard](./05-report-status-dashboard.md)                                         | M      | task 01                             |
| 06  | [Share + extras (programs link, last update timestamp)](./06-share-and-extras.md)                       | S      | task 01                             |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (hero) ───────────┐
          ├─→ 03 (about + facts) ──┤
          ├─→ 04 (insights) ───────┼─→ 06 (extras)
          └─→ 05 (dashboard) ──────┘
```

## Product notes

- **Numbers must be real**: per the data-anchor principle (see Liga's
  pivot copy in `12-heroes-league/03`), all stats here should reflect
  actual prefecture data when possible. Placeholders are fine before
  launch with a clear "dados de exemplo" badge.
- **Share is intentional**: this screen makes great campaign material —
  citizens can screenshot or share the link to show neighbors
  "look what we're doing together".
- **City-switching link**: a small footer affordance lets the user
  switch cities (when CityHero rolls out to more cities). Out of MVP
  scope but the data model supports it.
- **Bar chart is decorative + informative**: shows direction over 6
  months. The user doesn't need to interact with it; just glance and
  understand the trend.
- **Connects to SCREEN 22 (Programs)**: the bridge between "numbers
  overview" and "specific programs being executed".
