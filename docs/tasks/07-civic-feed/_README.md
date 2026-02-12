# SCREEN 07 · Civic Feed

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Feed Cívico'`)
> **Position in navigation:** Root tab — second tab in the bottom nav

## Overview

The hyperlocal social timeline of the app. Citizens see what their
neighbors reported within a configurable radius (default 10km, narrower
options too), formatted as a familiar social-media feed: avatar + name +
distance + photo + description + action buttons (Apoiar, Comentar,
Compartilhar, Enriquecer).

The feed is the **engagement engine** — it converts passive map-watchers
into active supporters and fuels the "X people support this" social proof
that pressures the prefecture to act faster.

Anonymous reports show as **"Herói Anônimo"** with a 🥷 avatar — the
post is fully visible but the reporter's identity is masked from
neighbors (only the prefecture sees the real identity, per LGPD/LAI).

## Features (9 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, filter chips, layout](./01-render-feed-ui-base.md) | S | `00-foundation/02-design-tokens.md`, `00-foundation/03-bottom-nav-component.md` |
| 02 | [Feed list · API + pagination + infinite scroll](./02-feed-list-and-pagination.md) | M | `00-foundation/05-api-client.md`, task 01 |
| 03 | [Feed item card · shared component (incl. anonymous variant)](./03-feed-item-card.md) | M | task 01, `00-foundation/08-anonymization-pipeline.md` |
| 04 | [Filter chips · radius + sort](./04-filter-chips.md) | S | task 01, task 02 |
| 05 | [Search · over feed items](./05-search.md) | S | task 02 |
| 06 | [Apoiar action · optimistic + anti-fraud + XP](./06-apoiar-action.md) | M | task 03, `00-foundation/09-offline-queue.md` |
| 07 | [Compartilhar action · share sheet + tracking link](./07-compartilhar-action.md) | S | task 03, `00-foundation/12-deep-link-handler.md` |
| 08 | [Enriquecer action · add a photo to someone else's report](./08-enriquecer-action.md) | M | task 03, `00-foundation/07-photo-upload-pipeline.md` |
| 09 | [Pull-to-refresh + real-time updates](./09-realtime-and-refresh.md) | M | task 02 |

## Suggested implementation order

```
01 (UI) ──┐
          ├─→ 02 (list + pagination) ──┬─→ 04 (filters)
          │                             ├─→ 05 (search)
          │                             └─→ 09 (refresh + realtime)
          └─→ 03 (item card) ───────────┬─→ 06 (apoiar)
                                        ├─→ 07 (compartilhar)
                                        └─→ 08 (enriquecer)
```

## Product notes

- **Hyperlocal radius**: default 10km but configurable to 5km, 2km, or 1km via the filter chips. The narrower the radius, the more relevant but possibly empty.
- **"Enriquecer"** (Crowdsourcing) is a key differentiator: a citizen passing by an existing report can add a fresh photo (with strict GPS validation) and earn double XP. Listed in `features.md` § 1 as a deliberate engagement loop.
- **Moderated comments** use the tag system from `Detalhe · Em andamento` (SCREEN 13) — opening comments from the feed deep-links into that detail screen.
- **Anonymous posts**: the post itself is fully visible (photo, description, location), only the reporter's identity is masked. The prefecture still sees the real reporter (per LAI / Lei 12.527).
- **Sort options**: "Novos" (default) chronological, "Mais apoiados" by support count.
- **Performance**: the feed can be hundreds of items in dense neighborhoods. Virtualized list + lazy image loading is essential.
