# Home · Pull-to-refresh + manual refresh

> **Type:** Screen feature · UX
> **Screen:** SCREEN 06 · Home · Hyperlocal Map
> **Effort:** S (≤1 day)
> **Dependencies:** `06-home-map/02-map-integration-with-pins.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

Real-time pin updates (task 08) cover most freshness needs, but users
sometimes want **manual control**: pull down at the top of the screen to
force a refresh of the visible bbox. This is also a fallback when
real-time fails silently (the user has agency to "make sure I'm seeing
the latest").

The interaction is the standard mobile pull-to-refresh pattern. Visually,
it shows a small spinner/progress at the top, fires the refetch, and
clears when complete.

## User Story

**As a** Citizen who wants the latest data,
**I want** to pull down to refresh,
**In order to** force-update without leaving the screen.

## Acceptance Criteria

### Scenario · Pull-to-refresh gesture

**Given** the user is at the top of the Home screen
**When** they pull down past the threshold
**Then** a refresh indicator appears at the top
**And** the indicator stays visible while the refresh is in progress
**And** the reports query refetches for the current bbox + filters
**And** when the refresh completes, the indicator hides

### Scenario · Refresh succeeds

**Given** the refresh ran
**When** the response arrives
**Then** pins update incrementally (added/removed; unchanged stay)
**And** the floating ticket card recommendation refreshes
**And** the discovery card and badges remain unchanged (they have their own refresh schedules)

### Scenario · Refresh fails (offline)

**Given** the user is offline
**When** they pull-to-refresh
**Then** the indicator briefly shows
**And** a non-blocking toast appears ("Sem conexão · veja em modo offline")
**And** the existing pins remain visible

### Scenario · Refresh fails (server error)

**Given** the server returns 5xx
**When** the response arrives
**Then** the indicator hides
**And** a non-blocking toast appears ("Não foi possível atualizar · tente em alguns segundos")
**And** the existing pins remain visible

### Scenario · Manual refresh button (a11y)

**Given** screen reader is on (or the user prefers gesture-free interaction)
**When** they navigate to a small "Atualizar" button (could be in the recenter area or as a hidden ARIA control)
**Then** they can trigger the same refresh as the gesture
**And** the screen reader announces the result ("Atualizado")

### Scenario · Throttling

**Given** the user pulls-to-refresh very rapidly multiple times
**When** the system processes
**Then** subsequent refreshes within a short window (e.g., 5s) are coalesced (no duplicate requests)
**And** the indicator stays visible until the in-flight refresh completes

### Scenario · Real-time was active

**Given** real-time updates were already keeping pins fresh
**When** the user pulls to refresh
**Then** the manual refresh still runs (gives the user confidence)
**And** typically returns the same data
**And** any pins not yet pushed via WebSocket arrive in this batch

### Scenario · While other content is loading

**Given** the floating ticket card is fetching its recommendation
**When** the user pulls to refresh
**Then** both can run in parallel without conflict
**And** the indicator only reflects the main reports refresh

## Frontend (React Native)

### Where it lives

The home screen uses a top-level scroll/refresh container. Since the map fills the area, the pull-to-refresh gesture lives on a small invisible area at the top (above the top bar), or on the map itself with a vertical-pull gesture handler.

A simpler alternative: include a small "Atualizar" affordance somewhere accessible (next to the recenter button or as a visual cue at the top).

```
apps/city-hero/src/screens/Home/
└── components/
    └── PullToRefreshOverlay.tsx
```

### Behavior

- The refresh gesture invokes `refetch()` on the reports query (TanStack Query) for the current `(cityId, bbox, filters)`.
- The indicator's visual state is controlled by the query's `isFetching` flag.
- The gesture has standard pull-distance and resistance.
- Throttling uses TanStack Query's stale-time logic naturally.

### Considerations on a map

Pull-to-refresh on a map is tricky because vertical pull conflicts with map pan. A small dedicated gesture area near the top bar avoids the conflict.

## Backend

The reports endpoint (task 02) is what the refresh hits. No new endpoint.

## Database

No changes.

## Edge Cases

- **Map gesture conflict**: ensure the pull-to-refresh gesture is only active in the dedicated area or above the map, never in conflict with map pan.
- **Slow network**: the refresh shows the indicator until the response arrives or the request times out (e.g., 10s).
- **User pulls during the refetch**: ignore the second pull; show the existing indicator.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                          | When                              | Props                  |
|--------------------------------|-----------------------------------|------------------------|
| `home.pull_to_refresh`         | User triggers a refresh           | `source: gesture|button` |
| `home.refresh_succeeded`       | Refetch returned successfully     | `duration_ms`          |
| `home.refresh_failed`          | Refetch errored                   | `code`                 |

## Tests

- **Unit**: indicator visible during fetch; refresh refetches the right query.
- **Integration**: gesture triggers the refetch; throttling works.
- **A11y**: alternative button is announced and triggers the same action.

## Definition of Done

- [ ] Pull-to-refresh gesture or affordance integrated
- [ ] Indicator state from the query
- [ ] Toast on offline/error
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native RefreshControl: https://reactnative.dev/docs/refreshcontrol
- React Native Gesture Handler: https://docs.swmansion.com/react-native-gesture-handler/

### Project context
- Map integration: `02-map-integration-with-pins.md`
- Real-time updates: `08-realtime-pin-updates.md`
- `CLAUDE.md`
