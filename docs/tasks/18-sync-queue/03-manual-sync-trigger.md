# Sync Queue · Manual sync trigger

> **Type:** Screen feature · UI + action\
> **Screen:** SCREEN 18 · Sync Queue\
> **Effort:** S (≤1 day)\
> **Dependencies:** `18-sync-queue/01-render-sync-ui-base.md`, `00-foundation/09-offline-queue.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A small "🔄 Sincronizar" button in the screen's header that lets the user force an immediate sync
attempt when online. When offline, the button is disabled (visible but greyed out) — making clear
the action exists but isn't currently available, which is more reassuring than hiding the option
entirely.

## User Story

**As a** Citizen,\
**I want** a manual sync option,\
**In order to** force a sync attempt when I think it should work.

## Acceptance Criteria

### Scenario · Default render (offline)

**Given** the device is offline\
**When** the button renders\
**Then** it appears in the header row on the right\
**And** the button is greyed out (slate-200 background, slate-400 text)\
**And** the button is non-tappable\
**And** the icon is 🔄 followed by "Sincronizar"

### Scenario · Default render (online with items)

**Given** the device is online and there are items in the queue\
**When** the button renders\
**Then** the button is fully styled (brand background or emerald with white text)\
**And** tappable

### Scenario · Tap to sync

**Given** the button is enabled\
**When** the user taps\
**Then** light haptic feedback fires\
**And** the queue orchestrator runs a drain attempt\
**And** the button shows an in-flight state (small spinner overlay) until the drain completes\
**And** the items' individual states update accordingly (task 04's cards)

### Scenario · No items but online

**Given** the queue is empty and the device is online\
**When** the button would render\
**Then** the button is hidden (or shown as a disabled "Nada pra sincronizar")\
**And** the empty state in the list area covers the user's expectations

### Scenario · Sync in flight

**Given** a manual sync is in progress\
**When** the user taps the button again\
**Then** subsequent taps are debounced (no-op)\
**And** the user sees the existing in-flight indicator

### Scenario · Sync attempt failed (network error mid-attempt)

**Given** the manual sync started but lost connectivity mid-way\
**When** the failure is detected\
**Then** the button returns to its enabled state\
**And** the items return to their previous states (waiting/failed as appropriate)\
**And** a soft toast explains ("Conexão caiu · vamos tentar de novo automaticamente")

### Scenario · Rate limit

**Given** the user rapidly taps sync\
**When** the rate exceeds a threshold (e.g., 5/minute)\
**Then** subsequent taps show a soft warning ("Espera um pouco")\
**And** the backoff communicated naturally

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user focuses the button\
**Then** the state is announced ("Sync, disabled because offline" / "Sync, syncing")\
**And** activating it announces the action

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/SyncQueue/
└── components/
    └── ManualSyncButton.tsx
```

### Component behavior

- The button reads from the connectivity and queue stores.
- On tap, calls the queue orchestrator's `drainNow()` function (per `00-foundation/09`).
- The in-flight state is reflected via the queue store's `is_syncing` flag.

### Visual states

| State                 | Background                      | Text      | Tappable       |
| --------------------- | ------------------------------- | --------- | -------------- |
| Offline               | slate-200                       | slate-400 | No             |
| Online + items + idle | brand or emerald                | white     | Yes            |
| Syncing in flight     | same as above + spinner overlay | white     | No (debounced) |
| Empty queue           | hidden                          | —         | —              |

## Backend

Not applicable. The trigger calls the local queue orchestrator, which orchestrates the backend calls
through the offline queue (per `00-foundation/09`).

## Database

Not applicable.

## Edge Cases

- **User taps while connectivity is transitioning**: the button respects the state at tap time; if
  the transition makes the button inactive mid-tap, the request is no-op.
- **All items are failed permanently**: tapping sync attempts to re-drain them (the orchestrator
  handles per-item retry policy).

## Privacy / LGPD

Not applicable.

## Analytics

| Event                              | When                                | Props                 |
| ---------------------------------- | ----------------------------------- | --------------------- |
| `sync_queue.manual_sync_pressed`   | User tapped                         | `item_count`          |
| `sync_queue.manual_sync_succeeded` | All items drained successfully      | `duration_ms`         |
| `sync_queue.manual_sync_partial`   | Some items completed, others failed | `succeeded`, `failed` |
| `sync_queue.manual_sync_throttled` | Rate limit hit                      | —                     |

## Tests

- **Unit**: button state transitions; tap fires `drainNow`; debounce; rate limit.
- **Integration**: sync flow updates item states correctly.
- **A11y**: state announcements verified.

## Definition of Done

- [ ] ManualSyncButton component
- [ ] State-driven styling
- [ ] In-flight indicator
- [ ] Debounce + rate limit
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context

- Render UI base: `01-render-sync-ui-base.md`
- Offline queue (drainNow): `00-foundation/09-offline-queue.md`
- `CLAUDE.md`
