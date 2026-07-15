# Notifications · Render UI base

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 19 · Notifications\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a white background, a header row with a back button, "Central" kicker +
"Notificações · N" title, and a "Marcar lidas" action on the right. Below: filter chips (task 02),
then the time-grouped scrollable list (task 03).

## User Story

**As a** Citizen,\
**I want** a clean notification center,\
**In order to** review what's happened recently without distraction.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens Notifications\
**When** the screen renders\
**Then** the status bar variant is `dark`\
**And** the header has a back button on the left, "Central" small caps + "Notificações · N" main
title, and a "Marcar lidas" link on the right\
**And** below: filter chips slot\
**And** below: time-grouped list slot

### Scenario · Title count updates

**Given** the unread count changes (real-time push arrives or items are marked read)\
**When** the change happens\
**Then** the title's count updates accordingly

### Scenario · "Marcar lidas" availability

**Given** there are unread notifications\
**When** the link renders\
**Then** it's active (brand color)\
**And** if there are no unread, the link is hidden (or disabled)

### Scenario · Slot system

**Given** the screen exposes positional slots\
**When** other tasks plug in\
**Then** the named slots are: `filter-chips`, `notification-list`\
**And** the order reflects the prototype

### Scenario · Back navigation

**Given** the user taps back\
**When** the action runs\
**Then** the screen returns to the previous screen (usually Mais menu or Home)

### Scenario · Theming

**Given** the user is in dark mode\
**When** the screen renders\
**Then** the background switches to dark\
**And** chip and card backgrounds adapt tonally

### Scenario · Accessibility

**Given** screen reader is on\
**When** the screen mounts\
**Then** the title is announced as a heading\
**And** "Marcar lidas" is clearly labeled with its bulk-action behavior

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/Notifications/
├── NotificationsScreen.tsx
├── NotificationsScreen.styles.ts
├── NotificationsScreen.test.tsx
└── components/
    ├── NotificationsHeader.tsx
    └── NotificationsLayoutSlots.tsx
```

### Component behavior

- `NotificationsScreen` composes the header, slots, and back navigation.
- `NotificationsHeader` reads the unread count and the "Marcar lidas" callback.
- The unread count comes from the notifications store / hook (per task 03's `useNotifications`).

## Backend

Not applicable for this task.

## Database

Not applicable directly.

## Edge Cases

- **No notifications at all** (first-time user): the list area shows an empty state ("Tudo quieto ·
  vamos te avisar quando algo importante rolar").
- **Title count changes during scroll**: the title doesn't flicker; counts update smoothly.

## Privacy / LGPD

Not applicable to this task.

## Analytics

| Event                        | When           | Props                         |
| ---------------------------- | -------------- | ----------------------------- |
| `notifications.viewed`       | Screen mounts  | `unread_count`, `total_count` |
| `notifications.back_pressed` | User taps back | —                             |

## Tests

- **Unit**: header renders with correct count; "Marcar lidas" availability tied to unread count.
- **Snapshot**: light + dark; with and without unread.
- **A11y**: title and link labeled.

## Definition of Done

- [ ] NotificationsScreen base layout
- [ ] NotificationsHeader with count + "Marcar lidas"
- [ ] Slot system
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Prototype: `design/index.html` (search `title: 'Notificações'`)
- Push handler: `00-foundation/11-push-notification-handler.md`
- `CLAUDE.md`
