# Sync Queue · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 18 · Sync Queue
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a slate-50 background, a top connectivity banner slot
(task 02), a header row with "Fila de envio" title + "Última tentativa
há N min" subtitle on the left and a manual sync button on the right
(task 03), then a scrollable list of queue items (task 04).

The screen is reachable from the offline banner on Home, the
pending-offline card on My Reports, or a notification. The back
navigation returns to the entry point naturally.

## User Story

**As a** Citizen,
**I want** a clean layout that surfaces the queue state at a glance,
**In order to** trust nothing is lost.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** it renders
**Then** the status bar variant is `dark`
**And** the connectivity banner slot is at the top
**And** below: a header row with the title "Fila de envio" + a small "Última tentativa há N min" line + the manual sync button on the right
**And** below the header: the queue list slot

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** other tasks plug in
**Then** the named slots are: `connectivity-banner`, `header-row`, `queue-list`
**And** the order reflects the prototype

### Scenario · Header subtitle updates

**Given** sync attempts happen periodically
**When** the last-attempt timestamp updates
**Then** the subtitle reflects the new value ("agora", "há 1 min", "há 15 min")

### Scenario · Empty queue

**Given** the queue is empty
**When** the screen renders
**Then** an empty state replaces the list ("Tudo certo · nada pra enviar")
**And** the connectivity banner adapts to a green "Conectado · nada na fila" variant or hides entirely

### Scenario · Back navigation

**Given** the user taps back
**When** the action runs
**Then** the screen returns to the previous screen (per the navigation stack)

### Scenario · Theming

**Given** the user is in dark mode
**When** the screen renders
**Then** the background and cards adapt tonally
**And** the gradient banner remains constant

### Scenario · Accessibility

**Given** screen reader is on
**When** the screen mounts
**Then** the title is announced as a heading
**And** the slot order is preserved as reading order

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/SyncQueue/
├── SyncQueueScreen.tsx
├── SyncQueueScreen.styles.ts
├── SyncQueueScreen.test.tsx
└── components/
    ├── SyncQueueLayoutSlots.tsx
    └── SyncQueueHeader.tsx
```

### Component behavior

- `SyncQueueScreen` composes the banner, header row, and list slots.
- `SyncQueueLayoutSlots` defines positional anchors.
- `SyncQueueHeader` renders the title, subtitle, and a slot for the manual sync button.
- Empty state is rendered when the queue store has no items.

## Backend

Not applicable for this task.

## Database

Not applicable directly. The local WatermelonDB queue (per `00-foundation/09`) is the data source.

## Edge Cases

- **Queue mutates while the screen is open** (real-time): the list updates incrementally.
- **Very long queue** (rare): the list virtualizes.

## Privacy / LGPD

Not applicable to this task.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `sync_queue.viewed`            | Screen mounts                              | `item_count`, `online: bool`         |
| `sync_queue.back_pressed`      | User taps back                             | —                                     |

## Tests

- **Unit**: slot rendering; empty state visibility; subtitle formatting.
- **Snapshot**: light + dark; empty + populated.
- **A11y**: title and navigation labeled.

## Definition of Done

- [ ] SyncQueueScreen base layout
- [ ] SyncQueueLayoutSlots
- [ ] SyncQueueHeader with title + subtitle
- [ ] Empty state
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Prototype: `design/index.html` (search `title: 'Fila de Sincronização'`)
- Offline queue (data source): `00-foundation/09-offline-queue.md`
- Home offline banner (entry point): `06-home-map/10-offline-banner-and-cache.md`
- My Reports pending card (entry point): `16-my-reports/03-pending-offline-card.md`
- `CLAUDE.md`
