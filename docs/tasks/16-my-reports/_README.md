# SCREEN 16 · My Reports

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Meus Reportes'`)
> **Position in navigation:** From the Mais menu in the bottom nav, or directly via deep link / push tap

## Overview

The user's history: every report they've ever submitted, with status
chips (Triagem, Em Andamento, Resolvido), pending offline items
highlighted at the top, and a status KPI strip summarizing the whole
history (Total / Resolvidos / Em andamento / Triagem). Filter chips
let the user slice by status; tapping any row opens the appropriate
detail screen (13, 14, or 17 depending on state).

A "bridge card" at the bottom encourages contextual discovery of
Programs & Transparency while reports are being processed — turning
"wait time" into engagement.

## Features (6 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, layout, bottom nav](./01-render-my-reports-ui-base.md) | S | `00-foundation/02-design-tokens.md`, `00-foundation/03-bottom-nav-component.md` |
| 02 | [Status summary · KPI strip + filter chips](./02-status-summary.md) | S | task 01 |
| 03 | [Pending offline card · highlighted entry to Sync Queue](./03-pending-offline-card.md) | S | task 01, `00-foundation/09-offline-queue.md` |
| 04 | [Reports list · row + pagination + status routing](./04-reports-list.md) | M | task 01, `00-foundation/05-api-client.md` |
| 05 | [Empty state · first-time and filter-empty](./05-empty-state.md) | S | task 01, task 04 |
| 06 | [Bridge card · Programs & Transparency discovery](./06-bridge-card.md) | S | task 01 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (KPI + filters) ─┐
          ├─→ 03 (pending card) ──┤
          ├─→ 04 (list) ──────────┼─→ 05 (empty state)
          └─→ 06 (bridge) ────────┘
```

## Product notes

- **Status colors are consistent with the rest of the app**: amber for in-progress, emerald for resolved, slate for triage.
- **Pending offline card** is the user's reassurance that nothing was lost.
- **Bridge card** is a soft growth surface — encourages users who're waiting on resolutions to explore Programs without nagging.
- **Row tap routes by status**: open → SCREEN 13, resolved → SCREEN 14, merged → SCREEN 17.
- **XP indicators on resolved rows** (and "Foto depois disponível ✓") give a small celebration as the user scrolls past their wins. The actual XP value is owned by the gamification rules (`docs/engineering/open-questions.md` Q1) — the row only displays whatever value the backend returns.
