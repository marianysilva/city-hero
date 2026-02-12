# SCREEN 29 · Achievements & Badges

> **Group:** 03 · Gamification
> **Prototype screen:** `design/index.html` (search for `title: 'Conquistas & Medalhas'`)
> **Position in navigation:** From Citizen Profile (medals carousel "Ver todas") or directly from achievement notifications

## Overview

The user's full collection of medals. Header showing the user's
completion stats (N de M conquistadas), category filter chips
(Reportes, Comunidade, Cidade, Especiais), grid of medal cards
(unlocked = full color; locked = silhouette with progress hint),
detail sheet on tap showing how to unlock or the unlock context.

## Features (5 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, filter chips, grid](./01-render-achievements-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Completion stats + filter chips](./02-stats-and-filter.md) | S | task 01 |
| 03 | [Medal grid · unlocked + locked variants](./03-medal-grid.md) | M | task 01, `00-foundation/05-api-client.md` |
| 04 | [Medal detail sheet · how to unlock + context](./04-detail-sheet.md) | M | task 03 |
| 05 | [Share unlocked medal](./05-share-medal.md) | S | task 04 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (stats + filter) ─┐
          └─→ 03 (grid) ───────────┼─→ 04 (sheet) ──→ 05 (share)
```

## Product notes

- **Locked medals visible** (as silhouettes): users see what's achievable; sparks curiosity.
- **Hidden / secret medals**: shown only after unlock to preserve discovery joy.
- **Categories help organization**: Reportes (related to reporting), Comunidade (apoios, comentários), Cidade (engagement with city features), Especiais (one-time / event-based).
- **Share unlocked medals**: each unlocked medal can be shared as a small image card to social.
