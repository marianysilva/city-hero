# Notifications · Notification card + tap routing

> **Type:** Screen feature · UI + navigation
> **Screen:** SCREEN 19 · Notifications
> **Effort:** M (1-2 days)
> **Dependencies:** `19-notifications/03-time-grouped-list.md`, `00-foundation/11-push-notification-handler.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `navigation`

## Context

Each notification row is rendered as a card: a 40dp rounded-square icon
on the left (colored background per category type), title + description
in the middle, and a relative timestamp on the right. Unread
notifications get a subtle brand-tinted row background + a small dot
indicator on the icon.

Tapping a notification:

1. Marks it as read (per task 05).
2. Routes to the appropriate destination based on its **type**
   (resolved ticket → SCREEN 14; XP gain → Profile XP detail;
   achievement progress → Achievements; community support → the
   referenced report's detail; prefecture alert → SCREEN 21; etc.).

## User Story

**As a** Citizen,
**I want** a clean card per notification with the right destination on tap,
**In order to** jump to the relevant context.

## Acceptance Criteria

### Scenario · Default render

**Given** a notification arrives in the list
**When** the card renders
**Then** a 40dp icon square on the left with the category color background and emoji
**And** the title (e.g., "Seu ticket foi resolvido!") in bold
**And** the description (e.g., "Buraco da R. São Pedro · confira o 'antes x depois'") in muted text
**And** the relative time on the right (e.g., "2m")

### Scenario · Unread state

**Given** the notification is unread
**When** the card renders
**Then** the row background is subtly tinted brand-50
**And** a small brand-color dot indicator appears on the top-right of the icon
**And** marking as read removes both indicators

### Scenario · Icon color per type

**Given** notifications have different categories
**When** rendered
**Then** the icon background colors map deliberately:
  - emerald — ticket resolved
  - yellow-gold — XP gain
  - purple — achievement
  - rose — social support
  - sky — prefecture
  - slate — enrichment
  - amber — level-up

### Scenario · Tap routing

**Given** the user taps a notification
**When** the action runs
**Then** the notification is marked as read (per task 05)
**And** the app navigates to the destination based on its type:
  - `ticket.status_change` / `ticket.resolved` → Detail · Ticket / In Progress (SCREEN 13/14)
  - `xp.gained` → Citizen Profile XP tab (SCREEN 28)
  - `achievement.unlocked` → Achievements & Medals (SCREEN 29)
  - `support.received` → the supported report's detail
  - `prefecture.alert` → Prefecture News (SCREEN 21)
  - `enrichment.added` → the parent report's detail
  - `level.up` → Citizen Profile (SCREEN 28)

### Scenario · Unknown type (forward compatibility)

**Given** a future notification type the app doesn't recognize
**When** the user taps it
**Then** the app navigates to a safe default (Home or My Reports)
**And** logs the unknown type for telemetry

### Scenario · Deep-linkable payload

**Given** the notification has a `target` object in its payload (per `00-foundation/11`)
**When** the tap fires
**Then** the deep-link handler resolves and navigates accordingly
**And** if the target is invalid (resource deleted), a soft toast informs and routes to a safe default

### Scenario · Long titles / descriptions

**Given** long content
**When** rendered
**Then** the title truncates after 2 lines with ellipsis
**And** the description truncates after 1 line with ellipsis
**And** full content is visible at the destination

### Scenario · Localization

**Given** the user's language is en-US
**When** the row renders
**Then** title and description are in English (per the notification's i18n keys at dispatch time)
**And** the relative time formats locally

### Scenario · Accessibility

**Given** screen reader is on
**When** the row is read
**Then** the row is announced as a group with the title, description, time, and unread state
**And** activating it announces the destination

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/Notifications/
├── components/
│   └── NotificationCard.tsx
└── services/
    └── notificationRouting.ts
```

### Component behavior

- `NotificationCard` is presentational; receives the notification data + a tap callback.
- `notificationRouting` is a service that maps a notification's type + target to a navigation action.
- The tap calls `markAsRead(notification_id)` (per task 05) and `navigateToTarget(notification)`.

### Color tokens

The icon background colors are defined in the design system tokens and reference each category. Adding a new category requires adding a token + a routing rule.

## Backend

The notification record includes:

- `category` — the type key (e.g., `ticket.resolved`).
- `title_key`, `body_key`, `body_params` — i18n.
- `target` — JSON object for routing (e.g., `{kind: 'report', id: '...'}`).
- `read_at` — nullable.

Schema is owned by `00-foundation/11-push-notification-handler.md`.

## Database

No new schema.

## Edge Cases

- **Target resource deleted**: the toast informs and routes to a safe default.
- **Target on a different city**: handled per `00-foundation/12-deep-link-handler.md` (cross-tenant prompt).
- **Many similar notifications collapsed** (future feature): not in MVP; each notification is its own row.

## Privacy / LGPD

The notification content is per-user; no cross-user data exposure.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `notifications.card_pressed`       | User tapped a notification                 | `category`, `target_kind`             |
| `notifications.unknown_type_seen`  | Unknown category encountered               | `category`                            |
| `notifications.routing_failed`     | Target invalid                             | `category`, `target_kind`             |

## Tests

- **Unit**: card renders per category; unread state; tap routing maps to correct destinations.
- **Snapshot**: each color variant; unread + read.
- **A11y**: row group announced.

## Definition of Done

- [ ] NotificationCard component
- [ ] notificationRouting service
- [ ] Category color tokens
- [ ] Tap routing for all known types + safe default for unknown
- [ ] Deep-link integration
- [ ] Localized rendering
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Time-grouped list: `03-time-grouped-list.md`
- Mark-as-read: `05-mark-as-read.md`
- Push handler (data + routing): `00-foundation/11-push-notification-handler.md`
- Deep-link handler: `00-foundation/12-deep-link-handler.md`
- `CLAUDE.md`
