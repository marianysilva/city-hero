# Achievements · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 29 · Achievements & Badges
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

Header (back + title + share button) → completion stats + filter chips → medal grid → bottom nav.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** it renders
**Then** status bar `dark`; header with back, title "Conquistas & Medalhas", share button
**And** slots for: completion-stats, filter-chips, medal-grid
**And** bottom nav visible

### Scenario · Slot system

**Given** the screen exposes slots
**When** tasks plug in
**Then** named slots: `completion-stats`, `filter-chips`, `medal-grid`

### Scenario · Back navigation

**Given** the user taps back
**When** the action runs
**Then** returns to Profile or previous screen

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
apps/mobile/src/screens/AchievementsBadges/
├── AchievementsBadgesScreen.tsx
├── AchievementsBadgesScreen.styles.ts
├── AchievementsBadgesScreen.test.tsx
└── components/
    └── AchievementsHeader.tsx
```

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Empty catalog (no medals defined)**: empty state — unlikely in production.

## Privacy / LGPD

Personal collection.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `achievements.viewed`          | Screen mounts                              | `unlocked_count`, `total_count`      |

## Tests

- **Unit**: slot rendering.
- **Snapshot**: light + dark.
- **A11y**: title labeled.

## Definition of Done

- [ ] AchievementsBadgesScreen base
- [ ] AchievementsHeader
- [ ] Slot system
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Prototype: `design/index.html` (search `title: 'Conquistas & Medalhas'`)
- `CLAUDE.md`
