# My Reports · Pending offline card

> **Type:** Screen feature · UI + offline state
> **Screen:** SCREEN 16 · My Reports
> **Effort:** S (≤1 day)
> **Dependencies:** `16-my-reports/01-render-my-reports-ui-base.md`, `00-foundation/09-offline-queue.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `offline`

## Context

A dashed-border amber card highlighted at the top of the scroll area
(below the filter chips) when there are reports waiting in the offline
queue. It reassures the user that nothing was lost: "2 reportes
aguardando envio · Serão sincronizados quando tiver rede." A "Ver"
button navigates to SCREEN 18 (Sync Queue) for details.

## User Story

**As a** Citizen who submitted reports offline,
**I want** to see clearly that they're held safely,
**In order to** trust the app and not duplicate.

## Acceptance Criteria

### Scenario · Default render (with pending items)

**Given** there are N items in the offline queue
**When** the card renders
**Then** a dashed amber border card is shown
**And** a 📡 icon on the left
**And** the headline "N reportes aguardando envio" in amber emphasis
**And** the subtext "Serão sincronizados quando tiver rede"
**And** a "Ver" button on the right

### Scenario · No pending items

**Given** the queue is empty
**When** the screen renders
**Then** the card is hidden entirely
**And** the layout reflows so the list (task 04) moves up

### Scenario · Tap "Ver"

**Given** the user taps the button
**When** the action runs
**Then** the app navigates to SCREEN 18 (Sync Queue)
**And** the user can monitor the sync details there

### Scenario · Card updates in real time

**Given** the queue count changes (new item added, sync completes one)
**When** the change happens
**Then** the headline updates the count
**And** if the count reaches 0, the card animates out

### Scenario · Queue items syncing

**Given** the device just came online and the queue is draining
**When** the sync is in progress
**Then** the card's subtext changes to "Sincronizando…"
**And** an animated progress indicator subtly appears

### Scenario · Sync completed (transient toast)

**Given** the last queue item completes
**When** the queue empties
**Then** the card transitions to a brief success state ("✓ Sincronizado") for 2-3 seconds
**And** then animates out

### Scenario · Sync failed item

**Given** a queue item failed to sync (final failure per `00-foundation/09`)
**When** the card renders
**Then** the card shows the count of pending + a hint about the failure
**And** "Ver" navigates to SCREEN 18 where the user can retry or discard

### Scenario · Accessibility

**Given** screen reader is on
**When** the card is focused
**Then** it's announced with the count and the action
**And** "Ver" is clearly labeled with its destination

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/MyReports/
└── components/
    └── PendingOfflineCard.tsx
```

### Component behavior

- The card reads from the offline queue's store (per `00-foundation/09`) the current count and aggregated state.
- It's only rendered when count > 0 or during the brief success transition.
- Animations on entry and exit are smooth (respecting reduced motion).

## Backend

Not applicable. The queue is local; the card reflects local state.

## Database

Not applicable.

## Edge Cases

- **Queue items appear and disappear rapidly**: a small debounce avoids visual flicker.
- **Item count is very high (e.g., 30+ items)**: the card still works; the user can drill into the sync screen for management.

## Privacy / LGPD

The queue stores the reports' payloads locally; the card displays only counts (no specific content).

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `my_reports.pending_card_shown`    | Card visible                               | `count`                               |
| `my_reports.pending_card_pressed`  | User tapped Ver                            | `count`                               |
| `my_reports.pending_sync_completed`| Queue drained                              | —                                     |

## Tests

- **Unit**: card visibility tied to count; transitions on count change; success state.
- **Integration**: real-time queue updates reflect; navigation to SCREEN 18 works.
- **A11y**: announcements verified.

## Definition of Done

- [ ] PendingOfflineCard component
- [ ] Queue store integration
- [ ] Enter/exit animations (reduced motion respected)
- [ ] Sync-in-progress and success states
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-my-reports-ui-base.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- Sync Queue screen: `docs/tasks/18-sync-queue/`
- `CLAUDE.md`
