# Error Boundary + Crash Reporting · Sentry integration

> **Type:** Foundation · Observability
> **Screen(s):** All
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/01-monorepo-setup.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `web`, `backend`, `observability`, `foundation`

## Context

Catch and report errors at every layer: React error boundaries (mobile + web),
unhandled promise rejections, native crashes (iOS/Android), and backend
exceptions. Centralize in Sentry so a single dashboard shows the health of the
product across platforms.

Without it, errors ship silently and we only learn about them when users
complain.

## User Story

**As a** Developer / On-call,
**I want** automatic error reporting from all platforms with stack traces and breadcrumbs,
**In order to** triage and fix bugs without needing user reproduction steps.

**As a** Citizen,
**I want** the app to recover gracefully from a render error,
**In order to** continue using it instead of seeing a blank screen.

## Acceptance Criteria

### Scenario · React render error caught

**Given** a screen throws during render
**When** the error reaches the error boundary
**Then** the boundary shows a fallback UI ("Algo deu errado · Recarregar")
**And** the error is sent to Sentry with full stack trace and breadcrumbs
**And** the user can tap "Recarregar" to remount the screen

### Scenario · Unhandled promise rejection

**Given** an async function throws and the promise isn't caught
**When** the global handler intercepts
**Then** the error is sent to Sentry tagged as an unhandled rejection
**And** the user sees a non-blocking toast on mobile ("Algo deu errado · tente novamente")
**And** the app does not crash

### Scenario · Native crash (mobile)

**Given** a native module crashes
**When** the app restarts after the crash
**Then** Sentry's native SDK uploads the crash report on next launch
**And** the on-call is paged if the crash rate exceeds the configured threshold

### Scenario · Backend exception

**Given** a FastAPI handler raises an unhandled exception
**When** the global exception handler catches it
**Then** Sentry receives the exception with request context (URL, headers, user ID, trace ID)
**And** the response is `500` with body `{ code: "internal_error", traceId: "..." }`
**And** PII is scrubbed from the report

### Scenario · PII scrubbing

**Given** an error contains email, CPF, or password in the breadcrumb trail
**When** Sentry's pre-send hook runs
**Then** these fields are masked or removed
**And** the denylist explicitly covers `password`, `password_hash`, `cpf`, `cpf_hash`, `refresh_token`, `access_token`

### Scenario · Source maps

**Given** a production error contains minified frames
**When** the Sentry web dashboard loads the issue
**Then** source maps resolve frames to original TypeScript code
**And** developers can see the exact line that errored

### Scenario · Release tracking

**Given** a new app version is deployed
**When** errors arrive
**Then** they're tagged with the release identifier (`cityhero@<version>+<build>`)
**And** the dashboard shows error rate per release

## Frontend (React Native + Web)

### React error boundary component

```
packages/design_system/src/components/ErrorBoundary/
├── ErrorBoundary.tsx
├── ErrorFallback.tsx
└── ErrorBoundary.test.tsx
```

The boundary wraps the app's root tree (or per-route subtrees for finer-grained recovery). When it catches an error, it:

- Renders the fallback UI in place of the broken subtree.
- Sends the error to Sentry with the React component stack and the latest breadcrumbs.
- Exposes a "retry" handler that remounts the subtree.
- In dev, the fallback shows the full stack trace; in prod, it shows only a trace ID for support reference.

### Sentry initialization

Sentry is initialized at app startup with the DSN from environment, the current environment label (`dev`/`staging`/`prod`), the release identifier, a moderate sampling rate for performance traces, and a pre-send hook that scrubs PII fields by key name.

The same approach applies to the web (Next.js + `@sentry/nextjs`) with separate client and server configurations.

### Native crash reporting

iOS and Android crashes are auto-captured by Sentry's native SDKs and uploaded on the next app launch.

## Backend (FastAPI)

Sentry's FastAPI integration captures unhandled exceptions and attaches the request context. A global exception handler:

- Logs the exception with the trace ID.
- Returns a JSON response following the standard error shape (see `architecture-patterns.md`).
- Triggers the same PII scrubbing as the frontend.

## Database

Not applicable.

## Edge Cases

- **Sentry DSN missing in dev**: the SDK no-ops gracefully.
- **Network down when error fires**: the SDK queues events and retries when online.
- **Error inside the error boundary itself**: a higher-level boundary one layer up catches it.
- **Sentry quota exceeded**: events drop silently — the app continues normally.
- **Sensitive prop in component state**: the pre-send hook scrubs by key name; manual review covers integration-specific fields.

## Privacy / LGPD

- PII scrubbing is mandatory (see `security-baseline.md`).
- The user identifier sent to Sentry is the user's UUID — never email or CPF.
- Sentry retention is configured to 30 days for errors and 7 days for performance traces.
- Mobile: do not initialize Sentry for users who have not consented (toggle in Settings, default opt-in but reversible).

## Analytics

| Event                       | When                           | Props                  |
| --------------------------- | ------------------------------ | ---------------------- |
| `error.boundary_caught`     | React boundary catches         | `screen`, `error_name` |
| `error.unhandled_rejection` | Global handler                 | `error_name`           |
| `error.fallback_retry`      | User taps Retry on fallback UI | `screen`               |

## Tests

- **Unit**: the ErrorBoundary catches a throwing child and renders the fallback.
- **Integration**: the Retry button remounts the subtree.
- **PII scrubbing**: feeds a mock event with sensitive fields and asserts they're removed.
- **Backend**: an unhandled exception returns 500 with a trace ID, and Sentry receives the event.

## Definition of Done

- [ ] ErrorBoundary component in `packages/design_system`
- [ ] App wrapped at root level (and at finer granularity where useful)
- [ ] Sentry initialized on mobile, web, and backend
- [ ] PII scrubber implemented and tested on all platforms
- [ ] Source maps uploaded on each release (CI step)
- [ ] Release tagging functional
- [ ] User identifier set in Sentry context after login
- [ ] Documentation for triggering test errors in dev

## Standards & References

### Cross-cutting standards

- Observability: `docs/engineering/observability.md`
- Security (PII handling): `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`
- Architecture (error response shape): `docs/engineering/architecture-patterns.md`

### Library / framework references

- Sentry React Native: https://docs.sentry.io/platforms/react-native/
- Sentry Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry Python (FastAPI): https://docs.sentry.io/platforms/python/integrations/fastapi/

### Project context

- `CLAUDE.md`
