# SCREEN 06 · Home · Hyperlocal Map

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Home · Mapa Hiperlocal'`)
> **Position in navigation:** Root tab — first tab after onboarding completes

## Overview

The most-used screen in the app. The user's primary entry point after
onboarding, returning here from any other tab. It surfaces:

- The **hyperlocal map** (real OpenStreetMap tiles via the Leaflet wrapper)
  with category-colored pins for nearby reports.
- A **floating profile card** at the top with the user's level + XP — a
  constant reminder that everything is gamified.
- **Filter chips** to slice the map by category.
- A central **camera FAB** (the anchor action) plus a small "Avisos da
  Prefeitura" badge and an "Obra ativa" badge.
- A **floating ticket card** showing a high-priority nearby report.
- A one-time **discovery card** that introduces Programs & Transparency
  after the user's 3rd report.
- Real-time pin updates, pull-to-refresh, and offline awareness.

This screen pulls on a lot of foundations: the map wrapper, API client,
auth state, location services, push notifications, and the offline queue.

## Features (10 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · top bar, layout, FAB position](./01-render-home-ui-base.md) | M | `00-foundation/02-design-tokens.md`, `00-foundation/03-bottom-nav-component.md` |
| 02 | [Map integration with pins (uses Leaflet wrapper)](./02-map-integration-with-pins.md) | M | `00-foundation/10-leaflet-map-wrapper.md`, `00-foundation/05-api-client.md` |
| 03 | [Filter chips (categories) and applied state](./03-filter-chips.md) | S | task 01, task 02 |
| 04 | [User location pulse + recenter button](./04-user-location-and-recenter.md) | S | task 02, location permission |
| 05 | [Mini badges · Avisos + Obras (entry points)](./05-mini-badges-avisos-obras.md) | S | task 01 |
| 06 | [Floating ticket card · nearby high-priority report](./06-floating-ticket-card.md) | S | task 01, task 02 |
| 07 | [One-time discovery card · Programs & Transparency](./07-discovery-card-programs.md) | S | task 01 |
| 08 | [Real-time pin updates (WebSocket / polling fallback)](./08-realtime-pin-updates.md) | M | task 02 |
| 09 | [Pull-to-refresh + manual refresh](./09-pull-to-refresh.md) | S | task 02 |
| 10 | [Offline banner + cached pins behavior](./10-offline-banner-and-cache.md) | M | task 02, `00-foundation/09-offline-queue.md` |

## Suggested implementation order

```
01 (UI base) ─┐
              ├─→ 02 (map integration) ─┬─→ 03 (filters)
              │                         ├─→ 04 (user location)
              │                         ├─→ 06 (floating ticket card)
              │                         ├─→ 08 (real-time updates)
              │                         ├─→ 09 (pull-to-refresh)
              │                         └─→ 10 (offline banner)
              ├─→ 05 (mini badges)
              └─→ 07 (discovery card)
```

01 and 02 are foundational; everything else plugs in. 03–10 can be built
in parallel after 02 is in place.

## Product notes

- **Default zoom and center**: the map opens at zoom 16 centered on the user (if location granted) or the active city's centroid.
- **Filter chips** are sticky at the top under the profile card. Active state highlights.
- **The floating ticket card** is not a list — it's the single most-relevant nearby report (highest priority + close to the user). Tapping opens its detail.
- **Discovery card** appears once after the 3rd successful report. Dismissible. Tracked per-user.
- **Mini badges** are non-intrusive entry points — they don't compete with the map.
- The screen is **the busiest** in the app; performance matters. Pin clustering at low zoom; debounced bbox queries.
