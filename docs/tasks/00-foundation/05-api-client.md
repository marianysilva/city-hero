# API Client · Auth interceptor + retry + multi-tenant

> **Type:** Foundation · Networking
> **Screen(s):** All that talk to the backend
> **Effort:** M (2 days)
> **Dependencies:** `00-foundation/01-monorepo-setup.md`, `00-foundation/06-auth-system.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `web`, `frontend`, `networking`, `foundation`

## Context

A shared HTTP client used by mobile (RN) and web (Next.js) to talk to the
FastAPI backend. It centralizes the concerns no screen should reimplement:
auth header injection, automatic refresh on 401, retry with exponential
backoff for transient failures, error normalization, request cancellation,
multi-tenant scoping, and offline detection.

## User Story

**As a** Frontend Developer,
**I want** a single, well-tested HTTP client for any backend call,
**In order to** stop reimplementing auth, retry, and error handling per screen.

## Acceptance Criteria

### Scenario · Authenticated request

**Given** the user is logged in (token in secure storage)
**When** any screen calls the client
**Then** the request includes a Bearer authorization header
**And** includes the city scope header (`X-City-Id`) from app context
**And** includes app version and platform headers

### Scenario · Token expired (401)

**Given** an authenticated request returns 401 with code `token_expired`
**When** the auth interceptor catches it
**Then** the client refreshes the token using the refresh token
**And** retries the original request once with the new access token
**And** if the refresh fails, dispatches a logout action and rejects the original promise

### Scenario · Transient error (5xx, network)

**Given** a request returns 502/503/504 or fails with a network error
**When** the client receives the response
**Then** it retries with exponential backoff (e.g., 500ms, 1s, 2s; max 3 attempts)
**And** retries only idempotent methods (GET, HEAD, OPTIONS)
**And** if all retries fail, throws a normalized network error

### Scenario · Request cancellation

**Given** a screen unmounts before the response arrives
**When** the cleanup function runs
**Then** the in-flight request is aborted
**And** the client doesn't update state on the unmounted component

### Scenario · Offline detection

**Given** the device has no internet
**When** a request is attempted
**Then** the client throws an offline error immediately (no retry)
**And** the error includes a flag that screens can use to render an offline UI
**And** the request can optionally be enqueued via the offline queue (`00-foundation/09-offline-queue.md`)

### Scenario · Error normalization

**Given** any non-2xx response (4xx or 5xx)
**When** the client throws
**Then** the error follows the standard shape: `{ status, code, message, details, traceId }`
**And** the message is i18n-ready (a key, not raw text)

### Scenario · Multi-tenant header

**Given** the user is in a specific city
**When** any request is sent
**Then** the city scope header is included
**And** the backend uses this to scope every database query

### Scenario · Single-flight refresh

**Given** two parallel requests both receive 401
**When** the auth interceptor handles them
**Then** only one refresh request is made
**And** both requests wait for that single refresh to complete before retrying

## Frontend (TypeScript)

### Package location

```
packages/api_client/
├── package.json
├── src/
│   ├── client.ts
│   ├── interceptors/
│   │   ├── auth.ts
│   │   ├── retry.ts
│   │   ├── errorNormalize.ts
│   │   └── headers.ts
│   ├── errors.ts
│   ├── types.ts
│   └── endpoints/             ← typed endpoint wrappers per resource
└── tests/
```

### Client behavior

The client is created via a factory that receives the integration points: how to read/write tokens, how to read the current city ID, what to do on auth failure, and platform/version info. The factory returns an instance with typed methods per resource (auth, reports, users, notifications, etc.).

### Caching

Caching is **not** the client's responsibility. Screens use TanStack Query (React Query) on top of the client for deduplication, caching, and refetching. The client itself is cache-free.

## Backend (FastAPI)

### Required conventions

- All errors return JSON with the standard error shape.
- A trace ID is propagated via header; the backend generates one if missing.
- Auth refresh: a dedicated endpoint accepts a refresh token, returns a new access/refresh pair, and revokes the old refresh token.
- Rate limiting: 429 responses include a `Retry-After` header that the client respects.

### Multi-tenant enforcement

Middleware reads the city scope header and injects it into the request state. Every service-layer query receives the city ID and filters by it. Missing header on tenanted endpoints returns 400.

## Database

Not applicable directly.

## Edge Cases

- **Refresh token expired**: a 401 from the refresh endpoint triggers logout.
- **Two parallel 401s**: only one refresh is made (single-flight pattern).
- **Clock skew between device and server**: the server is authoritative for token expiry.
- **API URL changed in dev**: the URL is read from environment, hot-reloadable.
- **Self-signed cert in dev**: an env flag allows insecure TLS in dev only — never in production.
- **Body too large**: surface 413 cleanly so the host screen can reduce upload size.

## Privacy / LGPD

- Don't log full tokens, even in dev. Mask all but the prefix.
- Trace IDs are safe to include in headers and logs; they're not PII.
- See `security-baseline.md` for full guidance.

## Analytics

| Event                 | When                            | Props                                       |
| --------------------- | ------------------------------- | ------------------------------------------- |
| `api.request_failed`  | Any non-2xx after retries       | `endpoint`, `status`, `code`, `duration_ms` |
| `api.token_refreshed` | Successful refresh              | `reason: expired                            | forced` |
| `api.offline_attempt` | Request attempted while offline | `endpoint`                                  |

## Tests

- **Unit**: each interceptor in isolation (auth, retry, error normalization, headers).
- **Integration**: end-to-end refresh on 401; retry on 5xx; non-retry on 4xx (except 401); cancellation aborts the request.
- **Race condition**: two parallel 401s trigger only one refresh.
- **Offline**: when the network is unavailable, an offline error is thrown without retrying.

## Definition of Done

- [ ] `packages/api_client` package built
- [ ] Auth, retry, error normalization, and headers interceptors
- [ ] Single-flight refresh
- [ ] AbortController-based cancellation
- [ ] Typed endpoint wrappers for at least 5 resources (auth, reports, users, comments, notifications)
- [ ] React Query setup in mobile and web apps
- [ ] ≥90% unit test coverage in the package
- [ ] Used by at least one screen end-to-end as a smoke test

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (error response shape, multi-tenant): `docs/engineering/architecture-patterns.md`
- Security (token handling, redaction): `docs/engineering/security-baseline.md`
- Observability (trace ID propagation): `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- TanStack React Query: https://tanstack.com/query/latest
- Mock Service Worker (testing): https://mswjs.io/

### Project context

- `CLAUDE.md`
