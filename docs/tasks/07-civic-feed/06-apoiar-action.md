# Civic Feed · Apoiar action

> **Type:** Screen feature · State + backend
> **Screen:** SCREEN 07 · Civic Feed (also reused on Detail screens 13, 14, and Home's floating ticket card)
> **Effort:** M (1-2 days)
> **Dependencies:** `07-civic-feed/03-feed-item-card.md`, `00-foundation/05-api-client.md`, `00-foundation/09-offline-queue.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `gamification`

## Context

The "Apoiar" (Support) action is the lightest engagement loop in the
product: a single tap that says "I see this problem and I think the
prefecture should fix it sooner". Each support adds visual priority to
the report (more supports = higher in `Mais apoiados` sort, higher AI
priority score in the manager panel).

Each support also grants **+10 XP** to the supporter and is tracked
per-user-per-report (idempotent — supporting twice does nothing extra,
unless the user is toggling the support off).

This task implements the action end-to-end: the optimistic UI on the
card, the backend toggle, the XP credit, and the anti-fraud rate limit.

## User Story

**As a** Citizen,
**I want** to support a neighbor's report with one tap,
**In order to** show solidarity and increase the chances of resolution.

## Acceptance Criteria

### Scenario · First-time support

**Given** the user has not supported this report before
**When** they tap the 🔥 button on the card
**Then** the icon flips to active (filled, brand color)
**And** the local count increments by 1 (optimistic)
**And** light haptic feedback fires
**And** the backend records the support
**And** XP is granted (+10)
**And** if the request fails, the optimistic change rolls back and a toast informs

### Scenario · Toggle off

**Given** the user previously supported this report
**When** they tap the 🔥 button again
**Then** the icon flips to inactive
**And** the count decrements by 1
**And** the backend removes the support record
**And** XP previously granted is **not** revoked (XP is sticky to discourage gaming)

### Scenario · Anti-fraud · rate limit

**Given** the user is rapidly supporting many reports in a short time
**When** the rate exceeds a threshold (e.g., 30 supports per minute)
**Then** the backend returns 429 with a `Retry-After`
**And** the client surfaces a non-blocking banner ("Você apoiou muitos reportes muito rápido · espera um pouco")
**And** the optimistic update for the throttled request rolls back

### Scenario · Anti-fraud · self-support blocked

**Given** the user is the original reporter
**When** they tap 🔥 on their own report
**Then** the backend rejects with a clear code (`cannot_self_support`)
**And** the UI shows a one-time tooltip ("Você já é o autor — outros vão apoiar")
**And** subsequent renders disable the button with a small explanation

### Scenario · Offline support

**Given** the device is offline
**When** the user taps 🔥
**Then** the change is queued via the offline queue
**And** the optimistic UI persists
**And** when connectivity returns, the action syncs (the standard idempotency-key flow)

### Scenario · Multi-tenant scoping

**Given** the user is in city `porto-belo`
**When** they support a report
**Then** the backend rejects if the report's `city_id` doesn't match the JWT's `city_id`

### Scenario · XP credit visible

**Given** a successful support
**When** the action completes
**Then** a small toast or in-app overlay shows "+10 XP" briefly
**And** the user's XP total in the bottom nav profile area updates

### Scenario · Real-time sync

**Given** another user supports the same report at the same time
**When** the WebSocket event arrives (per `06-home-map/08-realtime-pin-updates.md`)
**Then** the local count updates accordingly without conflicting with the user's own optimistic state

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the support button
**Then** the button is announced with its current state ("Apoiar, 34 apoios" / "Apoiando, 35 apoios")
**And** activating it announces the new state

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/services/reports/
├── supportAction.ts           ← shared by Feed, Home, Detail screens
└── hooks/
    └── useSupportToggle.ts
```

The action is centralized so all surfaces (Feed, Home floating card, Detail) reuse the same logic.

### Behavior

- `useSupportToggle(reportId)` exposes `isSupporting`, `count`, and `toggle()`. It uses TanStack Query mutations with optimistic update and rollback.
- The mutation call also updates the React Query cache for the report (so all surfaces showing the same report stay consistent).
- XP granting is reflected in the gamification store (the backend response includes the new XP delta).
- Offline detection routes the action through the offline queue.

### Animation

- The 🔥 icon scales up briefly on tap (0.9 → 1.1 → 1) for tactile feedback.
- Haptics: light selection on tap.

## Backend (FastAPI)

### Endpoints

| Method | Path                           | Purpose                  |
| ------ | ------------------------------ | ------------------------ |
| POST   | `/api/v1/reports/{id}/support` | Add support (idempotent) |
| DELETE | `/api/v1/reports/{id}/support` | Remove support           |

Both:

- Idempotent — POSTing twice has no extra effect.
- Multi-tenant scoped — the report's `city_id` must match the user's.
- Rate limited per user (30/min for supports).
- Reject self-support.
- Update the report's `support_count` atomically.
- Credit XP on first successful support (+10), no revoke on toggle-off.

The response includes the updated `support_count`, the user's `is_supporting` state, and `xp_delta` (0 if no XP awarded — e.g., toggle-off).

## Database (PostgreSQL)

### `report_supports` table

| Column       | Type        | Notes                     |
| ------------ | ----------- | ------------------------- |
| `id`         | UUID PK     |                           |
| `report_id`  | UUID FK     |                           |
| `user_id`    | UUID FK     |                           |
| `city_id`    | UUID FK     | For multi-tenant indexing |
| `created_at` | timestamptz |                           |

A unique constraint on `(report_id, user_id)` prevents duplicate supports.

The `reports.support_count` is maintained via a trigger or via the service layer (atomic updates). A periodic reconciliation job ensures consistency.

### XP awards

The `xp_events` table (defined elsewhere in gamification tasks) records the +10 XP for the support, deduplicated by `(user_id, source_type, source_id)` so toggling on/off doesn't double-credit.

## Edge Cases

- **Duplicate POST race**: idempotency on `(report_id, user_id)` prevents two supports for the same user/report.
- **Report deleted mid-support**: the API returns 404; the client rolls back and removes the report from the UI.
- **User's XP is at level cap**: XP still credits; the level system handles the threshold separately.
- **Anonymous reporter**: supporting works the same way (the report's anonymous flag affects display only, not the action).
- **Trigger order with real-time event**: the WebSocket event arrives separately; the client merges based on counts.

## Privacy / LGPD

- The supporter's identity is stored server-side (for anti-fraud and reputation) but is **not** publicly displayed anywhere — the support count is anonymous to other citizens.
- Self-support detection uses the user's identity but doesn't leak it back.

## Analytics

| Event                      | When                         | Props                       |
| -------------------------- | ---------------------------- | --------------------------- |
| `report.support_added`     | Successful support           | `report_id`, `surface: feed | home | detail` |
| `report.support_removed`   | Successful removal           | `report_id`, `surface`      |
| `report.support_throttled` | 429 returned                 | `surface`                   |
| `report.support_failed`    | Backend error other than 429 | `code`, `surface`           |

## Tests

- **Unit (frontend)**: optimistic update + rollback; cache update across surfaces; offline routes to queue.
- **Unit (backend)**: idempotency; rate limit; self-support rejection; XP awarded once.
- **Integration**: end-to-end support and toggle-off; multi-tenant enforcement.
- **E2E**: tap on a feed card → count increments → XP toast → backend confirms.

## Definition of Done

- [ ] Shared support action service in `apps/city-hero/src/services/reports`
- [ ] `useSupportToggle` hook with optimistic + rollback + cache update
- [ ] Backend endpoints with idempotency, rate limit, self-support reject
- [ ] `report_supports` table + Alembic migration
- [ ] `support_count` maintenance (trigger or service)
- [ ] XP crediting integrated with gamification
- [ ] Offline queue integration
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (multi-tenant, REST, idempotency): `docs/engineering/architecture-patterns.md`
- Security (rate limiting, anti-fraud): `docs/engineering/security-baseline.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- TanStack Query mutations + optimistic updates: https://tanstack.com/query/latest/docs/react/guides/optimistic-updates
- Idempotent HTTP: https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/

### Project context

- Feed item card: `03-feed-item-card.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- Real-time pin updates (cache invalidation pattern): `06-home-map/08-realtime-pin-updates.md`
- `CLAUDE.md`
