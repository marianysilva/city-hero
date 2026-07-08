# Citizen Profile · Hero

> **Type:** Screen feature · UI + gamification
> **Screen:** SCREEN 28 · Citizen Profile
> **Effort:** M (1-2 days)
> **Dependencies:** `28-citizen-profile/01-render-profile-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `gamification`

## Context

A gradient hero (brand → civic-purple) with: user avatar, name + level title ("João, Guardião do Bairro · Nível 15 ★"), city pill, XP value, and a progress bar to the next level showing N/M XP. Decorative sparkles in the background. An "✏️ Editar perfil" link or floating button.

## Acceptance Criteria

### Scenario · Default render

**Given** the user has profile data
**When** the hero renders
**Then** gradient background fills it
**And** avatar (initial-based) is centered or top-left
**And** name + level title appear
**And** city pill ("Pôrto Belo · SC")
**And** XP value (large)
**And** progress bar to next level

### Scenario · Level title hierarchy

**Given** the user's level
**When** the title renders
**Then** the title matches the level: 1-5 Cidadão, 6-15 Vigilante, 16-30 Guardião do Bairro, 31-50 Líder da Liga, 51+ Herói da Cidade

### Scenario · XP progress bar

**Given** the user has N XP out of M needed for next level
**When** the bar renders
**Then** it fills proportionally
**And** the percentage and N/M numbers are shown ("2.450 / 3.000 XP")

### Scenario · Real-time XP update

**Given** the user just earned XP elsewhere
**When** the value updates
**Then** the XP number and bar animate to the new state
**And** if a level boundary is crossed, a level-up celebration triggers

### Scenario · Level-up celebration

**Given** the user just leveled up
**When** the hero renders
**Then** a small celebration animation runs (sparkles + scale pulse)
**And** the title updates to the new level
**And** haptic + sound feedback (optional)

### Scenario · Edit profile

**Given** the user wants to update their info
**When** they tap "Editar perfil"
**Then** an edit modal opens (handled by task 06) with name, language, anonymous default, notification preferences

### Scenario · Reduced motion

**Given** reduce-motion is on
**When** the hero renders
**Then** decorative animations skip; structure unchanged

### Scenario · Accessibility

**Given** SR is on
**When** the hero is read
**Then** announced as heading with name, level, XP, progress

## Frontend

```
apps/city-hero/src/screens/CitizenProfile/
└── components/
    ├── ProfileHero.tsx
    ├── XpProgressBar.tsx (reused from `10-report-confirm/07`)
    └── LevelUpCelebration.tsx
```

## Backend

Profile data from `/api/v1/auth/me`. Level + XP from the user record.

## Database

`users.xp`, `users.level` fields. Level-up logic computed by the gamification service.

## Edge Cases

- **Maximum level reached**: progress bar fills to 100%; "Herói da Cidade · Nível Max".

## Privacy / LGPD

Name shown is the user's chosen display name; can be edited.

## Analytics

| Event                                 | When             | Props                    |
| ------------------------------------- | ---------------- | ------------------------ |
| `citizen_profile.hero_rendered`       | Mounted          | `level`                  |
| `citizen_profile.level_up_celebrated` | Level transition | `from_level`, `to_level` |
| `citizen_profile.edit_pressed`        | User tapped Edit | —                        |

## Tests

- **Unit**: title per level; progress bar; level-up celebration.
- **Snapshot**: each level tier.
- **A11y**: announcements.

## Definition of Done

- [ ] ProfileHero + XpProgressBar + LevelUpCelebration
- [ ] Level title mapping
- [ ] Real-time XP updates
- [ ] Reduced-motion respected
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- XpProgressBar reused: `10-report-confirm/07-xp-medal-preview.md`
- `CLAUDE.md`
