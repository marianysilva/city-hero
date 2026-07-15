# SCREEN 30 · Neighborhood Ranking

> **Group:** 03 · Gamification\
> **Prototype screen:** `design/index.html` (search for `title: 'Ranking do Bairro'`)\
> **Position in navigation:** From Citizen Profile or Achievements

## Overview

A friendly leaderboard showing the user's standing within their neighborhood (and optionally the
broader city). The user sees their rank, the top 10 nearby heroes, and the next few above/below to
keep competition healthy without being demoralizing. Toggle between "Meu bairro" and "Cidade toda".
Anonymous users appear as 🥷 with "Herói Anônimo".

The ranking is a **social motivator** — but designed to celebrate the top contributors without
shaming everyone else (no "lowest" view).

## Features (5 tasks)

| #   | Task                                                                                      | Effort | Depends on                                |
| --- | ----------------------------------------------------------------------------------------- | ------ | ----------------------------------------- |
| 01  | [Render UI base · header, scope toggle, leaderboard slot](./01-render-ranking-ui-base.md) | S      | `00-foundation/02-design-tokens.md`       |
| 02  | [Scope toggle · Meu bairro / Cidade toda](./02-scope-toggle.md)                           | S      | task 01                                   |
| 03  | [Top 10 + user's contextual rank](./03-top-and-context.md)                                | M      | task 01, `00-foundation/05-api-client.md` |
| 04  | [Leaderboard row · avatar, name (or 🥷), rank, XP](./04-leaderboard-row.md)               | S      | task 03                                   |
| 05  | [Period filter · Mensal / Anual / Total](./05-period-filter.md)                           | S      | task 01                                   |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (scope) ──┐
          ├─→ 03 (top + context) ─→ 04 (row)
          └─→ 05 (period)
```

## Product notes

- **Anonymous reporters appear as 🥷**: their points still count; their identity stays hidden in the
  leaderboard.
- **No lowest / worst view**: only top contributors are highlighted.
- **The user's contextual rank** (positions above and below them) keeps mid-tier users engaged.
- **Privacy**: a user can opt out of appearing on leaderboards entirely; their points still accrue
  privately.
- **Monthly periods reset**: keeps competition fresh; gives newcomers a chance to compete.
