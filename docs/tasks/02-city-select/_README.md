# SCREEN 02 · Choose City

> **Group:** 01 · Entry & Onboarding\
> **Prototype screen:** `design/index.html` (search for `title: 'Escolher Cidade'`)\
> **Position in navigation:** After Splash, before the Onboarding triplet (see
> `design/navigation.html` § 02)

## Overview

The first explicit user choice in the app: which city the user belongs to. This is **load-bearing**
for the multi-tenant architecture — every report, every feed item, every API call after this is
scoped by the chosen city. The screen does it gently: the GPS pre-detects the city and offers a
one-tap confirmation, so for most users this is a 2-second step.

The screen also acts as a **growth surface**: showing "coming soon" cities demonstrates expansion
ambition and lets non-pilot users join a waitlist — turning a friction step into a lead-capture
moment.

## Features (6 tasks)

| #   | Task                                                                                | Effort | Depends on                                 |
| --- | ----------------------------------------------------------------------------------- | ------ | ------------------------------------------ |
| 01  | [Render UI · header, GPS card, search, list, footer](./01-render-city-select-ui.md) | S      | `00-foundation/02-design-tokens.md`        |
| 02  | [Cities catalog API + render list](./02-cities-catalog-api.md)                      | S      | `00-foundation/05-api-client.md`           |
| 03  | [Search/filter cities](./03-search-filter.md)                                       | S      | task 02                                    |
| 04  | [GPS auto-detect closest active city](./04-gps-auto-detect.md)                      | M      | task 02, location permission               |
| 05  | [Select and activate tenant](./05-select-and-activate-tenant.md)                    | M      | task 02, `00-foundation/06-auth-system.md` |
| 06  | [Waitlist for "coming soon" cities](./06-waitlist-coming-soon.md)                   | S      | task 02                                    |

## Suggested implementation order

```
01 (UI) ──┐
          ├─→ 02 (catalog API) ─→ 03 (search)
          │                    └─→ 04 (GPS detect) ─→ 05 (select & activate)
          │                                       └─→ 06 (waitlist)
```

01 and 02 can be parallel. 03 and 04 sit on top of 02. 05 unifies the selection flow whether the
user came via GPS, search, or list. 06 attaches to the same flow but for non-active cities.

## Product notes

- **Multi-tenant is non-negotiable**: after this screen, every backend call must include the
  `city_id` (header + JWT claim). See `docs/engineering/architecture-patterns.md` § Multi-tenant
  scoping.
- **Pilot city** is Pôrto Belo, SC. Other SC cities show as "Em breve" / "Coming soon".
- **Switching cities later** is allowed via the City Profile screen — this isn't a one-shot lock-in.
- The GPS detection is opt-in (the user can decline location permission and pick manually).
- **Sales tool**: the "coming soon" list demonstrates regional expansion to the pilot prefecture
  (we'd love to claim Bombinhas, Itapema, BC are negotiating).
