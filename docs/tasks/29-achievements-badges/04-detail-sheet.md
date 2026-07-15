# Achievements · Medal detail sheet

> **Type:** Screen feature · UI + content\
> **Screen:** SCREEN 29 · Achievements & Badges\
> **Effort:** M (1-2 days)\
> **Dependencies:** `29-achievements-badges/03-medal-grid.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `gamification`

## Context

Tapping a medal opens a large bottom sheet showing: large medal art, name, description, category,
how to unlock (e.g., "Reportar problemas em 5 bairros diferentes"), progress toward unlock (if
in-progress), unlock date (if conquistada), and a share button.

## Acceptance Criteria

### Scenario · Default render (unlocked)

**Given** the medal is unlocked\
**When** the sheet opens\
**Then** the medal art (full color), name, description, category appear\
**And** unlock date is shown\
**And** a "Compartilhar" CTA is prominent

### Scenario · Default render (in-progress)

**Given** the medal is in progress\
**When** the sheet opens\
**Then** silhouette art, name, description, category\
**And** the unlock criteria + progress ("3 de 5 bairros")\
**And** a "Ver progresso" CTA opens the relevant My Reports filter (or similar)

### Scenario · Default render (locked / hidden)

**Given** the medal is locked or hidden\
**When** the sheet opens\
**Then** silhouette + name + category + minimal hint\
**And** for hidden: name is "???"; criteria omitted to preserve secret

### Scenario · Tap "Compartilhar"

**Given** the medal is unlocked\
**When** the user taps share\
**Then** task 05's share flow runs

### Scenario · Dismissal

**Given** the user wants to close\
**When** they swipe down or tap outside\
**Then** the sheet closes

### Scenario · Real-time unlock celebration

**Given** an in-progress medal just became unlocked\
**When** the user views the sheet\
**Then** an unlock celebration animation runs (sparkles + sound)

### Scenario · Localization

**Given** en-US\
**When** rendered\
**Then** all copy translates

### Scenario · Accessibility

**Given** SR is on\
**When** the sheet opens\
**Then** focus moves in; content announced in order

## Frontend

```
apps/city-hero/src/screens/AchievementsBadges/
└── components/
    ├── MedalDetailSheet.tsx
    └── UnlockCelebration.tsx
```

## Backend

The medal detail comes from the catalog and the user's unlock state. No extra endpoint.

## Database

`medals_catalog` rows include description, category, unlock criteria JSON.

## Edge Cases

- **Criteria changed mid-progress**: re-evaluated honestly; progress updated.
- **Animation interrupted**: sheet stays accessible.

## Privacy / LGPD

Personal.

## Analytics

| Event                               | When                       | Props               |
| ----------------------------------- | -------------------------- | ------------------- |
| `achievements.detail_opened`        | Sheet opened               | `medal_id`, `state` |
| `achievements.see_progress_pressed` | User opened progress view  | `medal_id`          |
| `achievements.unlock_celebrated`    | In-detail unlock animation | `medal_id`          |

## Tests

- **Unit**: variants per state; share fires; tap navigations.
- **Snapshot**: each state.
- **A11y**: content read in order.

## Definition of Done

- [ ] MedalDetailSheet + UnlockCelebration
- [ ] State-dependent rendering
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Medal grid: `03-medal-grid.md`
- `CLAUDE.md`
