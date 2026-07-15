# Error Boundary + Crash Reporting · Sentry integration

> **Type:** Foundation · Observability\
> **Screen(s):** All\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/01-monorepo-setup.md`,
> `00-foundation/20-observability-package.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `web`, `backend`, `observability`, `foundation`

## Context

Catch and report errors at every layer: React error boundaries (mobile + web), unhandled promise
rejections, native crashes (iOS/Android), and backend exceptions. Centralize in Sentry so a single
dashboard shows the health of the product across platforms.

Without it, errors ship silently and we only learn about them when users complain.

## User Story

**As a** Developer / On-call,\
**I want** automatic error reporting from all platforms with stack traces and breadcrumbs,\
**In order to** triage and fix bugs without needing user reproduction steps.

**As a** Citizen,\
**I want** the app to recover gracefully from a render error,\
**In order to** continue using it instead of seeing a blank screen.

## Acceptance Criteria

### Scenario · React render error caught

**Given** a screen throws during render\
**When** the error reaches the error boundary\
**Then** the boundary shows a fallback UI ("Algo deu errado · Recarregar")\
**And** the error is sent to Sentry with full stack trace and breadcrumbs\
**And** the user can tap "Recarregar" to remount the screen

### Scenario · Unhandled promise rejection

**Given** an async function throws and the promise isn't caught\
**When** the global handler intercepts\
**Then** the error is sent to Sentry tagged as an unhandled rejection\
**And** the user sees a non-blocking toast on mobile ("Algo deu errado · tente novamente")\
**And** the app does not crash

### Scenario · Native crash (mobile)

**Given** a native module crashes\
**When** the app restarts after the crash\
**Then** Sentry's native SDK uploads the crash report on next launch\
**And** the on-call is paged if the crash rate exceeds the configured threshold

### Scenario · Backend exception

**Given** a FastAPI handler raises an unhandled exception\
**When** the global exception handler catches it\
**Then** Sentry receives the exception with request context (URL, headers, user ID, trace ID)\
**And** the response is `500` with body `{ code: "internal_error", traceId: "..." }`\
**And** PII is scrubbed from the report

### Scenario · PII scrubbing

**Given** an error contains email, CPF, or password in the breadcrumb trail\
**When** Sentry's pre-send hook runs\
**Then** these fields are masked or removed\
**And** the denylist explicitly covers `password`, `password_hash`, `cpf`, `cpf_hash`,
`refresh_token`, `access_token`

### Scenario · Source maps

**Given** a production error contains minified frames\
**When** the Sentry web dashboard loads the issue\
**Then** source maps resolve frames to original TypeScript code\
**And** developers can see the exact line that errored

### Scenario · Release tracking

**Given** a new app version is deployed\
**When** errors arrive\
**Then** they're tagged with the release identifier (`cityhero@<version>+<build>`)\
**And** the dashboard shows error rate per release

## Frontend (React Native + Web)

### React error boundary component

```
packages/design_system/src/components/ErrorBoundary/
├── ErrorBoundary.tsx
├── ErrorFallback.tsx
└── ErrorBoundary.test.tsx
```

The boundary wraps the app's root tree (or per-route subtrees for finer-grained recovery). When it
catches an error, it:

- Renders the fallback UI in place of the broken subtree.
- Sends the error to Sentry with the React component stack and the latest breadcrumbs.
- Exposes a "retry" handler that remounts the subtree.
- In dev, the fallback shows the full stack trace; in prod, it shows only a trace ID for support
  reference.

**Implementation note (React 19 has no hook-based error boundary):** as of React 19, catching render
errors still requires the class-component lifecycle methods `static getDerivedStateFromError` and
`componentDidCatch` — there is no function-component/hook equivalent (confirmed against the current
React docs). Do not implement the catch mechanism as a hook. Build `ErrorBoundary.tsx` on top of the
`react-error-boundary` package (supports React 18.0.0 and 19.0.0+, so it's compatible with this
repo's React 19.2.3) rather than hand-rolling the class boilerplate: it wraps the same
`getDerivedStateFromError`/`componentDidCatch` class internally and adds `resetKeys`,
`FallbackComponent`/`fallbackRender`, and an imperative `resetErrorBoundary()`. Its
`useErrorBoundary()` hook is a convenience for _triggering_ the boundary from an event handler (e.g.
`showBoundary(err)` from a non-render callback) or reading `error`/`resetBoundary` inside the
fallback — it is not a replacement for the class-based catch mechanism.

**Mobile integration with Expo Router (`~56.2.11`):** Expo Router has its own error boundary
convention — exporting a named `ErrorBoundary` component (props: `error`, `retry`) from any route
file (e.g. `app/_layout.tsx`, or a specific route) automatically wraps that route in a React error
boundary; if a route doesn't export one, the error propagates to the nearest ancestor route that
does. This task should use that convention at the root (`app/_layout.tsx`) instead of hand-wrapping
the tree in a separate top-level provider, and may add per-route `ErrorBoundary` exports for
finer-grained recovery (e.g. the camera screen). The route's `ErrorBoundary` export renders the
shared `ErrorFallback` component from `packages/design_system` and forwards `retry` to it; it must
still report to Sentry via the observability client described below, since Expo Router's convention
only handles the catch/fallback/retry UI, not telemetry.

### Sentry initialization and PII scrubbing

Sentry init (DSN from environment, environment label, release identifier, performance sampling rate)
and the PII pre-send scrubbing hook are **not** implemented in this task — they are owned by
`00-foundation/20-observability-package.md` (`@cityhero/observability/react-native` and
`@cityhero/observability/react`). This task's boundary and global handlers call into that package's
already-initialized client (e.g. `captureException` re-exported from `@cityhero/observability`)
rather than importing `@sentry/react-native` or `@sentry/nextjs` directly. Per
`20-observability-package.md`'s CI gate, no app-level code may import a `@sentry/*` package
directly.

### Native crash reporting

iOS and Android crashes are auto-captured by Sentry's native SDKs (initialized by
`@cityhero/observability/react-native`, see `00-foundation/20-observability-package.md`) and
uploaded on the next app launch.

## Backend (FastAPI)

A global FastAPI exception handler catches unhandled exceptions and:

- Logs the exception with the trace ID, via `@cityhero/observability`'s Python `get_logger()` (see
  `00-foundation/20-observability-package.md` — this task does not configure `structlog` or Sentry's
  FastAPI integration itself, only wires the handler that calls into it).
- Reports the exception to Sentry through the observability package's already-initialized client
  (`init_sentry()` ran at app startup, owned by `20-observability-package.md`), which attaches
  request context (URL, headers, user ID, trace ID) and applies the shared PII scrubber.
- Returns a JSON response following the standard error shape (see `architecture-patterns.md`): `500`
  with body `{ code: "internal_error", traceId: "..." }`.

## Database

Not applicable — error/crash events are reported to Sentry, not persisted in the application
database; this task owns no schema.

## Edge Cases

- **Sentry DSN missing in dev**: the SDK no-ops gracefully.
- **Network down when error fires**: the SDK queues events and retries when online.
- **Error inside the error boundary itself**: a higher-level boundary one layer up catches it.
- **Sentry quota exceeded**: events drop silently — the app continues normally.
- **Sensitive prop in component state**: the pre-send hook scrubs by key name; manual review covers
  integration-specific fields.

## Privacy / LGPD

- PII scrubbing is mandatory (see `security-baseline.md`).
- The user identifier sent to Sentry is the user's UUID — never email or CPF.
- Sentry retention is configured to 30 days for errors and 7 days for performance traces.
- Mobile: do not initialize Sentry for users who have not consented (toggle in Settings, default
  opt-in but reversible).

## Analytics

| Event                       | When                           | Props                  |
| --------------------------- | ------------------------------ | ---------------------- |
| `error.boundary_caught`     | React boundary catches         | `screen`, `error_name` |
| `error.unhandled_rejection` | Global handler                 | `error_name`           |
| `error.fallback_retry`      | User taps Retry on fallback UI | `screen`               |

## Tests

- **Unit**: the ErrorBoundary catches a throwing child and renders the fallback.
- **Integration**: the Retry button remounts the subtree.
- **PII scrubbing**: covered by `00-foundation/20-observability-package.md`'s own test suite; this
  task only asserts that the boundary/handler pass errors through the package's client rather than a
  raw `@sentry/*` SDK (regression test for the "no direct Sentry import" rule).
- **Backend**: an unhandled exception returns 500 with a trace ID, and Sentry receives the event
  (verified against the observability package's already-initialized client, not a fresh Sentry
  init).

## Definition of Done

- [ ] `ErrorBoundary.tsx`/`ErrorFallback.tsx` built in `packages/design_system` on top of
      `react-error-boundary`
- [ ] Mobile root (`app/_layout.tsx`) uses Expo Router's `ErrorBoundary` export convention; key
      per-route boundaries added where useful (e.g. camera screen)
- [ ] Web (Next.js) wrapped at root level with the same shared fallback UI
- [ ] Boundary and global handlers call `@cityhero/observability` (never `@sentry/*` directly) —
      depends on `00-foundation/20-observability-package.md` being in place first
- [ ] Backend global exception handler wired to the observability package's Sentry client and
      returns the standard `{ code, traceId }` error shape
- [ ] Release tagging visible on captured errors (release identifier comes from the observability
      package's init config)
- [ ] User identifier set in Sentry context after login (via the package's identify/context API)
- [ ] Documentation for triggering test errors in dev

## Standards & References

### Cross-cutting standards

- Observability: `docs/engineering/observability.md`
- Security (PII handling): `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`
- Architecture (error response shape): `docs/engineering/architecture-patterns.md`

### Library / framework references

- react-error-boundary: https://github.com/bvaughn/react-error-boundary (supports React 18.0.0 and
  19.0.0+; provides `ErrorBoundary`, `useErrorBoundary`, `resetErrorBoundary` — the underlying catch
  mechanism is still React's class-component `getDerivedStateFromError`/`componentDidCatch`, no hook
  equivalent exists in React 19)
- Expo Router error handling (built-in `ErrorBoundary` route export):
  https://docs.expo.dev/router/error-handling/
- Sentry React Native: https://docs.sentry.io/platforms/react-native/ (initialized only via
  `00-foundation/20-observability-package.md`, not directly by this task)
- Sentry Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/ (same note)
- Sentry Python (FastAPI): https://docs.sentry.io/platforms/python/integrations/fastapi/ (same note)

### Project context

- Observability package (owns Sentry init, logging, PII scrubber, trace ID — this task's hard
  dependency): `00-foundation/20-observability-package.md`
- `CLAUDE.md`
