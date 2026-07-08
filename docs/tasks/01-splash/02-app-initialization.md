# Splash · App initialization sequence

> **Type:** Screen feature · Orchestration
> **Screen:** SCREEN 01 · Splash / Welcome
> **Effort:** M (1-2 days)
> **Dependencies:** `00-foundation/05-api-client.md`, `00-foundation/06-auth-system.md`, `00-foundation/12-deep-link-handler.md`, `00-foundation/15-error-boundary.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `orchestration`

## Context

The Splash screen runs an **initialization sequence** in parallel while the
visual is on screen: validate the auth token, fetch the user profile, load
the active city, check the minimum-supported app version, and parse any
incoming deep link. The result of the sequence determines where the app
navigates next (handled by task `03-routing-decision`).

This task owns only the orchestration. Each individual check is implemented
by its respective foundation: auth (06), API client (05), deep links (12).

## User Story

**As a** Citizen opening the app,
**I want** the app to bootstrap quickly and quietly,
**In order to** land on the right screen without manual setup.

## Acceptance Criteria

### Scenario · Standard cold start (authenticated)

**Given** the user has a valid access token in secure storage
**When** the splash mounts
**Then** the app initializes in parallel: auth validation, user profile fetch, active-city load, version check, deep-link parse
**And** the sequence completes within typical conditions (≤2 seconds on a good network)
**And** the splash signals readiness with the resolved init state

### Scenario · Standard cold start (unauthenticated)

**Given** there's no token in secure storage
**When** the splash mounts
**Then** the auth validation is skipped
**And** version check + deep-link parse still run
**And** the sequence completes faster (no auth round-trip)

### Scenario · Token refresh during init

**Given** the access token is expired but the refresh token is valid
**When** the auth validation runs
**Then** the API client transparently refreshes the token (per foundation 05)
**And** the user is treated as authenticated for the rest of the sequence

### Scenario · Refresh failure

**Given** the refresh token is also expired or revoked
**When** the auth validation runs
**Then** the auth state is cleared
**And** the user is treated as unauthenticated for the rest of the sequence
**And** the splash signals readiness without an error

### Scenario · Version check failure (network issue)

**Given** the version-check endpoint is unreachable
**When** the check times out
**Then** the sequence proceeds with `version_status: unknown`
**And** the routing task treats unknown as "allow continue"
**And** the failure is logged to telemetry (not surfaced to the user)

### Scenario · Deep link arrives during init

**Given** a deep link triggered the cold start
**When** the deep-link handler parses the URL
**Then** the parsed intent is buffered
**And** the splash includes the intent in the init result
**And** the routing task uses the intent for navigation

### Scenario · Backend completely unreachable

**Given** the device has connectivity but the backend is down
**When** the sequence runs
**Then** all backend-dependent checks fail
**And** the result includes `init_partial: true` with reasons per check
**And** the routing task can still navigate (uses cached user profile if any)

### Scenario · Offline cold start

**Given** the device has no internet
**When** the sequence runs
**Then** the offline-aware path is taken (see task `05-cold-start-offline`)
**And** cached user/city data is used
**And** version check and online-only steps are skipped

## Frontend (React Native)

### Where the orchestrator lives

```
apps/city-hero/src/services/init/
├── orchestrator.ts        ← runs the parallel sequence
├── checks/
│   ├── auth.ts            ← validate token + fetch profile
│   ├── version.ts         ← check minimum supported version
│   ├── city.ts            ← load active city by ID
│   └── deepLink.ts        ← parse the cold-start URL if any
└── initResult.ts          ← typed result shape
```

### Behavior

- The orchestrator runs all checks in parallel using a coordinated promise.
- Each check has its own timeout (e.g., 3s) and returns a typed result indicating success, partial, or failed states with a reason.
- The orchestrator aggregates results into a single typed object: authenticated user (or null), active city (or null), version status (`allowed`, `force_update`, `unknown`), pending deep-link intent (or null), and any errors collected.
- When the orchestrator finishes (or every check has resolved/timed out), it calls the splash screen's `onReady` callback with the result.
- The orchestrator is testable in isolation by injecting fakes for each check.

### Initialization timeline

| Time      | Event                                                     |
| --------- | --------------------------------------------------------- |
| 0ms       | Splash mounts; orchestrator starts all checks in parallel |
| ~200ms–2s | Checks complete in their natural order                    |
| max 5s    | Orchestrator surfaces a "loading" indicator on the splash |
| max 10s   | Hard timeout — partial result returned                    |

### Caching for warm starts

Profile and city data are cached in local storage so subsequent cold starts can render content faster while validation runs in the background. Stale cache is acceptable on cold start as long as it gets refreshed asynchronously.

## Backend (FastAPI)

### Endpoints used

| Endpoint                    | Used for                                 |
| --------------------------- | ---------------------------------------- |
| `GET /api/v1/auth/me`       | Validate token + fetch user profile      |
| `GET /api/v1/version/check` | Compare `X-App-Version` to min supported |
| `GET /api/v1/cities/{id}`   | Load the active city                     |

The version-check endpoint accepts the platform and version via headers and returns an enum: `allowed`, `force_update_required`, or `update_recommended`.

## Database

Not applicable directly.

## Edge Cases

- **One check timing out**: doesn't block the others; the orchestrator returns when all settle (within the hard timeout).
- **Two parallel 401s** (auth + city, both authenticated calls): single-flight refresh in the API client deduplicates.
- **Deep link arrives mid-init**: parsed and added to the result without blocking other checks.
- **App in background during init**: pause the orchestrator; resume on foreground.
- **Sequence finished but splash min duration not yet met**: routing waits for the min duration (per task `01-render-splash-ui`).
- **Crash during init**: caught by the global error boundary; user sees a "tap to retry" fallback.

## Privacy / LGPD

- Token refresh logs only success/failure metadata; never the token itself.
- The user UUID is the only identifier passed downstream; no email/CPF logged.

## Analytics

| Event                     | When                       | Props                                 |
| ------------------------- | -------------------------- | ------------------------------------- |
| `init.sequence_started`   | Orchestrator starts        | `cold_start: bool`, `had_token: bool` |
| `init.check_completed`    | A specific check completes | `check`, `status`, `duration_ms`      |
| `init.sequence_completed` | All checks settled         | `total_duration_ms`, `partial: bool`  |
| `init.timeout`            | Hard timeout fired         | `pending_checks`                      |

## Tests

- **Unit (per check)**: each check returns the right outcome under success / timeout / network error / 401 / 403 conditions.
- **Unit (orchestrator)**: parallel composition; aggregates correctly; respects per-check timeout and hard timeout; injectable fakes for each check.
- **Integration**: cold start end-to-end with the API client + a mocked backend; token refresh path; deep-link integration.
- **E2E**: cold start with a valid session lands the user on Home; cold start with an expired session lands on Login.

## Definition of Done

- [ ] Orchestrator with parallel composition
- [ ] Individual check modules (auth, version, city, deep link)
- [ ] Typed result shape consumed by the routing task
- [ ] Per-check and global timeouts
- [ ] Cache for warm-start fast path
- [ ] Telemetry for each check
- [ ] Tests passing per strategy

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native AsyncStorage / SecureStore: https://docs.expo.dev/versions/latest/sdk/async-storage/
- Promise composition (Promise.allSettled): https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled

### Project context

- Splash render: `01-render-splash-ui.md`
- Routing decision: `03-routing-decision.md`
- API client: `00-foundation/05-api-client.md`
- Auth system: `00-foundation/06-auth-system.md`
- Deep links: `00-foundation/12-deep-link-handler.md`
- `CLAUDE.md`
