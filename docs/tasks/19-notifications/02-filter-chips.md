# Notifications · Filter chips

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 19 · Notifications
> **Effort:** S (≤1 day)
> **Dependencies:** `19-notifications/01-render-notifications-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A horizontal row of chips: **Tudo** (default), **Status** (ticket
state changes), **Conquistas** (XP gains, level-ups, achievements),
**Comunidade** (apoios, enrichments, comments). Tapping a chip
narrows the list below to that category. The chips are sticky — they
don't scroll out of view as the user scrolls the list.

## User Story

**As a** Citizen,
**I want** to slice notifications by type,
**In order to** focus on what matters (e.g., only ticket updates).

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens Notifications
**When** the chips render
**Then** "Tudo" is active (slate-900 background, white text)
**And** "Status", "Conquistas", "Comunidade" appear in slate-100 with neutral text

### Scenario · Tap to filter

**Given** the user taps "Status"
**When** the action runs
**Then** "Status" becomes active
**And** "Tudo" becomes inactive
**And** the list (task 03) refetches/refilters to show only status-type notifications

### Scenario · Tap "Tudo" to reset

**Given** any other chip is active
**When** the user taps "Tudo"
**Then** all chips reset to default
**And** the full list shows

### Scenario · Persisted filter selection

**Given** the user picked a filter and left the screen
**When** they return
**Then** the filter persists for the session
**And** resets on cold start

### Scenario · Counts on chips (optional polish)

**Given** the chip-count UI is enabled (feature flag)
**When** the chips render
**Then** each shows a small count badge of unread for that category
**And** counts update in real time

### Scenario · Localization

**Given** the user's language is en-US
**When** the chips render
**Then** labels are in English ("All", "Status", "Achievements", "Community")

### Scenario · Sticky behavior

**Given** the user scrolls the list
**When** scrolling past the chips
**Then** the chips remain visible (sticky at the top of the scroll area)
**And** the section headers (task 03's "Hoje", "Ontem") scroll naturally

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the chips
**Then** each is announced with its label and selection state
**And** the count badges (when present) are announced

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/Notifications/
└── hooks/
    └── useNotificationFilter.ts
```

Renders the shared `FilterChipRow` from `@cityhero/design-system`. The screen owns the chip definitions and the `onChipPress` callback that filters the data; no styling lives in this screen's components. Sticky behavior comes from `FilterChipRow`. See `docs/engineering/component-inventory.md` (row `FilterChipRow`) and `docs/engineering/design-system.md`.

### Component behavior

- `useNotificationFilter` holds the active filter in screen-scoped state.
- The screen builds the chip array and passes it to `FilterChipRow` with an `onChipPress(id)` callback that updates the store.
- The notification list hook (task 03) reads from the same store.

### Chip list this screen passes to `FilterChipRow`

- `Tudo` — initial `active: true`; clears any category filter.
- `Status` — filters to ticket-state changes.
- `Conquistas` — filters to XP / level-up / achievement events.
- `Comunidade` — filters to supports, enrichments, comments, prefecture alerts.
- When the chip-count feature flag is on, each chip also receives a `count` reflecting unread for that category.

### Filter mapping

The notification categories map to chip filters:

| Chip            | Categories                                          |
|-----------------|-----------------------------------------------------|
| `Tudo`          | All                                                 |
| `Status`        | `ticket.status_change`, `ticket.resolved`, etc.    |
| `Conquistas`    | `xp.gained`, `level.up`, `achievement.unlocked`    |
| `Comunidade`    | `support.received`, `enrichment.added`, `comment.added`, `prefecture.alert` |

## Backend (FastAPI)

The notifications endpoint accepts a `category_group` query param matching the chip key (or `all`). No new endpoint; this is added to the existing `/api/v1/notifications` endpoint (defined in `00-foundation/11`).

## Database

No new schema. The notifications table has a `category` column already.

## Edge Cases

- **Filter changes while the list is fetching**: the previous fetch is canceled; the new filter's fetch runs.
- **Empty filter result**: the list area shows an empty state for that filter ("Nada em Status agora").

## Privacy / LGPD

Not applicable.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `notifications.filter_changed`     | Chip tapped                                | `from`, `to`                          |

## Tests

- **Unit**: store transitions; chip visual state; category mapping.
- **Integration**: filter change triggers list refetch.
- **A11y**: chips labeled.

## Definition of Done

- [ ] Chip list definition + filter callback (no local chip component)
- [ ] `FilterChipRow` integration verified visually in Storybook
- [ ] useNotificationFilter hook
- [ ] Category mapping
- [ ] Sticky behavior (provided by `FilterChipRow`)
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-notifications-ui-base.md`
- Time-grouped list (consumes filter): `03-time-grouped-list.md`
- Push handler: `00-foundation/11-push-notification-handler.md`
- Shared chip molecule: `docs/engineering/component-inventory.md` (row `FilterChipRow`)
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`
