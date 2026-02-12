# Civic Feed · Pull-to-refresh + real-time updates

> **Type:** Screen feature · Real-time + UX
> **Screen:** SCREEN 07 · Civic Feed
> **Effort:** M (1-2 days)
> **Dependencies:** `07-civic-feed/02-feed-list-and-pagination.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `real-time`, `ux`

## Context

Two ways to keep the feed fresh:

- **Pull-to-refresh** for explicit user control — the standard mobile
  gesture clears the cursor, refetches the first page, and updates the
  list while preserving scroll position.
- **Real-time updates** via WebSocket so new reports near the user
  appear automatically (with a small "Novos reportes ↑" indicator at
  the top so the user can choose to scroll to them rather than having
  the list shift on its own).

Together they make the feed feel "alive" without disturbing reading.

## User Story

**As a** Citizen,
**I want** the feed to stay fresh without me thinking about it,
**In order to** trust I'm seeing what just happened.

## Acceptance Criteria

### Scenario · Pull-to-refresh

**Given** the user is at the top of the feed
**When** they pull down past the threshold
**Then** the standard refresh indicator appears
**And** the first page is refetched with the current filters
**And** items are merged: existing items keep their support state, new items appear on top
**And** when the refresh completes, the indicator hides

### Scenario · Pull-to-refresh while real-time is connected

**Given** WebSocket already pushed new items
**When** the user pulls to refresh
**Then** any pending "Novos reportes" indicator clears
**And** the list reflects the latest server state

### Scenario · WebSocket new item

**Given** another user creates a report in the user's radius and city
**When** the WebSocket pushes the event
**Then** the local cache adds the item at the top of the list
**And** instead of forcing a list shift, a small badge "↑ 3 novos reportes" appears at the top
**And** tapping the badge scrolls to top and clears the badge

### Scenario · WebSocket support count changes

**Given** an existing visible item gets a new support
**When** the event arrives
**Then** the support count updates inline (no list reorder unless sort=most_supported triggers a swap)
**And** the change animates briefly to draw attention

### Scenario · WebSocket status change

**Given** a visible item's status changes (e.g., open → in_progress)
**When** the event arrives
**Then** the status badge updates inline
**And** if the user is filtering for a specific status that excludes the item, it fades out

### Scenario · Disconnection and reconnect

**Given** the WebSocket disconnects
**When** the client detects
**Then** it reconnects with exponential backoff
**And** while disconnected, polling fallback every ~30s keeps the feed approximately fresh

### Scenario · Background to foreground

**Given** the user backgrounds and returns
**When** the screen resumes
**Then** the WebSocket reconnects (or polling resumes)
**And** the first event after returning is a one-shot refetch to catch up

### Scenario · Filter change resets subscription

**Given** the user changes radius or sort
**When** the filter applies
**Then** the WebSocket subscription updates to the new filter
**And** the "novos reportes" badge clears

### Scenario · Throttling on dense bursts

**Given** many new reports arrive in a very short window
**When** the WebSocket pushes them
**Then** updates batch (~1s) so the UI doesn't render-storm
**And** the "↑ N novos reportes" indicator reflects the cumulative count

### Scenario · Accessibility

**Given** screen reader is on
**When** the "Novos reportes" indicator appears
**Then** it's announced as a live region with a clear action label

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/CivicFeed/
├── hooks/
│   ├── useFeedRealtime.ts
│   └── useFeedPolling.ts
└── components/
    ├── NewItemsIndicator.tsx
    └── RefreshControl.tsx
```

### Behavior

- The pull-to-refresh integrates with the infinite query: pulling resets the cursor and refetches page 1.
- `useFeedRealtime` subscribes to the feed's WebSocket channel (per `00-foundation/05-api-client.md`'s real-time pattern). On events, it updates the React Query cache surgically (`setQueryData`) instead of refetching.
- `useFeedPolling` is the fallback when WebSocket isn't viable: every ~30s it calls the feed endpoint with the `since` cursor to fetch only changes.
- A small store tracks "pending new items count" (incremented as WS events for new reports arrive); shown by the indicator. Tapping the indicator scrolls to top and clears.

### Performance

- Updates batch over a short window to prevent render storms.
- The list's stable item key (the report ID) ensures React's reconciliation doesn't re-render unchanged cards.

## Backend (FastAPI + WebSocket)

### Endpoints

| Method | Path                                                                              | Purpose                                  |
|--------|-----------------------------------------------------------------------------------|------------------------------------------|
| WS     | `/api/v1/ws/feed?city_id=&radius_km=&sort=&user_lat=&user_lng=`                   | Subscribe to feed events for the scope  |
| GET    | `/api/v1/feed?...&since=...`                                                       | Polling fallback returning changes      |

The WebSocket connection requires authentication. The server pushes events: `{ type, report }` where `type ∈ added | updated | removed`. Server-side filtering ensures only events matching the subscription's filters are pushed.

The `since` parameter on the REST endpoint returns reports created or updated after that timestamp.

### Backend implementation

A pub/sub layer (Redis Pub/Sub or NATS) propagates events from DB writes to all connected WebSocket clients. The server's spatial-filter logic ensures events only go to subscribers whose scope (city + radius + user location) covers the event's location.

## Database

No new schema. The `reports.version` and `reports.last_activity_at` fields enable incremental queries.

## Edge Cases

- **Sequence gap detected** (missed events): the client refetches the first page once.
- **User is at the bottom of the list when new items arrive**: the indicator appears at the top; the user can choose to scroll up or keep reading.
- **Token expires mid-session**: the WS layer triggers refresh; reconnect after.
- **Server overload**: gracefully degrade to polling; never block UX.

## Privacy / LGPD

WS payloads contain the same shape as REST: anonymized photo URLs only; no PII beyond the public-safe view.

## Analytics

| Event                              | When                                       | Props                                  |
|------------------------------------|--------------------------------------------|-----------------------------------------|
| `feed.realtime_connected`          | WS connection established                  | `transport: ws|polling`                |
| `feed.new_items_indicator_shown`   | Badge appears                              | `pending_count`                         |
| `feed.new_items_indicator_tapped`  | User taps to see new items                 | `pending_count`                         |
| `feed.pull_to_refresh`             | User triggers a manual refresh             | `pending_at_time: int`                 |

## Tests

- **Unit (frontend)**: subscription lifecycle on filter change; cache updates per event type; pending counter increments and clears.
- **Unit (backend)**: spatial filtering of subscriptions; auth enforcement; `since` query incremental behavior.
- **Integration**: simulate add/update/remove events; verify the list reflects.
- **Resilience**: forced disconnect → reconnect; polling fallback when WS rejected.

## Definition of Done

- [ ] WS subscription wired to the feed list cache
- [ ] Polling fallback
- [ ] "Novos reportes" indicator
- [ ] Pull-to-refresh integrated with infinite query
- [ ] Reconnect with backoff
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
- React Native RefreshControl: https://reactnative.dev/docs/refreshcontrol
- React Native WebSocket: https://reactnative.dev/docs/network#websocket-support

### Project context
- Feed list and pagination: `02-feed-list-and-pagination.md`
- Real-time pattern reference: `06-home-map/08-realtime-pin-updates.md`
- API client: `00-foundation/05-api-client.md`
- `CLAUDE.md`
