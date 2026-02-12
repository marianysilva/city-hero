# Achievements · Completion stats + filter chips

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 29 · Achievements & Badges
> **Effort:** S (≤1 day)
> **Dependencies:** `29-achievements-badges/01-render-achievements-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A small "12 de 28 conquistadas" stat with a horizontal progress bar at the top, followed by filter chips: **Todas**, **Conquistadas**, **Em Progresso**, **Bloqueadas**, plus category chips (Reportes, Comunidade, Cidade, Especiais).

## Acceptance Criteria

### Scenario · Default render

**Given** the user has 12 of 28 medals
**When** the stats render
**Then** "12 DE 28 CONQUISTADAS" label + progress bar
**And** below: chips for completion state + categories

### Scenario · Tap a chip

**Given** the user taps a chip
**When** the action runs
**Then** the chip becomes active
**And** the medal grid (task 03) filters

### Scenario · Combined filters

**Given** completion + category filters
**When** both apply (AND semantics)
**Then** only matching medals show

### Scenario · Real-time progress updates

**Given** the user just unlocked a medal
**When** the change arrives
**Then** the stat increments + progress bar fills

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** labels translate

### Scenario · Accessibility

**Given** SR is on
**When** navigated
**Then** stat + progress announced; chips labeled with state

## Frontend

```
apps/mobile/src/screens/AchievementsBadges/
├── components/
│   └── CompletionStats.tsx
└── hooks/
    └── useAchievementsFilters.ts
```

The chip row(s) render the shared `FilterChipRow` from `@cityhero/design-system`. The screen owns the chip definitions and the `onChipPress` callback that filters the data; no styling lives in this screen's components. See `docs/engineering/component-inventory.md` (row `FilterChipRow`) and `docs/engineering/design-system.md`.

### Chip lists this screen passes to `FilterChipRow`

Completion-state row:

- `Todas` — initial `active: true`.
- `Conquistadas`, `Em Progresso`, `Bloqueadas` — mutually exclusive with `Todas`.

Category row:

- `Reportes`, `Comunidade`, `Cidade`, `Especiais` — multi-select; combined with the completion-state row via AND semantics in `useAchievementsFilters`.

The screen's `onChipPress(id)` callback delegates to the store, which updates the active filter set and triggers the medal grid (task 03) to re-filter.

## Backend

Stats from `/api/v1/users/me/medals/summary` (counts of unlocked + total).

## Database

`medals_unlocked` for unlocked; `medals_catalog` for total available.

## Edge Cases

- **Unlocking changes counts mid-render**: counts update smoothly.

## Privacy / LGPD

Personal.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `achievements.filter_changed`      | Chip tapped                                | `kind`, `value`                       |

## Tests

- **Unit**: stats; chip state; combined filters.
- **A11y**: chips labeled.

## Definition of Done

- [ ] CompletionStats component
- [ ] Chip list definition + filter callback (no local chip component)
- [ ] `FilterChipRow` integration verified visually in Storybook
- [ ] useAchievementsFilters hook
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-achievements-ui-base.md`
- Shared chip molecule: `docs/engineering/component-inventory.md` (row `FilterChipRow`)
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`
