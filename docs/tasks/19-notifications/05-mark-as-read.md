# Notifications · Mark-as-read (per item + bulk)

> **Type:** Screen feature · State + backend
> **Screen:** SCREEN 19 · Notifications
> **Effort:** S (≤1 day)
> **Dependencies:** `19-notifications/04-notification-card.md`, `00-foundation/11-push-notification-handler.md`, `00-foundation/09-offline-queue.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`

## Context

Two paths to mark notifications as read:

- **Per-item**: tapping a notification marks it read as a side effect
  of navigation.
- **Bulk**: tapping "Marcar lidas" in the header clears all unread
  notifications in a single action.

Both paths update local state immediately (optimistic) and call the
backend to persist the change. The unread count (used by the bottom
nav badge from `00-foundation/03` and the screen title) updates
accordingly. Offline support routes through the offline queue.

## User Story

**As a** Citizen,
**I want** quick ways to clear unread notifications,
**In order to** keep the badge accurate without scrolling through old items.

## Acceptance Criteria

### Scenario · Per-item mark on tap

**Given** the user taps an unread notification
**When** the action runs
**Then** the notification's unread state is cleared locally (optimistic)
**And** the row's visual unread indicators (background tint + dot) animate out
**And** the screen's title count decrements
**And** the bottom nav badge updates
**And** the backend is notified

### Scenario · Bulk "Marcar lidas"

**Given** there are N unread notifications
**When** the user taps "Marcar lidas"
**Then** all unread items become read locally (optimistic)
**And** the title count drops to 0
**And** the link itself hides (or is disabled)
**And** the backend is notified with a single batch call

### Scenario · Bulk includes only currently-filtered items?

**Given** a filter is active (e.g., "Status")
**When** the user taps "Marcar lidas"
**Then** for MVP, all unread notifications (across all categories) are marked read
**And** future iterations could limit to the active filter; not in MVP

### Scenario · Backend failure

**Given** the per-item or bulk request fails
**When** the response arrives
**Then** the local state remains updated (optimistic), and the change syncs on a retry per `00-foundation/05`
**And** if the retry exhausts, the local state reverts to honest server state on next fetch

### Scenario · Offline

**Given** the device is offline
**When** the user marks read (per item or bulk)
**Then** the change is queued via the offline queue
**And** the optimistic UI persists
**And** the queue syncs when connectivity returns

### Scenario · Idempotency

**Given** the user marks an already-read notification
**When** the call goes to the backend
**Then** the operation is a no-op (idempotent)
**And** no extra side effects

### Scenario · Real-time conflict

**Given** another device for the same user marked items as read first
**When** the WS pushes the update
**Then** the local state syncs (the read flag converges)
**And** no jarring re-render of items that didn't change

### Scenario · Mark unread (reverse) — future

**Given** the user wants to keep a notification as unread (mark it back)
**When** they long-press or use an action
**Then** for MVP, no reverse action is available
**And** future iterations may add this

### Scenario · Accessibility

**Given** screen reader is on
**When** items are marked
**Then** the action is announced ("Marked as read") for the per-item case
**And** the bulk action is announced ("All marked as read · N items")

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/services/notifications/
├── markReadAction.ts
└── hooks/
    └── useMarkRead.ts
```

### Behavior

- `useMarkRead` exposes `markOne(id)` and `markAllUnread()`.
- Each mutation uses TanStack Query with optimistic updates against the notifications cache.
- Offline routing per `00-foundation/09`.

### Cache invalidation

Marking read updates:

- The notifications query cache (per-item flag).
- The unread count (read from `/api/v1/notifications/unread-count`).
- The bottom nav badge (subscribed to the same source).

## Backend (FastAPI)

### Endpoints

| Method | Path                                  | Purpose                      |
| ------ | ------------------------------------- | ---------------------------- |
| PATCH  | `/api/v1/notifications/{id}`          | Mark a single notification   |
| POST   | `/api/v1/notifications/mark-all-read` | Bulk mark all unread as read |

Both are idempotent and multi-tenant scoped.

## Database

The `notifications.read_at` column is updated. The unread-count endpoint reads from this efficiently (with an index on `(user_id, read_at)`).

## Edge Cases

- **Marking read for a notification whose target was already opened externally** (e.g., user opened the report from a deep link): the next visit to Notifications shows it as read; no extra confusion.
- **Bulk mark with a very large unread count** (rare; thousands): server handles in a single SQL `UPDATE` with a WHERE clause; performance is fine.

## Privacy / LGPD

Not applicable directly.

## Analytics

| Event                           | When          | Props          |
| ------------------------------- | ------------- | -------------- |
| `notifications.marked_one_read` | Per-item mark | `category`     |
| `notifications.marked_all_read` | Bulk mark     | `count_marked` |
| `notifications.mark_failed`     | Backend error | `code`         |

## Tests

- **Unit**: optimistic + rollback paths; offline queueing; idempotency.
- **Integration**: per-item mark and bulk mark update cache + badge.
- **A11y**: announcements verified.

## Definition of Done

- [ ] markReadAction service
- [ ] useMarkRead hook with per-item and bulk
- [ ] Optimistic + rollback
- [ ] Offline queue path
- [ ] Backend endpoints (per-item + bulk)
- [ ] Cache invalidation (notifications query + badge)
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (REST, idempotency, multi-tenant): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- TanStack Query mutations: https://tanstack.com/query/latest/docs/react/guides/mutations

### Project context

- Notification card (entry point): `04-notification-card.md`
- Time-grouped list (cache): `03-time-grouped-list.md`
- Push handler: `00-foundation/11-push-notification-handler.md`
- Bottom nav badge (consumer): `00-foundation/03-bottom-nav-component.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `CLAUDE.md`
