# Splash · Cold start offline

> **Type:** Screen feature · Resilience\
> **Screen:** SCREEN 01 · Splash / Welcome\
> **Effort:** M (1-2 days)\
> **Dependencies:** `01-splash/02-app-initialization.md`, `00-foundation/09-offline-queue.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `offline`, `resilience`

## Context

The app must launch even with no internet — Pôrto Belo's coastline has dead zones, and a citizen who
opened the app to report a problem in such a zone shouldn't be greeted with "no connection · try
again". This task makes the init sequence offline-aware: skip backend-dependent checks, use cached
state, and surface the offline mode clearly on Home.

## User Story

**As a** Citizen in a low-connectivity area,\
**I want** the app to launch and let me work even without internet,\
**In order to** capture and queue reports until signal returns.

## Acceptance Criteria

### Scenario · Cold start with no connectivity

**Given** the device is offline (airplane mode or no signal)\
**When** the splash mounts\
**Then** the orchestrator detects offline state at the start of the sequence\
**And** skips backend-dependent checks (auth validation, version check, profile fetch, city fetch)\
**And** uses cached user, city, and language from local storage\
**And** signals readiness with an offline init result\
**And** the routing task lands the user on Home with an offline banner active

### Scenario · Cold start with cached session

**Given** the user previously logged in (cached profile + token in secure storage) and is now
offline\
**When** the splash launches\
**Then** the user is treated as authenticated (using the cached profile)\
**And** the access token is used optimistically when the network returns\
**And** if the cached token is later invalid, the API client triggers a graceful logout

### Scenario · Cold start with no cached session, offline

**Given** there's no cached profile (first install or post-logout)\
**When** the splash launches offline\
**Then** the user is routed to Login with an offline banner explaining that login requires
connectivity\
**And** the Login screen disables the submit button until connectivity returns

### Scenario · Connectivity returns mid-session

**Given** the app launched offline and the user is on Home\
**When** connectivity returns\
**Then** the offline banner switches to a "syncing" state\
**And** the queue orchestrator drains pending items\
**And** the version check runs in the background; if `force_update_required`, the app navigates to
the Force Update screen

### Scenario · Cold start with stale cached data

**Given** the cached city or profile is older than a threshold (e.g., 30 days)\
**When** the offline path is taken\
**Then** the app still uses the cache to render Home\
**And** a small "stale data" hint appears in the offline banner\
**And** as soon as the network is back, the backend is consulted to refresh

### Scenario · Pending offline queue items

**Given** the user has items in the offline queue from a previous session\
**When** the splash completes\
**Then** the Home banner reflects the queue depth ("3 reports pending sync")\
**And** the queue tries to drain when connectivity returns

## Frontend (React Native)

### Detection

The orchestrator queries the connectivity helper at the very beginning of the sequence. If the
device reports offline:

- It marks the result as `offline: true`.
- It substitutes the cached profile/city for the corresponding checks (or returns `unknown` for
  version).
- It skips network requests that have no offline meaning.

### Cached data

A small structured local store keeps:

- The latest user profile (UUID, name, language, role, level/XP).
- The active city (ID, name, geo-bounds).
- The last successful version check verdict (with timestamp).
- The user's preferences (offline-friendly: theme, mute settings, etc.).

This cache is updated after every successful authenticated session.

### Offline banner

When the init result includes `offline: true`, Home displays a persistent banner: "Modo offline ·
sincronização pausada" with an icon. Tapping it opens the Sync Queue screen.

### Connectivity transitions

A connectivity listener (per `00-foundation/09-offline-queue.md`) fires on online/offline
transitions. On `online`:

- The orchestrator's backend-dependent checks are run lazily in the background.
- The queue starts draining.
- The banner updates to "Sincronizando · X de Y" and disappears when complete.

On `offline`:

- The banner reappears.
- The queue pauses.

## Backend

Not applicable to this task (it's a client-side resilience concern).

The backend behaviors that matter (idempotency, eventual consistency on sync) are owned by the
offline queue (`00-foundation/09-offline-queue.md`) and the resource endpoints they call.

## Database

Not applicable directly.

## Edge Cases

- **Cache write failed previously**: the user lands on Login (no cached profile) with the offline
  banner; nothing is destroyed.
- **Connectivity flapping** (on/off rapidly): the orchestrator debounces transitions so the banner
  doesn't flash.
- **Time on device drifted significantly**: since the offline path uses cached data, this is fine;
  once online, normal time-aware logic applies.
- **App force-quit while offline with queue items**: the queue persists; on next launch, items are
  still there.
- **First launch is offline** (impossible to set up account): the user sees a clear message and a
  "Try again" CTA tied to connectivity recovery.

## Privacy / LGPD

- Cached profile contains user UUID, name, language, level — minimal PII. Never the email or CPF.
- Cache is wiped on logout to prevent data leakage on a shared device.

## Analytics

| Event                        | When                                   | Props                      |
| ---------------------------- | -------------------------------------- | -------------------------- |
| `init.offline_path_taken`    | Orchestrator detected offline at start | `had_cached_profile: bool` |
| `init.connectivity_returned` | Online transition during the session   | `offline_duration_seconds` |
| `init.stale_cache_used`      | Cached data older than threshold used  | `stale_age_days`           |

## Tests

- **Unit**: the orchestrator skips backend checks when offline; uses cached data; produces an
  offline result.
- **Unit**: connectivity listener correctly debounces flapping.
- **Integration**: simulate offline cold start with cached session — Home renders with banner;
  connectivity returns — banner updates and queue drains.
- **E2E**: airplane-mode cold start with cached login lands on Home; opening Sync Queue shows
  pending items.

## Definition of Done

- [ ] Offline detection at start of init
- [ ] Cached profile/city/version used when offline
- [ ] Routing handles "offline + cached session" → Home; "offline + no session" → Login (gated)
- [ ] Offline banner on Home connected to connectivity state
- [ ] Connectivity transition handlers wired to queue and version check
- [ ] Telemetry per the table above
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references

- @react-native-community/netinfo: https://github.com/react-native-netinfo/react-native-netinfo
- Local key-value cache — `expo-sqlite/kv-store` (SQLite-backed, sync-capable, the SDK's own drop-in
  replacement for `@react-native-async-storage/async-storage`):
  https://docs.expo.dev/develop/user-interface/store-data/

### Project context

- App initialization: `02-app-initialization.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `CLAUDE.md`
