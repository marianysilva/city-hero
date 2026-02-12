# SCREEN 05 · Onboarding · Your Neighborhood

> **Group:** 01 · Entry & Onboarding
> **Prototype screen:** `design/index.html` (search for `title: 'Onboarding · Seu bairro'`)
> **Position in navigation:** Step 5 of 5 onboarding steps · last entry screen before Home

## Overview

The fourth and final onboarding step. Asks for **location permission** so
the app can center the Home map on the user's neighborhood, configure the
hyperlocal feed radius (default 10km), and validate GPS for future report
captures (anti-fraud).

Unlike step 2 (AI camera) and step 3 (gamification), this step requests
an actual OS permission. It also marks **onboarding as complete** when
finished.

## Features (3 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI · stylized neighborhood map illustration, copy, pagination, buttons](./01-render-onboarding-neighborhood-ui.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Location permission request and feed radius default](./02-location-permission.md) | M | task 01, `02-city-select/04-gps-auto-detect.md` |
| 03 | [Reduced-motion variant of the illustration](./03-reduced-motion-illustration.md) | S | task 01, shared `useReducedMotion` hook |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (location permission)  ─→ marks onboarding complete
          └─→ 03 (a11y / reduced motion)
```

## Product notes

- **Permission UX**: a contextual pre-prompt explains the benefit before the OS dialog. A **"Permitir depois"** link (not "Pular") lets the user continue without granting the OS permission — the Home map falls back to the city centroid; the user can grant later. This is **not** a skip of the onboarding step itself: the user did see the screen and complete the flow.
- **Default radius**: 10km, configurable later in Profile / City Profile. Communicated as "vizinhos num raio de 10 km" — friendly, not technical.
- **Onboarding complete**: completing this step (with or without location grant) marks the onboarding flow as done; the user lands on Home next.
- **The illustrated map** is a stylized SVG (per memory: onboarding uses illustrated maps; only real screens use OSM via Leaflet).
