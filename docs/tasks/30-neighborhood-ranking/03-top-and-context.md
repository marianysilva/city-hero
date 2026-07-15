# Neighborhood Ranking · Top 10 + user's contextual rank

> **Type:** Screen feature · UI + data\
> **Screen:** SCREEN 30 · Neighborhood Ranking\
> **Effort:** M (1-2 days)\
> **Dependencies:** `30-neighborhood-ranking/01-render-ranking-ui-base.md`,
> `00-foundation/05-api-client.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `screen`

## Context

The main leaderboard structure: a podium card highlighting top 3 with bigger visuals + badges, then
a list of positions 4-10. Below: a divider + "Seu pelotão" section showing the user's rank with 2-3
positions above and below (so the user knows what's just ahead).

If the user is not on the top 10, their rank is shown separately in "Seu pelotão". If they're in the
top 10, the contextual rank section is hidden.

## Acceptance Criteria

### Scenario · Default render with podium

**Given** at least 3 participants exist\
**When** the screen renders\
**Then** top 3 appear on a podium card (1st with crown, 2nd silver, 3rd bronze) with avatar + name +
XP\
**And** positions 4-10 follow in a list

### Scenario · "Seu pelotão" section

**Given** the user is not in the top 10\
**When** the section renders\
**Then** a divider "SEU PELOTÃO" appears\
**And** 2-3 positions above the user, the user (highlighted), 2-3 positions below

### Scenario · User in top 10

**Given** the user is in the top 10\
**When** the screen renders\
**Then** the "Seu pelotão" section is hidden\
**And** the user's row is highlighted within the top 10

### Scenario · Tap a row

**Given** the user taps another user's row\
**When** the action runs\
**Then** the other user's mini-profile sheet opens (a small public-safe view: avatar, name, level,
medals count) — out of MVP if needed; for MVP, no-op with informational hover

### Scenario · Anonymous participants

**Given** some participants are anonymous\
**When** rendered\
**Then** they show 🥷 "Herói Anônimo" instead of a real name

### Scenario · Empty (no participants)

**Given** no participants\
**When** rendered\
**Then** an empty state with a CTA to be the first

### Scenario · Real-time updates

**Given** XP changes for any participant\
**When** the rank shifts\
**Then** the leaderboard updates smoothly

### Scenario · Period filter applied

**Given** the user picked a period (task 05)\
**When** rendered\
**Then** XP totals reflect that period (mensal/anual/total)

### Scenario · Accessibility

**Given** SR is on\
**When** navigated\
**Then** podium and rows announced as a list with position + name + XP

## Frontend

```
apps/city-hero/src/screens/NeighborhoodRanking/
├── components/
│   ├── Podium.tsx
│   ├── LeaderboardSection.tsx
│   └── UserPelotaoSection.tsx
└── hooks/
    └── useLeaderboard.ts
```

## Backend

| Method | Path                                 | Purpose               |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/api/v1/leaderboard?scope=&period=` | Top 10 + user context |

The endpoint returns: top 10 entries + the user's rank + 2-3 above and 2-3 below the user. Anonymous
flag included. Opted-out users excluded.

## Database

Computed from `users.xp` aggregated over the period. For monthly periods, a `monthly_xp_snapshots`
table avoids recomputing.

## Edge Cases

- **Many ties at same XP**: secondary sort by activity recency.
- **Period reset (monthly)**: a small banner indicates "Próximo reset: dd/mm".

## Privacy / LGPD

Opted-out users don't appear; anonymous users appear with 🥷.

## Analytics

| Event                        | When              | Props                          |
| ---------------------------- | ----------------- | ------------------------------ |
| `ranking.leaderboard_loaded` | Mounted           | `scope`, `period`, `user_rank` |
| `ranking.row_pressed`        | User tapped a row | `target_user_id`               |

## Tests

- **Unit**: podium rendering; pelotão section visibility; ties.
- **Integration**: real-time updates.
- **A11y**: list semantics.

## Definition of Done

- [ ] Podium + LeaderboardSection + UserPelotaoSection
- [ ] useLeaderboard hook
- [ ] Backend endpoint
- [ ] Anonymous handling
- [ ] Real-time integration
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Cross-cutting: `docs/engineering/`
- `CLAUDE.md`
