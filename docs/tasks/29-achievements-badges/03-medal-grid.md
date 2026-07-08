# Achievements · Medal grid

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 29 · Achievements & Badges
> **Effort:** M (1-2 days)
> **Dependencies:** `29-achievements-badges/01-render-achievements-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `gamification`

## Context

A 3-column grid of medal cards. Each card: medal emoji (color when unlocked, gray silhouette when locked) + name + small "Conquistada {date}" or "{progress} de {target}" indicator. Tapping opens the detail sheet (task 04). Hidden/secret medals show as locked silhouettes with "???" until unlocked.

## Acceptance Criteria

### Scenario · Default render

**Given** medals are loaded
**When** the grid renders
**Then** 3-column grid with cards
**And** unlocked cards: full color + date
**And** in-progress: silhouette + progress hint (e.g., "3 de 5")
**And** locked: silhouette + "🔒 Bloqueada"
**And** hidden: silhouette + "?" until unlocked

### Scenario · Tap a card

**Given** the user taps a medal
**When** the action runs
**Then** the detail sheet (task 04) opens with the medal's full info

### Scenario · Pagination

**Given** many medals
**When** scrolling
**Then** next page fetches (cursor-based)

### Scenario · Real-time unlock animation

**Given** the user just unlocked a medal
**When** the WS pushes
**Then** the card animates from silhouette to full color with a small burst effect

### Scenario · Empty filter

**Given** the active filter yields zero
**When** the empty state renders
**Then** message suggests broadening the filter

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** medal names + statuses translate

### Scenario · Accessibility

**Given** SR is on
**When** navigated
**Then** each card is a button announcing name + status

## Frontend

```
apps/city-hero/src/screens/AchievementsBadges/
├── components/
│   ├── MedalGrid.tsx
│   └── MedalGridCard.tsx
└── hooks/
    └── useMedalsCatalog.ts
```

## Backend

| Method | Path                                                          | Purpose                              |
|--------|---------------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/users/me/medals?filter=&cursor=&limit=`              | Paginated medals catalog + unlock state |

## Database

`medals_catalog` defines medals; `medals_unlocked` tracks user state.

## Edge Cases

- **Medal removed from catalog after user unlocked it**: still shown to that user.
- **Hidden medals not in default filter**: shown only after unlock unless explicitly filtered "Conquistadas".

## Privacy / LGPD

Personal collection.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `achievements.grid_loaded`         | First page rendered                        | `unlocked_count`, `filter`           |
| `achievements.medal_pressed`       | User tapped                                | `medal_id`, `is_unlocked`            |
| `achievements.realtime_unlock`     | New unlock animation triggered             | `medal_id`                            |

## Tests

- **Unit**: card variants per state; tap behavior; pagination.
- **Snapshot**: states.
- **A11y**: cards as buttons with state.

## Definition of Done

- [ ] MedalGrid + MedalGridCard
- [ ] useMedalsCatalog hook
- [ ] Backend endpoint
- [ ] Real-time unlock animation
- [ ] Empty state
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Detail sheet: `04-detail-sheet.md`
- `CLAUDE.md`
