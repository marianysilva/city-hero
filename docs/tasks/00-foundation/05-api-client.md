# API Client · Auth interceptor + retry + multi-tenant

> **Type:** Foundation · Networking\
> **Screen(s):** All that talk to the backend\
> **Effort:** M (2 days)\
> **Dependencies:** `00-foundation/01-monorepo-setup.md`\
> **Status:** 🟡 In progress — `packages/api_client` (`@city-hero/api-client`) is built and covers
> every scenario that's actually buildable against today's backend: headers, retry/backoff,
> cancellation, offline detection, error normalization (mapping the three real backend error
> shapes), and the "401 → forced logout" auth interceptor (a `skipAuth` request like login/register
> returning 401 is _not_ treated as a forced logout — there's no session yet to tear down; the
> original Acceptance Criteria didn't spell out this distinction, reconciled during implementation).
> 46 unit tests (MSW v2 + vitest), 95.7%/96.1% statement/line coverage. `auth` and `users` endpoint
> wrappers are verified against the real router signatures in `apps/backend/app/routers/`;
> `reports`/`comments`/`notifications` are typed but **PROVISIONAL** — no such backend routers exist
> yet, so those wrappers are unverified against any real contract. Deferred: single-flight refresh
> (still blocked on `/auth/refresh` not existing).\
> \
> **Consumption**: `apps/web`'s `GET /api/users/me` BFF route handler now calls this package
> server-side (the actual FastAPI-calling boundary in this app's architecture), and `useCurrentUser`
> runs on TanStack Query — that's the "used by a screen end-to-end" smoke test, exercised on every
> dashboard page load. The other 6 `apps/web` BFF routes (`login`, `users` list/create, `users/:id`,
> `reset-password`, `restore`) still use the old ad-hoc `lib/api-proxy.ts` helper — migrating them
> is a natural follow-up, not required for this smoke test. The dead, already-unused
> `app/lib/api.ts` (one of the three ad-hoc clients this task replaces) was deleted.
> `apps/city-hero` has `QueryClientProvider` + a client factory wired into its root layout, but no
> mobile screen calls it yet — `06-auth-system.md` hasn't shipped a token to read, exactly as this
> task doc anticipated.\
> \
> **A real discrepancy from this task's original framing**: the Acceptance Criteria assume web talks
> to FastAPI directly via this client with Bearer-header injection. In reality `apps/web` is a BFF —
> the browser holds only an httpOnly cookie and never sees the JWT, deliberately, for security. So
> this package's natural home on the web side is the Next.js Route Handlers (server components), not
> browser-side React Query hooks. Browser-side screens keep talking to the Next.js `/api/*` routes
> (now via React Query where migrated), which is a legitimate, independent caching improvement — but
> is not "this client running in the browser." Noted here rather than silently building against a
> boundary the app doesn't actually have.\
> **Labels:** `mobile`, `web`, `frontend`, `networking`, `foundation`

## Context

A shared HTTP client used by mobile (RN) and web (Next.js) to talk to the FastAPI backend. It
centralizes the concerns no screen should reimplement: auth header injection, automatic refresh on
401, retry with exponential backoff for transient failures, error normalization, request
cancellation, multi-tenant scoping, and offline detection.

**Note on `06-auth-system.md`**: this package and `06-auth-system.md` reference each other (this
client's `auth` resource wraps `06`'s login/register endpoints; `06`'s mobile login screen needs a
client to call them with). That's not a hard build-order dependency in either direction — most of
this client (retry, cancellation, offline detection, error normalization, the plain Bearer-header
`auth` resource wrapper) is fully buildable with only `01-monorepo-setup.md` in place. Only the
token-refresh interceptor and single-flight-refresh scenarios below are blocked, and only on `06`
shipping a working `/auth/refresh` endpoint — not on the whole of `06` being done. Do not list `06`
as a header dependency; treat it as a forward reference for those two scenarios only.

**Ground truth as of this pass (2026-07-15)**, read directly from `apps/backend` and both consumer
apps:

- The backend (`apps/backend/app/routers/auth.py`, `users.py`) is real and returns camelCase JSON
  (via `CamelBase`, see `app/schemas/base.py`), but there is **no `/auth/refresh` endpoint** —
  access tokens are 60-minute JWTs with no refresh mechanism (see `00-foundation/06-auth-system.md`
  for the full breakdown). The "Token expired (401)" and "Single-flight refresh" scenarios below
  describe a backend contract that **does not exist yet** — build this client's interceptor to treat
  401 as an immediate forced logout until `06-auth-system.md`'s refresh endpoint ships, not to
  attempt a refresh call that will 404.
- Errors are **not normalized** on the backend today. `HTTPException(detail=...)` (FastAPI's default
  `{"detail": "..."}` shape) is used everywhere in `auth_service.py`/`user_service.py`; slowapi's
  429 handler returns `{"error": "..."}` (a different shape again, confirmed via slowapi's own
  docs); Pydantic validation failures return FastAPI's default 422 array-of-errors shape. **None of
  these match** the `{ status, code, message, details, traceId }` shape this spec asks for. There is
  also no trace-ID generation/propagation middleware in `apps/backend/main.py`. Building the
  client's error normalizer to the target shape is still correct — it just needs to map three
  different real error shapes into it today, not one consistent one.
- 429 responses **do** include a `Retry-After` header — confirmed via slowapi's own docs, since
  `apps/backend/main.py` registers slowapi's default `_rate_limit_exceeded_handler`, which injects
  `Retry-After`/`X-RateLimit-*` headers automatically. That part of the spec is accurate.
- There is **no multi-tenant middleware, no `X-City-Id` handling, and no `city_id` column anywhere**
  in `apps/backend` — confirmed by grepping the backend for `city_id`/`City` (only doc/comment hits,
  no model, no middleware). The "Multi-tenant header" and "Missing header on tenanted endpoints
  returns 400" behavior is entirely aspirational; do not block client development on it, but don't
  claim it works either.
- A Strawberry GraphQL endpoint exists at `/graphql` (`app/graphql/schema.py`) alongside REST,
  already consumed by `apps/web` via Apollo Client (`app/lib/apollo.ts`,
  `@apollo/client-integration-nextjs`). If `packages/api_client` is meant to serve both apps' full
  backend surface, decide explicitly whether it wraps REST only (current mobile need) or also
  exposes a GraphQL client — don't assume parity with `apps/web`'s Apollo setup without a deliberate
  scoping decision.

## User Story

**As a** Frontend Developer,\
**I want** a single, well-tested HTTP client for any backend call,\
**In order to** stop reimplementing auth, retry, and error handling per screen.

## Acceptance Criteria

None of these scenarios are built yet (the package doesn't exist), but they diverge in how buildable
they are _today_ given the real backend contract — each is annotated accordingly.

### Scenario · Authenticated request

**Status: ⬜ not started; partially buildable today.** Bearer header injection is straightforward —
the backend already expects `Authorization: Bearer <token>` (see `security.py`'s `HTTPBearer`). The
city-scope header is **not buildable against the real backend** (see below).

**Given** the user is logged in (token in secure storage)\
**When** any screen calls the client\
**Then** the request includes a Bearer authorization header\
**And** includes the city scope header (`X-City-Id`) from app context — **not enforced or read by
the backend today; safe to send but currently a no-op server-side**\
**And** includes app version and platform headers

### Scenario · Token expired (401)

**Status: ⬜ not started; not buildable against the real backend today.** There is no
`/auth/refresh` endpoint and no refresh token (confirmed in `06-auth-system.md` and
`apps/backend/app/core/config.py`'s own comment: "implement refresh tokens for longer sessions").
Also, the backend never returns a `token_expired` error code — an expired/invalid JWT just yields a
generic FastAPI `401 {"detail": "Could not validate credentials"}` (see `security.py`), with no
machine-readable code to distinguish "expired" from "malformed" from "signed by the wrong key".

**Given** an authenticated request returns 401 — **do not** assume a `token_expired` code is
present; detect expiry client-side by decoding the JWT's `exp` claim, or simply treat any 401 as
invalid\
**When** the auth interceptor catches it\
**Then** ~~the client refreshes the token using the refresh token~~ **the client should instead
dispatch a logout action immediately and reject the original promise** — there is no refresh path to
attempt until `06-auth-system.md` ships one\
**And** ~~retries the original request once with the new access token~~ not applicable today

### Scenario · Transient error (5xx, network)

**Status: ⬜ not started; fully buildable today** — this is pure client-side logic independent of
any specific backend behavior.

**Given** a request returns 502/503/504 or fails with a network error\
**When** the client receives the response\
**Then** it retries with exponential backoff (e.g., 500ms, 1s, 2s; max 3 attempts)\
**And** retries only idempotent methods (GET, HEAD, OPTIONS)\
**And** if all retries fail, throws a normalized network error

### Scenario · Request cancellation

**Status: ⬜ not started; fully buildable today** — standard `AbortController`, no backend
dependency.

**Given** a screen unmounts before the response arrives\
**When** the cleanup function runs\
**Then** the in-flight request is aborted\
**And** the client doesn't update state on the unmounted component

### Scenario · Offline detection

**Status: ⬜ not started; fully buildable today** — client-side network-state detection, no backend
dependency.

**Given** the device has no internet\
**When** a request is attempted\
**Then** the client throws an offline error immediately (no retry)\
**And** the error includes a flag that screens can use to render an offline UI\
**And** the request can optionally be enqueued via the offline queue
(`00-foundation/09-offline-queue.md`)

### Scenario · Error normalization

**Status: ⬜ not started; buildable, but must map three different real shapes, not one.** The
backend does not emit the standard shape below — it returns FastAPI's default `{"detail": "..."}`
for `HTTPException`s (used throughout `auth_service.py`/`user_service.py`), FastAPI's default
array-of-errors shape for 422 Pydantic validation failures, and slowapi's own `{"error": "..."}` for
429s (confirmed via slowapi's docs — its default handler doesn't use FastAPI's `detail` convention
at all). There is also no trace-ID header generated or propagated by `apps/backend/main.py` today.

**Given** any non-2xx response (4xx or 5xx)\
**When** the client throws\
**Then** the error follows the standard shape: `{ status, code, message, details, traceId }` — the
client's normalizer must derive `code`/`message` heuristically per error shape above (no server-side
`code` field exists to read from), and `traceId` will be absent/`null` until the backend adds
trace-ID propagation\
**And** the message is i18n-ready (a key, not raw text)

### Scenario · Multi-tenant header

**Status: ⬜ not started; not enforceable against the real backend today.** No `city_id` column, no
`City` model, and no request middleware exist anywhere in `apps/backend` (confirmed by grepping the
codebase). Sending the header is harmless; asserting the backend "uses this to scope every database
query" is currently false for every table, including `users`.

**Given** the user is in a specific city\
**When** any request is sent\
**Then** the city scope header is included (client-side no-op until the backend implements
multi-tenancy — a real gap against `CLAUDE.md`'s "every query must be scoped by `city_id`" rule)\
**And** ~~the backend uses this to scope every database query~~ not true today for any table

### Scenario · Single-flight refresh

**Status: ⬜ not started; blocked on the same missing `/auth/refresh` endpoint as above.** Keep this
scenario as the target design for once refresh tokens exist — the single-flight pattern itself is
correct and worth implementing then — but don't wire it up against a 404 today.

**Given** two parallel requests both receive 401\
**When** the auth interceptor handles them\
**Then** only one refresh request is made (once `/auth/refresh` exists)\
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

The client is created via a factory that receives the integration points: how to read/write tokens,
how to read the current city ID, what to do on auth failure, and platform/version info. The factory
returns an instance with typed methods per resource (auth, reports, users, notifications, etc.).

**Resources with a real backend today to wrap**: `auth` (`POST /auth/register`, `POST /auth/login` —
see `06-auth-system.md` for exact request/response shapes) and `users` (`GET/POST /users`,
`GET/PATCH/DELETE /users/{id}`, `POST /users/{id}/reset-password`, `POST /users/{id}/restore`,
`GET /users/me`). `reports`, `comments`, and `notifications` endpoint wrappers named in the
Definition of Done below have **no backend routes to wrap yet** — `apps/backend/app/routers/` only
contains `auth.py` and `users.py` today. Build those wrappers' shape from this spec, but they'll be
untestable against a real backend until those routers exist.

### Caching

Caching is **not** the client's responsibility. Screens use TanStack Query (React Query) on top of
the client for deduplication, caching, and refetching. The client itself is cache-free.

## Backend (FastAPI)

### Required conventions — target vs. reality

| Convention                                                                                                                       | Status       | Reality                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| All errors return JSON with the standard error shape                                                                             | ⬜ not built | Three different shapes exist today: FastAPI `{"detail": "..."}` for `HTTPException`s, FastAPI's default 422 array for Pydantic validation, and slowapi's own `{"error": "..."}` for 429s. No unification layer exists in `apps/backend/main.py`. |
| A trace ID is propagated via header; the backend generates one if missing                                                        | ⬜ not built | No trace-ID middleware anywhere in `apps/backend`. This is also called out as a gap in `00-foundation/20-observability-package.md`'s scope — likely the right place to land it, not here.                                                        |
| Auth refresh: a dedicated endpoint accepts a refresh token, returns a new access/refresh pair, and revokes the old refresh token | ⬜ not built | No `/auth/refresh` endpoint, no refresh token concept at all (see `06-auth-system.md`).                                                                                                                                                          |
| Rate limiting: 429 responses include a `Retry-After` header that the client respects                                             | ✅ built     | Confirmed via slowapi's own docs and `apps/backend/main.py`'s registration of `_rate_limit_exceeded_handler` — 429s do carry `Retry-After` and `X-RateLimit-*` headers today, on `/auth/register` and `/auth/login`.                             |

### Multi-tenant enforcement

⬜ **Not built.** The spec's description below is the target design; today there is no such
middleware, no request-state injection, and no city-scoped filtering in any service
(`auth_service.py`, `user_service.py` — neither references a city at all). This is a real gap
against `CLAUDE.md`'s multi-tenant-by-default rule that needs backend work before this client's
multi-tenant scenario can be honestly claimed as done:

Middleware reads the city scope header and injects it into the request state. Every service-layer
query receives the city ID and filters by it. Missing header on tenanted endpoints returns 400.

## Database

Not applicable — this task has no schema of its own; it's a pure client-side networking package.
(The multi-tenant and auth database concerns it depends on live in `06-auth-system.md` and whatever
task introduces the `city_id`/`cities` model, neither of which exists in the database yet either.)

## Edge Cases

- **Refresh token expired**: ⬜ not applicable today — there is no refresh endpoint to expire
  against; treat any 401 as an immediate logout (see Acceptance Criteria above) until one exists.
- **Two parallel 401s**: kept as the target single-flight design for once refresh tokens exist;
  today two parallel 401s should each independently trigger the same "logout" path — that's
  naturally idempotent and needs no special-casing.
- **Clock skew between device and server**: still valid — the server is authoritative for token
  expiry (`exp` claim in the JWT, checked server-side by `security.py`'s `jwt.decode`).
- **API URL changed in dev**: still valid — the URL is read from environment, hot-reloadable.
- **Self-signed cert in dev**: still valid — an env flag allows insecure TLS in dev only — never in
  production.
- **Body too large**: still valid — surface 413 cleanly so the host screen can reduce upload size;
  no backend route accepts file uploads yet to verify this against (photo upload is
  `00-foundation/07-photo-upload-pipeline.md`, also not built).

## Privacy / LGPD

- Don't log full tokens, even in dev. Mask all but the prefix. Still applicable: `apps/web`'s
  current ad-hoc clients (`app/lib/api.ts`, `lib/api-proxy.ts`) don't log tokens today either, so
  there's no existing bad pattern to unlearn — just don't introduce one in the new package.
- Trace IDs are safe to include in headers and logs; they're not PII. Moot until the backend
  actually generates trace IDs (see Backend section) — kept as forward-looking guidance.
- See `security-baseline.md` for full guidance.

## Analytics

**Status: ⬜ not implemented** — no analytics/event-tracking integration exists yet in either
`apps/backend` or any frontend app (see `00-foundation/14-analytics-tracking.md`). Kept as the
target event catalog; `api.token_refreshed` can't be emitted until a refresh endpoint exists.

| Event                 | When                            | Props                                       |
| --------------------- | ------------------------------- | ------------------------------------------- |
| `api.request_failed`  | Any non-2xx after retries       | `endpoint`, `status`, `code`, `duration_ms` |
| `api.token_refreshed` | Successful refresh              | `reason: expired                            | forced` |
| `api.offline_attempt` | Request attempted while offline | `endpoint`                                  |

## Tests

- **Unit**: each interceptor in isolation (auth, retry, error normalization, headers) — fully
  buildable today with mocked responses, independent of what the real backend supports yet.
- **Integration**: ⚠️ adjust scope from the original — "end-to-end refresh on 401" isn't testable
  against the real backend (no `/auth/refresh` to hit); test the "401 → forced logout" path instead
  until that endpoint exists. Retry on 5xx, non-retry on 4xx, and cancellation-aborts-the-request
  remain fully testable as originally scoped.
- **Race condition**: ⚠️ adjust scope — "two parallel 401s trigger only one refresh" isn't testable
  yet either; test that two parallel 401s each independently trigger logout without
  double-dispatching side effects, until refresh exists.
- **Offline**: when the network is unavailable, an offline error is thrown without retrying — fully
  buildable today.
- Use Mock Service Worker (MSW) v2's current `http.get`/`http.post` + `HttpResponse.json` API
  (verified via context7) to mock the real endpoints that exist (`/auth/register`, `/auth/login`,
  `/users/me`, etc.) — not the deprecated v1 `rest.*`/`ctx.*` API shown in a lot of older tutorials.

## Definition of Done

- [x] `packages/api_client` package built (`@city-hero/api-client`)
- [x] Auth, retry, error normalization, and headers interceptors — auth interceptor implements "401
      → forced logout" only, and only for authenticated requests (see Status note above for the
      `skipAuth` distinction)
- [ ] Single-flight refresh — still deferred; `06-auth-system.md` hasn't shipped `/auth/refresh`
- [x] AbortController-based cancellation — `signal?` threaded through `client.request()` and every
      typed endpoint method
- [x] Typed endpoint wrappers for 5 resources (auth, reports, users, comments, notifications) —
      `auth`/`users` verified against the real backend routers; `reports`/`comments`/`notifications`
      are PROVISIONAL (typed, unit-tested against mocked-but-unverified paths, no real backend
      router exists yet)
- [x] React Query setup in mobile and web apps — `QueryClientProvider` wired into both apps' root
      layout. See the Status note above on why web's browser-side React Query wraps the Next.js BFF
      routes rather than this package directly (the browser doesn't hold a bearer token by design)
- [x] ≥90% unit test coverage in the package — 46 tests, 95.7% statements / 96.1% lines
      (`cd     packages/api_client && npx vitest run --coverage`)
- [x] Used by at least one screen end-to-end as a smoke test — `apps/web`'s `GET /api/users/me` BFF
      route, exercised by every dashboard page load via `useCurrentUser`. Mobile: provider/client
      wired, not yet consumed by any screen (blocked on `06-auth-system.md`, as originally noted)

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (error response shape, multi-tenant): `docs/engineering/architecture-patterns.md`
- Security (token handling, redaction): `docs/engineering/security-baseline.md`
- Observability (trace ID propagation): `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

Verified against current documentation via context7 on 2026-07-15:

- TanStack Query (`/tanstack/query`) — https://tanstack.com/query/latest — the `defaultQueryFn`
  pattern (a single fetch wrapper registered once via
  `QueryClient({ defaultOptions: { queries: { queryFn } } })`) is still the current recommended way
  to pair a custom client with React Query, and matches this spec's "client is cache-free, React
  Query sits on top" design. Not yet installed in either `apps/city-hero` or `apps/web`.
- Mock Service Worker (`/websites/mswjs_io`) — https://mswjs.io/ — confirmed the current API is
  `http.get`/`http.post` + `HttpResponse.json` with `setupServer` from `msw/node` for Node test
  environments (Jest/Vitest); the older `rest`/`ctx` API shown in a lot of existing tutorials is
  deprecated (MSW v1). Use the current API when this package's tests are written.
- FastAPI, PyJWT, bcrypt, slowapi, SQLAlchemy async, Strawberry GraphQL — checked while reconciling
  `06-auth-system.md`; the findings there (no refresh endpoint, no standard error shape, slowapi's
  default in-memory rate-limit store, `Retry-After` header confirmed present) apply equally to this
  client's design since it consumes the same backend.

### Project context

- `CLAUDE.md`
