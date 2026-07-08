# Sync Queue · Item actions (retry, discard, details)

> **Type:** Screen feature · UI + actions
> **Screen:** SCREEN 18 · Sync Queue
> **Effort:** M (1-2 days)
> **Dependencies:** `18-sync-queue/04-queue-list-and-card.md`, `00-foundation/09-offline-queue.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `offline`, `ux`

## Context

Three actions a user can take on a queue item, accessible via the
card's tap target or an inline button for failed items:

- **Tentar de novo (Retry)**: re-queues the item for immediate sync
  attempt (regardless of the orchestrator's backoff schedule).
- **Descartar (Discard)**: permanently removes the item from the
  queue with a confirmation prompt (warns about XP rollback).
- **Detalhes**: opens a sheet with the captured metadata (photo, GPS,
  category, description, the last error if any) and a small
  "Compartilhar log" affordance (sends the failure context to support
  for debugging — opt-in).

## User Story

**As a** Citizen with a failed item,
**I want** clear options to retry or discard with full context,
**In order to** resolve the situation without losing my work accidentally.

## Acceptance Criteria

### Scenario · Open the action sheet

**Given** the user taps a card's body or its overflow trigger
**When** the sheet opens
**Then** it shows three options: Tentar de novo (primary, brand), Descartar (dangerous, slate-warning), Detalhes (neutral)
**And** light haptic feedback fires on open

### Scenario · Retry

**Given** the user picks Tentar de novo
**When** the action runs
**Then** the orchestrator re-queues the item with priority (bypass current backoff)
**And** the card transitions to syncing state (or stays waiting if offline)
**And** a small toast confirms ("Tentando agora…" / "Vai tentar quando voltar a conexão")

### Scenario · Discard with confirmation

**Given** the user picks Descartar
**When** the action runs
**Then** a confirmation modal appears: "Tem certeza? O reporte vai sumir e o XP vai voltar."
**And** confirming removes the item from the queue
**And** the user's XP is rolled back (per `00-foundation/09`'s reservation policy)
**And** a toast confirms ("Descartado")

### Scenario · Discard cancel

**Given** the confirmation is open
**When** the user taps Cancelar
**Then** the sheet closes and the item remains untouched

### Scenario · Details sheet

**Given** the user picks Detalhes
**When** the sheet opens
**Then** it shows: thumbnail, category, address, GPS accuracy, capture timestamp, file size, description (if any), and the last error context (when failed)
**And** an option "Compartilhar log de erro" sends the failure context to support email/Sentry (with explicit consent)

### Scenario · Share error log

**Given** the user opts to share the log
**When** they confirm
**Then** the log is sent via Sentry with a special tag, anonymized of PII
**And** a friendly thank-you message confirms ("Recebemos · vamos olhar")

### Scenario · Discard waiting item (no XP rollback complication)

**Given** the item is in AGUARDANDO state (never attempted)
**When** discarded
**Then** XP is rolled back (since it was reserved on enqueue)
**And** the item is removed

### Scenario · Discard syncing item

**Given** the item is mid-upload
**When** the user attempts to discard
**Then** the orchestrator first cancels the in-flight upload
**And** then the item is removed and XP rolled back

### Scenario · Offline retry

**Given** the device is offline and the user taps Retry
**When** the action runs
**Then** the item is moved to the front of the queue (priority)
**And** when connectivity returns, this item attempts first
**And** the user is informed transparently

### Scenario · Accessibility

**Given** screen reader is on
**When** the sheet opens
**Then** each option is announced with its label and effect ("Discard, removes the report and refunds the XP")
**And** dangerous actions are flagged accessibly

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/SyncQueue/
├── components/
│   ├── ItemActionsSheet.tsx
│   ├── DiscardConfirmModal.tsx
│   └── ItemDetailsSheet.tsx
└── hooks/
    ├── useRetryItem.ts
    ├── useDiscardItem.ts
    └── useShareErrorLog.ts
```

### Component behavior

- `ItemActionsSheet` is the action picker.
- `DiscardConfirmModal` is the safe confirmation.
- `ItemDetailsSheet` shows full metadata and the share-log affordance.
- Each hook delegates to the queue orchestrator and handles UI state (toasts, optimistic updates, XP rollback).

## Backend

Discard and retry are local actions. The error log share goes through Sentry (per `00-foundation/15-error-boundary.md`) with a "user-initiated support log" tag.

## Database

Local WatermelonDB only. The XP rollback updates the gamification store (which syncs to the backend on next connectivity if relevant; XP reservation is a local state in the queue).

## Edge Cases

- **Discard mid-upload**: cancellation is graceful; partial uploads are abandoned.
- **Many failures all at once**: each card has its own retry path; bulk actions are out of MVP scope.
- **Network drops during share log**: queues locally until online (via Sentry SDK retries).

## Privacy / LGPD

- The error log share is opt-in and explicitly explained.
- PII is scrubbed before transmission.
- The user can always discard items without consequence beyond XP rollback.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `sync_queue.actions_opened`        | Sheet opened                               | `item_state`                          |
| `sync_queue.retry_pressed`         | User picked Retry                          | `item_state`                          |
| `sync_queue.discard_confirmed`     | User confirmed discard                     | `item_state`                          |
| `sync_queue.discard_canceled`      | User canceled discard                      | —                                     |
| `sync_queue.details_opened`        | Details sheet opened                       | —                                     |
| `sync_queue.error_log_shared`      | User shared the error log                  | —                                     |

## Tests

- **Unit**: each action invokes the right hook; confirmation modal flow; XP rollback called correctly.
- **Integration**: full retry → success path; discard → item removed + XP refund; share log fires the right event.
- **A11y**: actions labeled; dangerous actions flagged.

## Definition of Done

- [ ] ItemActionsSheet, DiscardConfirmModal, ItemDetailsSheet
- [ ] Hooks for retry, discard, share log
- [ ] Mid-upload cancellation
- [ ] XP rollback on discard
- [ ] Sentry log share path
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Observability (Sentry, support logs): `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Queue list + card: `04-queue-list-and-card.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- Error boundary + Sentry: `00-foundation/15-error-boundary.md`
- `CLAUDE.md`
