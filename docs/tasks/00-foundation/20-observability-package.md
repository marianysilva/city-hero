# Observability Package · Minimal Sentry + structured logs

> **Type:** Foundation · Cross-cutting
> **Screen(s):** All applications (backend, mobile, web when it exists)
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/01-monorepo-setup.md`
> **Status:** ⬜ Not started
> **Labels:** `foundation`, `observability`, `cross-cutting`

## Context

A **deliberately small** observability layer that does just enough for
a 1-city MVP: catch errors that hurt users, give developers structured
logs to debug from, and stay out of the way. No OpenTelemetry, no
distributed tracing, no Grafana stack, no APM agents — those are
infrastructure that exceeds the team's current operational capacity
and only pays off once the project is serving multiple cities and
tens of thousands of users (see decision in
`docs/engineering/open-questions.md` Q12).

The package centralizes the small amount of code each application
needs: a Sentry init, a structured logger config, and a shared trace
ID helper for correlation across the API boundary. Apps consume one
import and never write Sentry config or logging boilerplate themselves.

## User Story

**As a** Developer debugging an issue,
**I want** the same Sentry alerts and a consistent log shape across mobile, backend, and (eventually) web,
**In order to** find the cause of a problem in minutes, not hours, without standing up a full observability stack.

## Acceptance Criteria

### Scenario · Single package, three consumers

**Given** the monorepo has `apps/backend`, `apps/city-hero`, and `apps/web`
**When** any of them needs to log or capture an error
**Then** they import from `@cityhero/observability` (the package's public API)
**And** never call Sentry SDKs or stdlib logging directly
**And** the package has subpaths matching each runtime: `@cityhero/observability/python`, `@cityhero/observability/react`, `@cityhero/observability/react-native`

### Scenario · Sentry captures errors

**Given** an unhandled exception fires in any app
**When** the error reaches the boundary (React Error Boundary on the client; FastAPI exception handler on the backend)
**Then** Sentry receives the event with: app name, env (dev/staging/prod), release version, and the trace ID from the API call (when applicable)
**And** PII fields are scrubbed before send (per the scrubber config in the package)

### Scenario · Structured logs

**Given** a developer writes a log line
**When** the log call runs
**Then** the output is JSON with at minimum: `level`, `timestamp`, `message`, `app`, `env`, `trace_id`
**And** in dev mode, the JSON is pretty-printed and colorized for readability
**And** in staging/prod, the JSON is single-line for ingestion

### Scenario · Trace ID propagation

**Given** the mobile app calls the backend
**When** the request is dispatched
**Then** the API client (`00-foundation/05`) attaches an `X-Trace-Id` header (UUIDv7) generated client-side
**And** the backend middleware reads that header and stores the trace ID in a context variable
**And** every backend log line and Sentry event for that request carries the same trace ID
**And** the response includes the trace ID for client-side logs as well

### Scenario · PII scrubbing (LGPD)

**Given** an event would contain a CPF, e-mail, full name, or any other PII
**When** the event is serialized to send
**Then** the scrubber replaces the value with `<redacted>` before transport
**And** the redaction is consistent across mobile, backend, and web

### Scenario · No outbound calls in tests

**Given** the test environment runs
**When** observability is initialized
**Then** Sentry transport is set to a no-op (or `BeforeSend → null`)
**And** logs go to stdout only

## Frontend / mobile (React Native)

### Where it lives

```
packages/observability/
├── package.json                    ← exports python/, react/, react-native/ subpaths
├── tsconfig.json
├── common/
│   ├── piiScrubber.ts              ← list of fields to redact
│   ├── traceId.ts                  ← UUIDv7 generator
│   └── constants.ts                ← env names, app names, log levels
├── react-native/
│   ├── index.ts                    ← initSentry(), useErrorBoundary(), logger
│   └── ...
├── react/
│   └── index.ts                    ← initSentry() for Next.js, logger
└── python/
    ├── __init__.py                 ← init_sentry(), get_logger(), trace_id_middleware
    └── ...
```

### Behavior

- `@cityhero/observability/react-native` initializes `@sentry/react-native` (Expo plugin) at app start.
- The package exposes a `logger` with the same API across runtimes (`debug`, `info`, `warn`, `error`).
- Each call attaches the current trace ID from a context module (set by the API client when a request starts).
- The package owns the PII scrubber config — apps never decide what to redact.

## Backend (Python / FastAPI)

### Behavior

- `init_sentry()` is called at app start; reads DSN + env from environment variables.
- A FastAPI middleware reads the `X-Trace-Id` header (or generates a UUIDv7 if absent), stores it in a `ContextVar`, and binds it to every log line and Sentry scope for the request.
- `get_logger()` returns a `structlog`-configured logger; in dev it pretty-prints, in staging/prod it emits JSON to stdout.
- The PII scrubber runs in Sentry's `before_send` hook.

## Database

Not applicable.

## Stack summary

| Layer            | Package                      | Notes                                          |
|------------------|------------------------------|------------------------------------------------|
| Mobile errors    | `@sentry/react-native` 5.16+ | Expo plugin (the legacy `sentry-expo` is dead) |
| Web errors       | `@sentry/nextjs` 8.28+       | Auto-instrumented                              |
| Python errors    | `sentry-sdk` 2.45+           |                                                |
| Python logs      | `structlog`                  | Contextvars + processors for PII redaction     |
| JS logs          | The same `logger` API        | Backed by `pino` (web) and console (RN)        |
| Trace correlation| Custom `X-Trace-Id` header   | No OpenTelemetry, no W3C `traceparent`         |

## Explicitly out of scope (for the MVP)

- OpenTelemetry traces and spans.
- Metrics (Prometheus / RED / USE dashboards).
- APM agents (Datadog, New Relic, Honeycomb).
- Self-hosted Loki / Tempo / Grafana.
- User-session replay tools (Sentry Replay disabled).
- Profiling.

These are deferred until either (a) the platform grows past one city
or (b) a specific incident pattern justifies the operational cost.
Adding them later is a known, well-trodden path — see
`docs/engineering/observability-package-research.md` for the upgrade
path when it becomes relevant.

## Edge Cases

- **Sentry DSN missing**: package logs a warning and disables transport; nothing crashes.
- **Trace ID corrupted by intermediate proxy**: middleware rejects the header and generates a fresh one (with a `trace_id_replaced=true` log field for diagnostics).
- **PII scrubber misses a field**: a regression test enumerates known-bad inputs and asserts they are redacted.
- **Logger called before init**: a default no-op logger is exported so import order doesn't matter.

## Privacy / LGPD

The PII scrubber is the **only** thing standing between accidental
exposure and a regulatory incident. It runs on:

- Sentry events (`before_send`)
- Log lines (structlog / pino processor)
- Breadcrumbs

The scrubber redacts at minimum: e-mail, phone, CPF, RG, full name
field names, photo URLs containing personal directories, and any field
explicitly tagged `pii=true` by the caller.

## Analytics

This task introduces no end-user telemetry. Analytics events live in
`00-foundation/14-analytics-tracking.md`.

## Tests

- **Unit**: PII scrubber redacts known fields; trace ID UUIDv7 format; logger no-op when DSN missing.
- **Integration**: a thrown exception in a FastAPI handler reaches Sentry with the right trace ID.
- **CI gate**: a test asserts that no app imports `@sentry/...` directly — only via this package.

## Definition of Done

- [ ] `packages/observability/` scaffolded with subpaths per runtime
- [ ] Sentry init for Python, RN, and Next.js
- [ ] Structured logger config (`structlog` + JS console wrapper)
- [ ] Trace ID generation + propagation (header, middleware, contextvar)
- [ ] PII scrubber + tests
- [ ] Public API documented in the package README
- [ ] CI check: no direct `@sentry/*` imports outside this package

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Security / LGPD: `docs/engineering/security-baseline.md`
- Existing observability standards (must align): `docs/engineering/observability.md`
- Research / upgrade path: `docs/engineering/observability-package-research.md`

### Library / framework references
- Sentry React Native: https://docs.sentry.io/platforms/react-native/
- Sentry Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry Python: https://docs.sentry.io/platforms/python/
- structlog: https://www.structlog.org/

### Project context
- API client (where the trace ID is generated for outbound requests): `00-foundation/05-api-client.md`
- Error boundary (consumes the package): `00-foundation/15-error-boundary.md`
- `CLAUDE.md`
