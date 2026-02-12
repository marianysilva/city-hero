# Neighborhood Ranking · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 30 · Neighborhood Ranking
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

Header (back + "Ranking" title), scope toggle (task 02), period filter (task 05), top podium + leaderboard list (tasks 03/04), bottom nav. The screen is clean and celebratory — top contributors get visual emphasis.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** it renders
**Then** status bar `dark`
**And** header: back + title
**And** below: scope toggle, period filter, leaderboard slot
**And** bottom nav visible

### Scenario · Slot system

**Given** the screen exposes slots
**When** tasks plug in
**Then** named slots: `scope-toggle`, `period-filter`, `leaderboard`

### Scenario · Theming

**Given** dark mode
**When** rendered
**Then** background and cards adapt

### Scenario · Accessibility

**Given** SR is on
**When** mounted
**Then** title labeled

## Frontend

```
apps/mobile/src/screens/NeighborhoodRanking/
├── NeighborhoodRankingScreen.tsx
├── NeighborhoodRankingScreen.styles.ts
├── NeighborhoodRankingScreen.test.tsx
└── components/
    └── RankingHeader.tsx
```

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Empty (no participants)**: empty state ("Ainda sem heróis ranqueados").

## Privacy / LGPD

The user can opt out of leaderboards entirely via Settings.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `ranking.viewed`               | Screen mounts                              | `user_opted_in: bool`                |

## Tests

- **Unit**: slot rendering.
- **Snapshot**: light + dark.
- **A11y**: title labeled.

## Definition of Done

- [ ] NeighborhoodRankingScreen base
- [ ] RankingHeader
- [ ] Slot system
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Prototype: `design/index.html` (search `title: 'Ranking do Bairro'`)
- `CLAUDE.md`
