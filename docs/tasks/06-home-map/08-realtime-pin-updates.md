# Home · Real-time pin updates

> **Type:** Screen feature · Real-time\
> **Screen:** SCREEN 06 · Home · Hyperlocal Map\
> **Effort:** M (1-2 days)\
> **Dependencies:** `06-home-map/02-map-integration-with-pins.md`, `00-foundation/05-api-client.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `screen`, `real-time`

## Context

Map pins should reflect new reports and status changes within seconds — not on the next manual
refresh. This task wires a WebSocket subscription keyed on `(city_id, bbox)` so the user sees their
neighbors' reports appearing in near-real-time, plus support count updates and status transitions on
existing pins.

A polling fallback (with a longer interval) is included for environments where WebSocket isn't
viable (some corporate networks, restrictive proxies).

## User Story

**As a** Citizen on Home,\
**I want** new reports and updates to appear automatically,\
**In order to** feel the city is alive without me refreshing manually.

## Acceptance Criteria

### Scenario · WebSocket connected and bbox active

**Given** the user is on Home with a stable bbox\
**When** a new report is created in the bbox by another user\
**Then** within ~3 seconds, a new pin appears on the map\
**And** if the user has the floating ticket card visible, the recommendation may refresh

### Scenario · Existing pin status change

**Given** a visible pin's status changes (open → in_progress, etc.)\
**When** the change arrives\
**Then** the pin updates its visual state without re-rendering all pins\
**And** support-count changes update incrementally (no flicker)

### Scenario · Bbox change resubscribes

**Given** the user pans the map\
**When** the new bbox stabilizes\
**Then** the WebSocket subscription updates to the new bbox\
**And** the previous bbox's stream is unsubscribed

### Scenario · Disconnection

**Given** the WebSocket disconnects (network blip, server restart)\
**When** the client detects the disconnection\
**Then** it attempts reconnection with exponential backoff\
**And** while disconnected, polling fallback every 30s keeps pins approximately up-to-date

### Scenario · App in background

**Given** the user backgrounds the app\
**When** the screen pauses\
**Then** the WebSocket disconnects gracefully\
**And** the polling fallback also pauses\
**And** when the app returns to foreground, both reconnect / resume

### Scenario · Polling fallback only

**Given** WebSocket is unavailable (firewall, etc.)\
**When** the screen detects the failure pattern\
**Then** the client switches to polling every ~30s\
**And** UX still feels responsive enough (much better than no updates)

### Scenario · Throttling on dense bbox

**Given** the bbox is large and many updates arrive quickly\
**When** the rate exceeds a threshold\
**Then** updates are batched (e.g., one batch every 1s)\
**And** pins are updated once per batch to avoid render storms

### Scenario · Multi-tenant scoping enforced

**Given** the user is in city `porto-belo`\
**When** the WebSocket subscription is made\
**Then** only events for that city are received\
**And** an event from another city is rejected by the server

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Home/
├── hooks/
│   ├── useReportsRealtime.ts
│   └── useReportsPolling.ts
└── services/
    └── reportsSocket.ts
```

### Behavior

- `reportsSocket` is a thin wrapper around the WebSocket library, exposing `subscribe(filter)` and
  `unsubscribe(handle)`.
- `useReportsRealtime` is a hook that opens a subscription for the current `(cityId, bbox, filters)`
  and emits events: `report_added`, `report_updated`, `report_removed`. It hands events to the React
  Query cache via `setQueryData` so the map updates incrementally.
- `useReportsPolling` is the fallback. It calls the same reports endpoint every ~30s (when in
  foreground) and merges results into the cache.
- A connection-state machine decides which path is active (WebSocket primary, polling fallback).

### Event handling rules

- `report_added`: insert pin if it matches current filters and is in bbox.
- `report_updated`: replace the existing pin's data; visual transitions for status/support changes.
- `report_removed`: remove the pin (reports can be merged or deleted by moderation).

## Backend (FastAPI + WebSocket)

### Endpoints

| Method | Path                                         | Purpose                              |
| ------ | -------------------------------------------- | ------------------------------------ |
| WS     | `/api/v1/ws/reports?bbox=&filters=&city_id=` | Subscribe to report updates in scope |

The WebSocket connection requires authentication (token via query param or initial message). The
server validates the user's `city_id` claim matches the query.

### Event format

The server pushes JSON events: `{ type, report }` where `type` is `added | updated | removed` and
`report` includes the same shape as the REST response. Each event includes a monotonic `seq` so
clients can detect missed events.

### Backend implementation

A pub/sub layer (Redis Pub/Sub or NATS) propagates report changes from the database write path to
all connected WebSocket clients filtered by `(city_id, bbox)`. For efficiency, the server may use
spatial indexing on the in-memory subscription set to filter quickly.

### Polling endpoint

The same `GET /api/v1/reports?bbox=&since=` endpoint from task 02 supports the `since` parameter,
returning only reports changed since the timestamp. The polling fallback uses this.

## Database

No new schema. The `reports` table's `version` column (from task 02) and `last_activity_at` enable
incremental queries.

## Edge Cases

- **WebSocket connects but no events arrive for a while**: heartbeat pings detect dead connections;
  if no event in N minutes, force reconnect.
- **Sequence gap detected** (missed events): the client refetches the full bbox once to resync.
- **Updates arrive for a removed pin**: ignored gracefully.
- **High update rate from a flash crowd** (e.g., a major incident): server-side batching/coalescing
  can throttle.
- **Token expiry mid-session**: the WebSocket layer triggers token refresh and reconnects with the
  new token.

## Privacy / LGPD

- The WebSocket payloads contain the same shape as REST: anonymized photo URLs, no PII beyond what's
  needed.
- Connections are scoped to the user's city; no cross-tenant leakage.

## Analytics

| Event                          | When                                              | Props          |
| ------------------------------ | ------------------------------------------------- | -------------- |
| `home.realtime_connected`      | WebSocket connection established                  | `transport: ws | polling` |
| `home.realtime_reconnected`    | After backoff, reconnected                        | `attempts`     |
| `home.realtime_event_received` | Event delivered (sampled — too verbose otherwise) | `type`         |
| `home.realtime_disconnected`   | Disconnect detected                               | `reason`       |

## Tests

- **Unit (frontend)**: subscription lifecycle (subscribe/unsubscribe on bbox change); cache updates
  correctly per event type.
- **Unit (backend)**: pub/sub delivery; spatial filtering of subscriptions; auth enforcement.
- **Integration**: simulate added/updated/removed events; assert pins reflect.
- **Resilience**: forced disconnect → reconnect; polling fallback when WS rejected.

## Definition of Done

- [ ] WebSocket service module
- [ ] Real-time and polling hooks
- [ ] Backend WebSocket endpoint with auth + spatial filter
- [ ] Pub/sub propagation from DB writes
- [ ] Polling fallback with `since`-based incremental fetch
- [ ] Reconnect logic with backoff
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Observability: `docs/engineering/observability.md`
- Security (auth on WS, scoping): `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- FastAPI WebSockets: https://fastapi.tiangolo.com/advanced/websockets/
- React Native WebSocket: https://reactnative.dev/docs/network#websocket-support
- Redis Pub/Sub: https://redis.io/docs/manual/pubsub/

### Project context

- Map integration: `02-map-integration-with-pins.md`
- API client: `00-foundation/05-api-client.md`
- `CLAUDE.md`
