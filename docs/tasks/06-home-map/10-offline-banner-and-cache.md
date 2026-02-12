# Home · Offline banner + cached pins behavior

> **Type:** Screen feature · Resilience
> **Screen:** SCREEN 06 · Home · Hyperlocal Map
> **Effort:** M (1-2 days)
> **Dependencies:** `06-home-map/02-map-integration-with-pins.md`, `00-foundation/09-offline-queue.md`, `01-splash/05-cold-start-offline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `offline`, `resilience`

## Context

When the device is offline, Home should remain useful: cached pins (from
the last successful fetch) stay visible, the offline banner clearly
communicates the state, and any pending offline-queue items are
discoverable from the same banner.

This task ties together:

- The connectivity state (online/offline transitions).
- The cached reports data (TanStack Query persists to disk).
- The offline-queue summary (count of pending items).
- A small banner UI that communicates all of the above.

## User Story

**As a** Citizen who lost connectivity,
**I want** to keep using the map with the data I have,
**In order to** continue exploring or queuing reports until signal returns.

## Acceptance Criteria

### Scenario · Connectivity drops while on Home

**Given** the user is on Home and connectivity drops
**When** the connectivity listener fires
**Then** an offline banner appears below the top bar ("Modo offline · sincronização pausada")
**And** the existing pins remain visible (last cached state)
**And** real-time updates pause
**And** the floating ticket card stays with its last recommendation

### Scenario · Cold start offline (with cached data)

**Given** the user opens the app offline and Home renders
**When** the screen mounts
**Then** the cached pins (from the last successful fetch) render immediately
**And** the offline banner is visible from the start
**And** if the cache is older than a threshold (e.g., 24h), the banner adds "Dados podem estar desatualizados"

### Scenario · Cold start offline (no cached data)

**Given** the user opens the app for the first time offline
**When** the screen mounts
**Then** no pins are visible
**And** the offline banner is visible
**And** a soft empty-state message appears on the map ("Conecte-se pra ver problemas no seu bairro")

### Scenario · Pending offline queue items

**Given** the user has 3 reports in the offline queue
**When** Home renders (online or offline)
**Then** the banner reflects the queue count when there are pending items ("3 reportes aguardando sync")
**And** tapping the banner opens the Sync Queue screen (SCREEN 18)

### Scenario · Connectivity returns

**Given** the user is on Home offline
**When** connectivity is restored
**Then** the banner switches to "Sincronizando…" with a small progress
**And** the queue starts draining
**And** real-time updates reconnect
**And** when sync completes (and there's no queue), the banner hides

### Scenario · Banner takes precedence over discovery card

**Given** the discovery card and the offline banner would both occupy positional priority
**When** the layout reflows
**Then** the offline banner sits below the top bar (always visible)
**And** the discovery card / floating ticket card sit at the bottom (above bottom nav)
**And** they coexist without overlapping

### Scenario · Banner is dismissable (no — informative only)

**Given** the offline banner is visible
**When** the user looks for a "×" affordance
**Then** there is **none** — the banner is informative and reflects real state
**And** it disappears automatically when state changes

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the banner
**Then** it's announced clearly with the offline state and any pending count
**And** if tappable (when there are queue items), the action is announced

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/Home/
└── components/
    └── OfflineBanner.tsx
```

The banner reads from:

- The connectivity hook (online/offline state).
- The offline queue store (count of pending items).
- The reports cache last-update timestamp.

### Behavior

- The banner renders into the home layout's "below-top-overlay" slot.
- It stays visible while offline, and during sync after coming back online.
- It's purely declarative — no manual dismiss.
- It taps to navigate to Sync Queue when there are pending items.

### Cache strategy

TanStack Query is configured to persist its cache to disk (per the API client's React Query setup, which itself is part of foundation 05 hygiene). The home reports query reads from cache first, then refetches from network when online.

### Connectivity listener

A small reusable hook (`useConnectivity`) wraps the platform's connectivity API and returns the state. Used here and in other screens.

## Backend

Not applicable — the backend doesn't know about device connectivity.

The offline queue (foundation 09) handles the actual sync operations.

## Database

Not applicable.

## Edge Cases

- **Brief connectivity flap (1-2s offline)**: debounce so the banner doesn't flash.
- **Both offline AND queue items**: the banner combines the messages cleanly.
- **Cache write failed**: behave as "no cached data" — show empty state.
- **Cache contains pins from a different city** (rare; user switched cities): scope cache by `city_id` so the wrong city's pins never appear.
- **Banner overlaps the map and obscures pins**: keep the banner thin (≤32dp).

## Privacy / LGPD

The cached reports include anonymized photo URLs. The cache lives within the app sandbox, protected by OS-level encryption. On logout, the cache is cleared.

## Analytics

| Event                              | When                                       | Props                                  |
|------------------------------------|--------------------------------------------|-----------------------------------------|
| `home.offline_banner_shown`        | Banner becomes visible                     | `had_cache: bool`, `queue_count: int`  |
| `home.offline_banner_tapped`       | User taps to open sync queue               | `queue_count`                           |
| `home.connectivity_returned`       | Online again from offline                  | `offline_duration_seconds`             |

## Tests

- **Unit**: banner visible in offline state; tapping opens sync queue when queue has items.
- **Integration**: cold-start offline with cached pins; warm-start losing connectivity; reconnect drains queue.
- **E2E**: airplane-mode toggle simulates the flow on a real device.

## Definition of Done

- [ ] OfflineBanner component
- [ ] Connectivity hook integrated
- [ ] Queue count integrated
- [ ] Cache persistence verified
- [ ] Empty-state UX when no cache available offline
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references
- @react-native-community/netinfo: https://github.com/react-native-netinfo/react-native-netinfo
- TanStack Query persistence: https://tanstack.com/query/latest/docs/react/plugins/persistQueryClient

### Project context
- Offline queue: `00-foundation/09-offline-queue.md`
- Cold-start offline: `01-splash/05-cold-start-offline.md`
- Map integration: `02-map-integration-with-pins.md`
- Sync Queue screen: `docs/tasks/18-sync-queue/`
- `CLAUDE.md`
