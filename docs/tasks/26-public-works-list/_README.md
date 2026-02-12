# SCREEN 26 · Public Works List

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Obras em Andamento'`)
> **Position in navigation:** From SCREEN 25 Services or from the badge on Home

## Overview

A scannable list of all public works currently active in the city,
plus a small map preview at the top showing all work locations. Each
row card shows: status pill (Em planejamento, Em execução, Concluída
parcialmente, Suspensa), title, address, contractor (when public),
budget, start/end dates, and a small progress bar. Filter chips at
the top slice by status and by category (Pavimentação, Saúde,
Educação, etc.).

The screen makes works **visible** — a prefecture that can't hide
construction is more accountable.

## Features (5 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, map preview, layout, slots](./01-render-works-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Mini map preview · pins for all active works](./02-mini-map-preview.md) | M | task 01, `00-foundation/10-leaflet-map-wrapper.md` |
| 03 | [Filter chips · status + category](./03-filter-chips.md) | S | task 01 |
| 04 | [Works list + row card](./04-works-list-and-card.md) | M | task 01, `00-foundation/05-api-client.md` |
| 05 | [Empty state + map/list toggle](./05-empty-and-view-toggle.md) | S | task 04 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (map preview) ──┐
          ├─→ 03 (chips) ────────┼─→ 04 (list) ──→ 05 (empty + toggle)
          └──────────────────────┘
```

## Product notes

- **Data sources**: the city's Open Data feed for active works. Each work has lat/lng so it appears on the map.
- **Map vs list toggle**: some users prefer the map view (where works are); others prefer the list (with details). Both modes share data.
- **Real-time status updates**: works update via WebSocket; users see "started yesterday" or "finished" without refreshing.
- **Budget transparency**: shown when public; for works under bidding, the bid value (not the contracted value) is shown.
- **Tap routes to detail**: SCREEN 27 (Public Work Detail) shows everything.
