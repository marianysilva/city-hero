# Offline Queue · Local persistence + sync orchestration

> **Type:** Foundation · Reliability
> **Screen(s):** Camera (08), Manual Report (09), Confirm Report (10), Sync Queue (18), Home (banner)
> **Effort:** L (3-5 days)
> **Dependencies:** `00-foundation/05-api-client.md`, `00-foundation/07-photo-upload-pipeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `offline`, `reliability`, `foundation`

## Context

Pôrto Belo's coastline has zones with poor mobile signal. Citizens often try
to report problems exactly where signal drops. The offline queue ensures the
app works even with no connectivity: reports are saved locally, photos stored
on-device, and the work syncs automatically when the network returns.

This is also a competitive differentiator — most civic-report apps fail
silently offline.

## User Story

**As a** Citizen in a low-connectivity area,
**I want** to capture and submit a report without internet,
**In order to** not lose the moment when the issue is in front of me.

## Acceptance Criteria

### Scenario · Capture and queue offline

**Given** the device has no internet
**When** the user submits a report (photo + description + GPS)
**Then** the report is persisted to local storage with status `queued`
**And** the photo binary is saved to the device file system, referenced by path
**And** the user sees a "saved · will sync" confirmation
**And** XP is reserved (UI shows it as earned), to be confirmed on sync

### Scenario · Auto-sync on connectivity return

**Given** there are queued items
**When** the device regains connectivity
**Then** the sync orchestrator wakes
**And** processes items in FIFO order
**And** each successful item updates its local status to `synced` and surfaces a notification
**And** the user can navigate to "Sync Queue" to see progress

### Scenario · Retry on transient failure

**Given** an item failed to sync due to a 5xx or network error
**When** the orchestrator retries
**Then** retries follow exponential backoff (e.g., 1s, 4s, 16s, 1min, 5min, max 30min)
**And** the item's `attempt_count` increases
**And** after a hard cap (e.g., 50 attempts over 24h) the item is marked `failed_permanent` and surfaces to the user for manual action

### Scenario · Permanent failure (validation error)

**Given** an item fails with a 4xx (e.g., invalid category)
**When** the orchestrator processes it
**Then** the item is marked `failed_validation` with the server's error code
**And** the user is shown the item with a "Fix and retry" or "Discard" affordance

### Scenario · Banner on Home

**Given** there are items in the queue
**When** the user is on Home
**Then** a persistent banner shows the count of pending items
**And** tapping it navigates to the Sync Queue screen

### Scenario · Conflict on sync

**Given** an item was created locally with a temporary ID
**When** it syncs and the server returns the canonical ID
**Then** the local record updates with the canonical ID
**And** any references (e.g., from comments, supports) are remapped

### Scenario · Queue persists across app kills

**Given** the user kills the app while items are queued
**When** they reopen
**Then** the queued items are still present
**And** sync resumes if connectivity is available

## Frontend (React Native)

### Local storage

```
apps/city-hero/src/services/offline-queue/
├── QueueDatabase.ts         ← WatermelonDB schema and accessors
├── QueueOrchestrator.ts     ← processes queue
├── connectivity.ts          ← NetInfo wrapper
└── retryPolicy.ts           ← backoff calculation
```

The queue is stored in WatermelonDB (SQLite-backed) for the structured records, plus the device's file system for photo binaries (referenced by path from the queue records).

### Queue table (WatermelonDB)

| Field              | Type        | Notes                                                |
|--------------------|-------------|------------------------------------------------------|
| `id`               | string      | Local UUID                                           |
| `kind`             | string      | `report.create`, `comment.create`, `support.toggle`, etc. |
| `payload_json`     | string      | Serialized request payload                           |
| `photo_local_path` | string      | Nullable; for upload jobs                            |
| `status`           | string      | `queued`, `in_flight`, `synced`, `failed_validation`, `failed_permanent` |
| `server_id`        | string      | Set after successful sync                            |
| `last_error_code`  | string      | Server's error code if failed                        |
| `attempt_count`    | int         |                                                      |
| `next_attempt_at`  | timestamp   |                                                      |
| `created_at`       | timestamp   |                                                      |
| `updated_at`       | timestamp   |                                                      |

### Orchestrator behavior

- Runs continuously while the app is in foreground; pauses when in background.
- On connectivity event (`reachable`), drains the queue.
- Processes items in FIFO unless a higher-priority item exists (e.g., a critical report with a flag).
- Calls the appropriate handler per `kind` (a registry mapping kinds to executor functions).
- Updates the item's status atomically.
- Emits events that the UI subscribes to, so the Sync Queue screen and Home banner update live.

### Background sync (optional MVP+)

iOS Background Tasks and Android WorkManager can wake the app to sync without the user opening it. For MVP, foreground-only sync is acceptable (the queue is drained when the user opens the app).

### XP reservation

When an item is queued, the gamification store adds the XP to the visible total but flags it as `pending`. On successful sync, the flag clears. On permanent failure, the XP is rolled back with a small toast explaining the rollback.

## Backend (FastAPI)

The backend doesn't need queue-specific endpoints. The same endpoints used online (create report, post comment, etc.) are reused. The only addition is **idempotency**:

- The client includes an `Idempotency-Key` header (the local UUID).
- The backend deduplicates within a 24h window: the same key returns the same response, even if the original request was already processed.

This handles the case where the client thinks the request failed (e.g., timeout) but the server actually succeeded.

## Database

No new schema for the offline queue (it's local). The idempotency layer adds a small table for cached request/response pairs:

| Column             | Type           | Notes                              |
|--------------------|----------------|-------------------------------------|
| `key`              | varchar(64) PK | The idempotency key                |
| `endpoint`         | varchar(255)   | Path + method                       |
| `response_status`  | int            |                                    |
| `response_body`    | jsonb          | The cached response                  |
| `created_at`       | timestamptz    | TTL: 24h                           |
| `expires_at`       | timestamptz    | Indexed for cleanup                |

A scheduled job purges expired entries.

## Edge Cases

- **Storage full**: the queue rejects new items with a clear error and prompts the user to free space.
- **Photo binary deleted from device** (e.g., user clears storage): the queue item is marked `failed_permanent` with a specific code; the user is informed.
- **Two devices synced same account**: each has its own local queue; the server deduplicates by idempotency key.
- **Clock drift**: backoff timestamps are device-local; not affected by server clock.
- **App force-quit during sync**: the in-flight item reverts to `queued` on next launch (no orphan `in_flight`).
- **Schema migration**: queue items use a `schema_version` field; migrators handle old payloads.

## Privacy / LGPD

- Queued items contain user-generated content (descriptions, photos). They're stored locally with the same encryption guarantees as the OS provides for app sandboxes.
- On logout, the queue is **purged** to avoid sending another user's data after a session change.

## Analytics

| Event                       | When                              | Props                              |
|-----------------------------|-----------------------------------|-------------------------------------|
| `queue.item_enqueued`       | New item added                    | `kind`, `payload_size_bytes`        |
| `queue.item_synced`         | Successful sync                   | `kind`, `attempts`, `duration_ms`   |
| `queue.item_failed`         | Final failure (validation or hard)| `kind`, `code`, `attempts`          |
| `queue.connectivity_changed`| Reachability changed              | `state: online|offline`            |

## Tests

- **Unit**: backoff math; status transitions; FIFO order; idempotency key generation.
- **Integration**: enqueue → simulate connectivity → drain → records reflect server IDs.
- **Resilience**: simulate transient failures and assert backoff respect; simulate hard failures and assert `failed_permanent`.
- **E2E**: capture report offline → toggle airplane mode → verify sync indicator and resulting record.

## Definition of Done

- [ ] WatermelonDB schema and accessors
- [ ] Queue orchestrator with retry/backoff
- [ ] Connectivity-driven drain
- [ ] UI: Sync Queue screen, Home banner, per-item state
- [ ] Backend idempotency layer
- [ ] XP reservation/rollback hooks into gamification store
- [ ] Telemetry events
- [ ] Tests passing per strategy

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references
- WatermelonDB: https://watermelondb.dev/
- @react-native-community/netinfo: https://github.com/react-native-netinfo/react-native-netinfo
- Idempotent HTTP: https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/

### Project context
- Photo upload pipeline: `00-foundation/07-photo-upload-pipeline.md`
- Sync Queue screen: `docs/tasks/18-sync-queue/`
- `CLAUDE.md`
