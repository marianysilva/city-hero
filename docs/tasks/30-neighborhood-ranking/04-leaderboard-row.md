# Neighborhood Ranking · Leaderboard row

> **Type:** Screen feature · UI component
> **Screen:** SCREEN 30 · Neighborhood Ranking
> **Effort:** S (≤1 day)
> **Dependencies:** `30-neighborhood-ranking/03-top-and-context.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

A presentational row used in the leaderboard and pelotão sections. Each row: position number, avatar (initial or 🥷), name, level title, XP value (with the period's framing), and a delta indicator (↑ N positions / ↓ N positions / unchanged) compared to the previous period.

## Acceptance Criteria

### Scenario · Default render

**Given** a row receives data
**When** rendered
**Then** position number on the left
**And** avatar (or 🥷 for anonymous)
**And** name + level title (or "Herói Anônimo" for anonymous)
**And** XP value on the right
**And** small delta indicator below the XP if applicable

### Scenario · User's own row (highlighted)

**Given** the row is the current user
**When** rendered
**Then** the background is brand-tinted
**And** "VOCÊ" pill appears next to the name

### Scenario · Top 3 special styling

**Given** the row is rank 1, 2, or 3
**When** rendered
**Then** the position number is replaced with a medal emoji (🥇/🥈/🥉)
**And** the row uses a slight visual emphasis

### Scenario · Delta indicator

**Given** the user moved from rank 8 to rank 5
**When** rendered
**Then** "↑ 3" in emerald shows below the XP
**And** for ↓ negative changes, rose color
**And** "—" for no change

### Scenario · Anonymous variant

**Given** the row's user is anonymous
**When** rendered
**Then** name is "Herói Anônimo" with 🥷 avatar
**And** the rest is identical

### Scenario · Tap row (other user)

**Given** the user taps another row
**When** the action runs
**Then** the optional mini-profile sheet (per task 03) opens — or no-op for MVP

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** copy translates (level titles, "YOU")

### Scenario · Accessibility

**Given** SR is on
**When** rows are navigated
**Then** each is announced with position, name, level, XP, and delta

## Frontend

```
apps/city-hero/src/screens/NeighborhoodRanking/
└── components/
    └── LeaderboardRow.tsx
```

Reuses XP/level styling tokens from the design system.

## Backend

Row data comes from the leaderboard endpoint (per task 03).

## Database

`users.xp`, `users.level`, plus historical data for delta computation.

## Edge Cases

- **Brand-new participant (no previous period)**: delta shows "Novo"
- **Anonymous user who later opts in**: delta carries over (their XP is theirs).

## Privacy / LGPD

Anonymous handling is mandatory; respect the user's flag.

## Analytics

| Event                  | When               | Props                                 |
| ---------------------- | ------------------ | ------------------------------------- |
| `ranking.row_rendered` | Each row (sampled) | `is_user: bool`, `is_anonymous: bool` |

## Tests

- **Unit**: variants (top-3, user, anonymous, with delta).
- **Snapshot**: each.
- **A11y**: announcements.

## Definition of Done

- [ ] LeaderboardRow component
- [ ] Variants for top-3, user, anonymous
- [ ] Delta indicator
- [ ] Localized labels
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Top + context (composes row): `03-top-and-context.md`
- `CLAUDE.md`
