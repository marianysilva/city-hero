# Citizen Profile · Recent medals carousel

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 28 · Citizen Profile
> **Effort:** M (1-2 days)
> **Dependencies:** `28-citizen-profile/01-render-profile-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `gamification`

## Context

A horizontal carousel of the user's most recent medals (last 5-7). Each medal: emoji + name + small "Desbloqueada em {date}" label. Tapping any opens SCREEN 29 (Achievements) scrolled to that medal. A "Ver todas" link at the end takes the user to SCREEN 29 directly.

## Acceptance Criteria

### Scenario · Default render

**Given** the user has medals
**When** the carousel renders
**Then** a "MEDALHAS RECENTES" label above
**And** below: a horizontal scrollable row of medal cards

### Scenario · Empty state

**Given** the user has no medals yet
**When** the section renders
**Then** a soft empty message with the first medal preview ("Comece reportando · 🏅 Primeiro Reporte te espera")

### Scenario · Tap a medal

**Given** the user taps a medal
**When** the action runs
**Then** SCREEN 29 opens scrolled to that specific medal

### Scenario · "Ver todas" CTA

**Given** the user wants the full collection
**When** they tap "Ver todas →"
**Then** SCREEN 29 opens

### Scenario · New medal unlocked animation

**Given** the user just unlocked a medal (real-time)
**When** the carousel renders
**Then** the new medal appears at the start with a celebratory animation

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** medal names translate; dates use locale format

### Scenario · Accessibility

**Given** SR is on
**When** navigated
**Then** each medal is a button announcing its name + unlock date

## Frontend

```
apps/city-hero/src/screens/CitizenProfile/
├── components/
│   ├── MedalsCarousel.tsx
│   └── MedalCard.tsx
└── hooks/
    └── useRecentMedals.ts
```

## Backend

| Method | Path                                    | Purpose       |
| ------ | --------------------------------------- | ------------- |
| GET    | `/api/v1/users/me/medals/recent?limit=` | Recent medals |

## Database

`medals_unlocked` table linking users to medals.

## Edge Cases

- **Medal data missing**: skeleton placeholder.

## Privacy / LGPD

Personal achievements.

## Analytics

| Event                                    | When                | Props      |
| ---------------------------------------- | ------------------- | ---------- |
| `citizen_profile.medals_rendered`        | Carousel mounted    | `count`    |
| `citizen_profile.medal_pressed`          | User tapped a medal | `medal_id` |
| `citizen_profile.see_all_medals_pressed` | "Ver todas" tapped  | —          |

## Tests

- **Unit**: carousel renders; tap navigation; empty state.
- **Snapshot**: empty + populated.
- **A11y**: medals as buttons.

## Definition of Done

- [ ] MedalsCarousel + MedalCard
- [ ] useRecentMedals hook
- [ ] Backend endpoint
- [ ] Real-time new-medal animation
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Achievements screen: `docs/tasks/29-achievements-badges/`
- `CLAUDE.md`
