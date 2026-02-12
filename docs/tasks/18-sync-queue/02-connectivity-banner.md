# Sync Queue · Connectivity banner

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 18 · Sync Queue
> **Effort:** S (≤1 day)
> **Dependencies:** `18-sync-queue/01-render-sync-ui-base.md`, `00-foundation/09-offline-queue.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `offline`

## Context

A prominent gradient banner at the top of the screen showing the
current connectivity + queue state. Variants:

- **Offline**: amber→rose gradient, "📶 Sem conexão · 3 reportes na
  fila · Estão salvos no seu celular. Vão sozinhos quando o sinal
  voltar."
- **Online, items pending**: emerald→teal gradient, "✓ Conectado ·
  sincronizando 3 reportes".
- **Online, queue empty**: hidden (or a small "Tudo certo" banner).
- **Sync errored**: rose gradient with "Algumas tentativas falharam ·
  toque pra ver".

The banner is the screen's emotional core — reassuring when offline,
celebratory when sync completes.

## User Story

**As a** Citizen,
**I want** a clear current-state banner,
**In order to** know without thinking whether my reports are safe and what's happening now.

## Acceptance Criteria

### Scenario · Offline with pending items

**Given** the device is offline and there are N items queued
**When** the banner renders
**Then** the gradient is amber→rose
**And** a 📶 icon on the left
**And** the headline "Sem conexão · N reportes na fila"
**And** the subtext "Estão salvos no seu celular. Vão sozinhos quando o sinal voltar"

### Scenario · Online, sync in progress

**Given** the device is online and items are syncing
**When** the banner renders
**Then** the gradient is emerald→teal
**And** the headline "Sincronizando N reportes"
**And** the subtext shows the progress aggregate ("2 de 3 enviados")

### Scenario · Online, queue empty

**Given** the queue is empty and the device is online
**When** the banner would render
**Then** the banner is hidden entirely
**And** the empty state in the list area (per task 01) takes over

### Scenario · Sync errored (some items failed)

**Given** one or more queue items have failed permanently
**When** the banner renders
**Then** the gradient is rose
**And** the headline "Algumas tentativas falharam"
**And** the subtext "Toque pra ver" (taps scroll to the failed items)

### Scenario · Banner updates in real time

**Given** the connectivity or queue state changes
**When** the change happens
**Then** the banner animates between variants smoothly (gradient transition + content swap)
**And** reduced motion respects the user's preference

### Scenario · Localization

**Given** the user's language is en-US
**When** the banner renders
**Then** copy is in English ("No connection · N reports queued", "Syncing N reports", etc.)

### Scenario · Tap on failed banner

**Given** the failed variant is shown
**When** the user taps
**Then** the screen scrolls to the first failed item in the list
**And** the item's retry affordance is highlighted briefly

### Scenario · Accessibility

**Given** screen reader is on
**When** the banner is read
**Then** the headline is announced as a live region with the count
**And** the action (when tappable) is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/SyncQueue/
└── components/
    └── ConnectivityBanner.tsx
```

### Component behavior

- The banner reads from:
  - The connectivity hook (per `00-foundation/09`).
  - The queue store (count + aggregated state).
- Renders the appropriate variant.
- Animates between variants when state changes.

### Variants

A small state machine maps `(connectivity, queue_summary)` to one of: `offline_with_items`, `online_syncing`, `online_done`, `error`.

## Backend

Not applicable. The data is entirely local.

## Database

Not applicable.

## Edge Cases

- **Brief connectivity flap**: the banner debounces transitions so it doesn't flash.
- **All items failed permanently**: the error variant persists until the user discards or retries them.

## Privacy / LGPD

Not applicable directly. The banner displays counts and state, not content.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `sync_queue.banner_state_changed`  | Variant transitioned                       | `from`, `to`                          |
| `sync_queue.error_banner_tapped`   | User tapped the error variant              | —                                     |

## Tests

- **Unit**: variant mapping logic; transitions; tap behavior.
- **Snapshot**: each variant.
- **A11y**: live region announces state changes.

## Definition of Done

- [ ] ConnectivityBanner component with 4 variants
- [ ] State machine
- [ ] Smooth transitions (with reduced motion)
- [ ] Tap-to-scroll on error variant
- [ ] Localized copy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-sync-ui-base.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `CLAUDE.md`
