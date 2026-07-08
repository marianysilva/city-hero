# Neighborhood Ranking · Scope toggle

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 30 · Neighborhood Ranking
> **Effort:** S (≤1 day)
> **Dependencies:** `30-neighborhood-ranking/01-render-ranking-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A two-tile toggle: **Meu bairro** (default) vs **Cidade toda**. Switching changes the leaderboard's scope. The default is "Meu bairro" so the user sees their nearest competitors first (motivating).

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** the toggle renders
**Then** "Meu bairro" is active (brand background); "Cidade toda" inactive
**And** the underlying leaderboard reflects "meu bairro" scope

### Scenario · Switch to "Cidade toda"

**Given** the user taps Cidade toda
**When** the action runs
**Then** the toggle flips; the leaderboard refetches at city scope

### Scenario · Persisted in session

**Given** the user picked a scope
**When** they leave and return
**Then** the scope persists; resets on cold start

### Scenario · User with no neighborhood assigned

**Given** the user's neighborhood is unknown
**When** the toggle renders
**Then** "Meu bairro" is disabled with a hint ("Defina seu bairro em Onboarding · Seu bairro")
**And** the leaderboard defaults to "Cidade toda"

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** "My neighborhood" / "Whole city"

### Scenario · Accessibility

**Given** SR is on
**When** the user navigates the toggle
**Then** each tile is announced with state

## Frontend

```
apps/city-hero/src/screens/NeighborhoodRanking/
├── components/
│   └── ScopeToggle.tsx
└── hooks/
    └── useRankingScope.ts
```

## Backend

The leaderboard endpoint accepts a `scope` parameter (`neighborhood` or `city`).

## Database

`users.neighborhood_id` (when set). Indexes on `(neighborhood_id, xp desc)` for leaderboards.

## Edge Cases

- **Neighborhood unset**: gracefully handled.

## Privacy / LGPD

The user's neighborhood is non-PII but is used for scoping.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `ranking.scope_changed`            | User toggled                               | `to: neighborhood|city`              |

## Tests

- **Unit**: toggle state; refetch on change.
- **Snapshot**: each state.
- **A11y**: labeled.

## Definition of Done

- [ ] ScopeToggle component
- [ ] useRankingScope hook
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- `CLAUDE.md`
