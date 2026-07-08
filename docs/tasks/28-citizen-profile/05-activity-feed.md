# Citizen Profile · Recent activity feed

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 28 · Citizen Profile
> **Effort:** M (1-2 days)
> **Dependencies:** `28-citizen-profile/01-render-profile-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`

## Context

A scrollable list of the user's recent gamification activity: level-ups, medal unlocks, big XP gains, support milestones, etc. Each row has a colored icon + headline + supporting context + time. Activity items are personal — only the user sees this. Tapping each can navigate to the relevant context.

## Acceptance Criteria

### Scenario · Default render

**Given** the user has activity
**When** the feed renders
**Then** rows appear sorted by most recent
**And** each row: colored icon + headline + context + relative time

### Scenario · Activity types

**Given** various activity events
**When** rendered
**Then** types include:

- level_up: "Você virou Guardião · Nível 15"
- medal_unlocked: "Medalha 🌙 Vigia Noturno"
- xp_milestone: "Atingiu 2.000 XP"
- support_received: "Seu reporte recebeu 50 apoios"
- report_resolved: "Seu reporte foi resolvido"

### Scenario · Tap an item

**Given** the user taps a row
**When** the action runs
**Then** navigates to the relevant screen (Detail · Ticket for a report, Achievements for a medal, etc.)

### Scenario · Pagination

**Given** many items
**When** scrolling
**Then** next page fetches

### Scenario · Share an activity

**Given** the user wants to share a milestone
**When** they tap a small share icon on a row
**Then** the share sheet opens with a celebratory message

### Scenario · Empty state

**Given** the user is brand new
**When** no activity exists
**Then** a friendly empty message ("Sua jornada começa aqui · faça seu primeiro reporte")

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** activity copy translates

### Scenario · Accessibility

**Given** SR is on
**When** navigated
**Then** each row announced as a group with headline + time

## Frontend

```
apps/city-hero/src/screens/CitizenProfile/
├── components/
│   ├── ActivityFeed.tsx
│   └── ActivityRow.tsx
└── hooks/
    └── useUserActivity.ts
```

## Backend

| Method | Path                                       | Purpose                |
| ------ | ------------------------------------------ | ---------------------- |
| GET    | `/api/v1/users/me/activity?cursor=&limit=` | Personal activity feed |

## Database

A `user_activity_events` table or computed from various sources (xp_events, medals_unlocked, etc.). For MVP, a unified events feed.

## Edge Cases

- **Very long history**: virtualization + pagination.
- **Share unavailable**: graceful fallback.

## Privacy / LGPD

Personal feed; not exposed to others.

## Analytics

| Event                                  | When                | Props        |
| -------------------------------------- | ------------------- | ------------ |
| `citizen_profile.activity_loaded`      | First page rendered | `count`      |
| `citizen_profile.activity_row_pressed` | User tapped         | `event_type` |
| `citizen_profile.activity_shared`      | User shared a row   | `event_type` |

## Tests

- **Unit**: row variants per event type; share fires; pagination.
- **Snapshot**: variants.
- **A11y**: rows labeled.

## Definition of Done

- [ ] ActivityFeed + ActivityRow components
- [ ] useUserActivity hook
- [ ] Backend endpoint
- [ ] Share affordance per row
- [ ] Empty state
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- `CLAUDE.md`
