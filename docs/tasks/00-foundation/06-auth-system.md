# Auth System · Login + JWT + refresh + Gov.br SSO

> **Type:** Foundation · Authentication\
> **Screen(s):** All authenticated flows (16, 28, anything user-specific)\
> **Effort:** L (3-5 days)\
> **Dependencies:** `00-foundation/05-api-client.md`, `00-foundation/01-monorepo-setup.md`,
> `00-foundation/17-docker-dev-environment.md`\
> **Status:** 🟡 Backend done for email + password + RBAC (`apps/backend/app/routers/auth.py`,
> `users.py`, migrations 001-005); refresh tokens, email verification, self-service password reset,
> Gov.br SSO, LGPD self-deletion, and audit logging are **not built**. Mobile client
> (`apps/city-hero`) is still the stock Expo Router template — no API calls, no secure token
> storage, no auth screens exist at all. See per-scenario notes below.\
> **Labels:** `mobile`, `backend`, `auth`, `security`, `lgpd`, `foundation`

## Context

Authentication system supporting two methods:

- **Email + password** (MVP fallback) — bcrypt-hashed, JWT-based. **This is what's actually shipped
  in `apps/backend`.**
- **Gov.br SSO** (Brazilian federal digital identity, OAuth2/OIDC) — originally planned as the
  preferred method for users who already have a Gov.br account, since it proves real-person status.
  **Not implemented and not started**: `requirements.txt` has no OAuth/OIDC client library, there
  are no `/auth/govbr/*` routes, and the `users` table has no CPF column. Kept in this spec as a
  documented, deferred goal rather than deleted, since `README.md` and `features.md` still list
  Gov.br login as a product differentiator — but the backend milestone that shipped chose to land
  email + password first. Re-scope or drop explicitly if product direction changes.

What's real today, read from the code directly:

- Access tokens are **short-lived JWTs only** — HS256, 60 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES` in
  `app/core/config.py`), signed with a required `SECRET_KEY` (validated ≥32 chars). There is **no
  refresh token** — the config file literally comments "Short-lived access tokens; implement refresh
  tokens for longer sessions." When the access token expires, the only path is a new `/auth/login`.
- Passwords are hashed with bcrypt (cost factor 12, `app/core/security.py`), with a pre-computed
  dummy hash so `/auth/login` runs bcrypt on every request regardless of whether the email exists —
  this defeats user-enumeration-by-timing (verified in
  `tests/test_auth_integration.py::test_login_timing_bcrypt_always_runs`).
- RBAC is real and migrated: `roles` / `permissions` / `role_permissions` tables
  (`alembic/versions/002_create_rbac_tables.py`, seeded by `003_seed_rbac_data.py`), six roles
  (`admin`, `mayor`, `secretary`, `dispatcher`, `field_team`, `citizen`) ranked by privilege, loaded
  into an **in-process dict cache** at FastAPI startup (`app/core/rbac_cache.py` — this is not
  Redis, despite the module name suggesting a shared cache; it does not survive a restart or sync
  across multiple backend replicas without a reload). `005_seed_default_users.py` seeds one
  bootstrap user per role from `APP_ADMIN` / `APP_ADMIN_PASSWORD` / `APP_USERS_PASSWORD` env vars.
- Rate limiting on `/auth/register` (3/min) and `/auth/login` (5/min) is real, via `slowapi` keyed
  by client IP (`app/core/limiter.py`), but uses slowapi's **default in-memory store** (no
  `storage_uri` configured) — per slowapi's own docs this is single-process only and does not share
  state across multiple server instances, so it is weaker than "Redis-backed" brute-force
  protection.
- There is **no `users.city_id` column** and no multi-tenant scoping anywhere in auth/users today —
  a real gap against `CLAUDE.md`'s "every query must be scoped by `city_id`" rule, flagged here
  rather than glossed over.
- A GraphQL layer exists (`app/graphql/schema.py`, `context.py`, `types/user.py`, Strawberry) and
  exposes a `me` query (mirrors `/users/me`) using its own JWT-decode logic in `context.py` — not
  the REST client's concern directly, but a second consumer of the same access token that
  `05-api-client.md` and any future mobile client should be aware of.
- `apps/web` (the Next.js Operational Panel) already has its **own**, independent auth
  implementation — `app/api/auth/login/route.ts` proxies to `POST /auth/login` and sets the access
  token as an HttpOnly, `SameSite=strict` cookie (`app/lib/session.ts`); there's no refresh there
  either. This is a separate BFF pattern from anything `packages/api_client` (see
  `05-api-client.md`) would provide, and mobile still has nothing.

**Dependency direction on `05-api-client.md`**: this task's mobile login/register screens need an
HTTP client to call the backend with, so it depends on `05` for that. `05` in turn only needs this
task for two scenarios (token-refresh interceptor, single-flight refresh) that are blocked on the
`/auth/refresh` endpoint this task ships — everything else in `05` is independently buildable. So
the dependency is one-directional for build order (`05` first, then this task), even though the two
specs reference each other's endpoint/client shapes throughout. See `05-api-client.md`'s Context for
the same note from the other side.

Tokens are currently stored server-issued but **not yet stored anywhere on mobile** (secure storage
on mobile, HttpOnly cookies on web is still the target — web has it, mobile doesn't). LGPD
compliance is mandatory per `CLAUDE.md` but is **not yet implemented for auth**: there's no
explicit-consent capture at registration, no PII-anonymizing self-deletion, and no audit trail.
`DELETE /users/{id}` in `user_service.py` is only an admin-privileged soft-delete (sets
`deleted_at`/`is_active=false`), not the LGPD-specific self-service flow described below.

## User Story

### Email + password (MVP)

**As a** Citizen,\
**I want** to create an account with email and password,\
**In order to** start reporting issues immediately.

### Gov.br SSO (advanced)

**As a** Citizen with a Gov.br account,\
**I want** to log in via Gov.br,\
**In order to** prove I'm a real person without creating yet another account.

## Acceptance Criteria

### Scenario · Email signup

**Status: ✅ built, but simpler than originally spec'd** — real endpoint is `POST /auth/register`
(`app/routers/auth.py`, `app/services/auth_service.py`), rate-limited to 3/minute per IP.

**Given** the user submits name, email, and password (no `city` field exists on `users` today, no
terms-acceptance flag is stored)\
**When** the backend validates the request\
**Then** email format is validated (`EmailStr`) and password strength is enforced — **stricter than
originally spec'd**: ≥8 and ≤128 chars, at least one uppercase, one lowercase, one digit, and one
special character (`app/schemas/_validators.py::validate_password_strength`), not just "8 chars + 1
number + 1 letter"\
**And** the user is created **immediately active** (`is_active=true`, role `citizen`) — there is
**no `pending_verification` status, no verification email, no email-verification pipeline at all**\
**And** the response is `201` with an `AuthResponse` (`accessToken`, `tokenType: "bearer"`, `user`)
— the user is logged in immediately on signup, not told to go verify their email

### Scenario · Email verification

**Status: ⬜ not implemented** — kept here as a known gap, not deleted, since email verification is
a reasonable follow-up for anti-fraud. No token table, no email-sending integration, and no `status`
column exists on `users` to represent `pending_verification`. If/when built, this scenario
description is still the intended target behavior.

### Scenario · Email login

**Status: ✅ built**, minus the refresh token — real endpoint is `POST /auth/login`, rate-limited to
5/minute per IP.

**Given** the user has an account (accounts are active immediately after registration — see above)\
**When** they submit email and password\
**Then** the backend verifies the password against its bcrypt hash, running bcrypt against a
precomputed dummy hash even when the email doesn't exist (constant-time, prevents user enumeration
via timing — see `DUMMY_PASSWORD_HASH` in `security.py`)\
**And** returns a new access token (60 minutes, HS256, `sub`/`role`/`iat`/`exp` claims) plus the
user object — **no refresh token is issued; none exists**\
**And** rejects Gov.br-only users (`hashed_password is None`) attempting password login\
**And does NOT** log the login event with IP/user agent — **no audit log table or logging of login
events exists yet**

### Scenario · Token refresh

**Status: ⬜ not implemented.** There is no `/auth/refresh` endpoint, no refresh token, no rotation.
`app/core/config.py` explicitly flags this as future work. Today, an expired 60-minute access token
means the user must log in again from scratch. Kept as the target design for when refresh tokens are
added — the client-side single-flight/rotation behavior described in `05-api-client.md` should not
be built against this backend until the endpoint exists.

### Scenario · Gov.br SSO

**Status: ⬜ not implemented, deferred** — see Context above. No `/auth/govbr/*` routes, no
OAuth/OIDC dependency, no CPF field on `users`. Do not start mobile PKCE/deep-link work for this
flow until the backend contract exists; email + password (above) is the only working method today.

### Scenario · Logout

**Status: ⬜ not implemented.** No `/auth/logout` endpoint exists on the backend, and since there's
no refresh token, there's nothing server-side to revoke — a "logout" today can only mean the client
discarding its local access token, and no client (mobile) exists to do even that yet. `apps/web`
approximates this today via `app/api/auth/logout/route.ts`, which just clears its own HttpOnly
cookie client-side without calling the backend.

### Scenario · Account deletion (LGPD)

**Status: 🟡 partially built, not LGPD-compliant yet.** `DELETE /users/{user_id}` exists
(`app/routers/users.py` → `user_service.delete_user`), but:

**Given** an admin (not the citizen themselves — there is no self-service `DELETE /auth/me`) calls
this endpoint with `user:edit` permission\
**Then** it soft-deletes the target (`deleted_at` set, `is_active=false`) — a user cannot delete
themselves (`user_id == current_user.id` is explicitly blocked, by design, to avoid an admin locking
themselves out via self-service)\
**But it does NOT**: anonymize PII (email/name are left intact, not nulled or hashed), send a
confirmation email, revoke any tokens (none exist to revoke), or write an audit-log entry (no audit
table exists)\
**This is a real compliance gap** against `CLAUDE.md`'s LGPD mandate — a citizen-facing self-service
deletion-with-anonymization flow still needs to be built before this can ship to citizens.

### Scenario · Brute force protection

**Status: 🟡 partially built, weaker than spec'd.** `slowapi` rate-limits `/auth/login` to 5/minute
per client IP (`get_remote_address`) and `/auth/register` to 3/minute, returning `429` (slowapi's
default handler; `Retry-After` header behavior comes from slowapi itself, not custom logic).
Confirmed via slowapi's own docs: the limiter is configured with no `storage_uri`, so it uses the
**default in-memory store** — single-process, not shared across replicas, and lost on restart. This
is not the "Redis-backed" limiter the original Definition of Done asked for. It is also a flat
per-IP rate limit, not a per-account failed-attempt counter, and there is no user notification on
suspicious attempts (no email integration, no audit log).

### Scenario · Password reset

**Status: ⬜ self-service flow not implemented.** What exists instead is
`POST /users/{user_id}/reset-password` (`app/routers/users.py`) — an **admin-only** endpoint
(requires the `admin` role, not a permission check) that force-sets a user's password directly, with
no token, no email, and no session invalidation (there are no sessions to invalidate — access tokens
just expire naturally at 60 minutes). The citizen-facing "email me a reset link" flow described
below is still the target design, not yet built:

**Given** the user forgot their password\
**When** they request a reset via email\
**Then** the backend sends a 1h-valid reset-token link\
**And** the link opens a screen to set a new password\
**And** all existing sessions are invalidated after the reset

## Frontend (React Native + Web)

**Status: ⬜ Not started on mobile.** `apps/city-hero/package.json` is still the stock Expo Router
template (Expo SDK 56) — no `expo-secure-store`, no HTTP client, no auth screens, no auth state
store exist yet. Everything in this section is the target design a future engineer should build
against the real backend contract described in **Backend** below. `apps/web` already solved its own
version of this independently (see Context) — not via a shared package, so don't assume
`packages/api_client` behavior exists just because the web login page works.

### Screens (covered separately)

- Login (email + password only for now — no Gov.br button until that backend work exists)
- Signup (form; no terms-acceptance checkbox needed yet since the backend doesn't store one — add it
  pre-emptively if legal requires it before the backend does)
- Forgot password — **blocked**: no backend endpoint exists yet (see Acceptance Criteria)
- Email verification feedback — **blocked**: no backend endpoint exists yet

### Token storage

- Mobile: **target is secure storage** (Keychain on iOS, Keystore on Android) via
  `expo-secure-store` — confirmed not yet a dependency. Per Expo's own docs, values are capped at
  2048 bytes and the API is unavailable on web, so any shared mobile+web token-storage abstraction
  needs a per-platform branch (`Platform.OS !== 'web'`) — a 60-minute JWT is well under the
  2048-byte limit today, so this is a coding-pattern concern, not a size concern.
- Web: HttpOnly + `SameSite=strict` cookies — **already working** in `apps/web`
  (`app/lib/session.ts`, `app/api/auth/login/route.ts`), 1-hour `maxAge` matching
  `ACCESS_TOKEN_EXPIRE_MINUTES`. This is a useful reference implementation, though it predates
  `packages/api_client` and doesn't use it.

### Auth state

A global state store tracks the current user, authentication status, and loading state. It exposes
operations to log in (email only, for now) and reload the user profile via `GET /users/me`. There is
no `refresh` operation to expose yet — a 401 today should be treated as a forced logout, not queued
for retry after refresh, since no refresh endpoint exists. The API client (foundation 05) plugs into
this state for token reads; there is no 401-triggered refresh flow to wire up until
`00-foundation/06-auth-system.md`'s backend gains a `/auth/refresh` endpoint.

### Gov.br OAuth flow (mobile)

**Deferred — do not build yet.** When the backend adds Gov.br support, use `expo-auth-session`
(confirmed current API via context7: `useAuthRequest` + `useAutoDiscovery` for OIDC discovery,
`AuthSession.exchangeCodeAsync` for the code exchange, PKCE by default over the deprecated implicit
flow) with a system-browser-backed flow. The redirect URI would be a custom scheme handled by the
deep-link handler (`00-foundation/12-deep-link-handler.md`). After the redirect, the backend would
exchange the code and return the app's local JWT — but none of `/auth/govbr/login`,
`/auth/govbr/callback`, or the OAuth client library exist today.

### Biometric unlock (optional)

Not started; still a reasonable target once basic login ships. After login, offer Face ID /
fingerprint to unlock subsequent app opens. The biometric setting is a stored flag — the password
itself is never stored in biometric-protected storage.

### What a mobile engineer can integrate against today

- `POST /auth/register` → `{ email, name, password }` → `201`
  `{ accessToken, tokenType: "bearer", user: { id, email, name, role, authProvider, isActive, avatarUrl, createdAt, deletedAt } }`
  (camelCase on the wire — see `CamelBase` in `app/schemas/base.py`). `409` on duplicate email,
  `422` on validation failure, `429` if >3/min from the same IP.
- `POST /auth/login` → `{ email, password }` → same `AuthResponse` shape. `401` on bad credentials
  (identical error for unknown email vs wrong password, by design). `429` if >5/min from the same
  IP.
- `GET /users/me` (Bearer token required) → `MeResponse`: all of `UserOut` plus `roleInfo` (`name`,
  `rank`, `isSuperuser`) and `capabilities` (`permissions`, `assignableRoles`, `manageableRoles`).
  `401` on missing/invalid/expired token.
- No refresh, no logout, no password reset, no Gov.br — build the login/register/me flow first and
  treat any 401 as "send the user back to the login screen."

## Backend (FastAPI)

### Endpoints — what actually exists (`app/routers/auth.py`, `app/routers/users.py`)

| Method | Path                         | Purpose                                                                           | Status                                                        |
| ------ | ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| POST   | `/auth/register`             | Create account (immediately active, auto-login)                                   | ✅ built, rate-limited 3/min/IP                               |
| POST   | `/auth/login`                | Email + password login                                                            | ✅ built, rate-limited 5/min/IP                               |
| GET    | `/users/me`                  | Get current user + role info + capabilities                                       | ✅ built                                                      |
| GET    | `/users`                     | List users (paginated, sortable, searchable, `?status=active\|inactive\|deleted`) | ✅ built, requires `user:read`                                |
| POST   | `/users`                     | Admin-create a user with a chosen role                                            | ✅ built, requires `user:create`, blocks privilege escalation |
| GET    | `/users/{id}`                | Get a user by id                                                                  | ✅ built, requires `user:read`                                |
| PATCH  | `/users/{id}`                | Update name/role/active — role change is admin-only                               | ✅ built, requires `user:edit`                                |
| POST   | `/users/{id}/reset-password` | Admin force-sets a user's password (no token/email)                               | ✅ built, admin role only                                     |
| POST   | `/users/{id}/restore`        | Undo a soft delete                                                                | ✅ built, requires `user:edit`                                |
| DELETE | `/users/{id}`                | Soft-delete a user (not LGPD anonymization)                                       | ✅ built, requires `user:edit`, self-delete blocked           |
| POST   | `/auth/logout`               | Invalidate the current refresh token                                              | ⬜ not built — nothing to revoke without refresh tokens       |
| POST   | `/auth/refresh`              | Rotate access + refresh tokens                                                    | ⬜ not built                                                  |
| POST   | `/auth/verify-email`         | Activate account from email link                                                  | ⬜ not built                                                  |
| POST   | `/auth/resend-verification`  | Resend verification email                                                         | ⬜ not built                                                  |
| POST   | `/auth/forgot-password`      | Send reset email                                                                  | ⬜ not built                                                  |
| POST   | `/auth/reset-password`       | Self-service reset from emailed token                                             | ⬜ not built (only the admin-forced variant above exists)     |
| DELETE | `/auth/me`                   | Self-service account deletion (LGPD)                                              | ⬜ not built                                                  |
| GET    | `/auth/govbr/login`          | Redirect to Gov.br OAuth                                                          | ⬜ not built, deferred                                        |
| GET    | `/auth/govbr/callback`       | Handle Gov.br callback                                                            | ⬜ not built, deferred                                        |

There is also a Strawberry GraphQL endpoint at `/graphql` (`app/graphql/schema.py`) exposing a `me`
query that mirrors `/users/me` via its own inline JWT-decode in `app/graphql/context.py`, and a
`health` query. No login/register mutation exists in GraphQL yet — only `Mutation.placeholder`, an
explicit stub. GraphQL introspection and GraphiQL are both disabled outside `DEBUG` mode (verified
against Strawberry's current FastAPI integration docs via context7 — the dict-based `context_getter`
pattern used in `context.py` matches current guidance).

### JWT structure (as built)

- Algorithm: HS256, decoded with an explicit `algorithms=["HS256"]` allow-list in both `security.py`
  and `graphql/context.py` — this matches PyJWT's current documented guidance (verified via
  context7) to always pass `algorithms=` explicitly rather than trusting the token's own header,
  which avoids algorithm-confusion attacks.
- Claims: `sub` (user UUID), `role`, `iat`, `exp`. **No city-scope claim** (no multi-tenant column
  exists yet — see Context), **no unique token ID** (`jti`), and **no refresh token** —
  access-token-only.
- `SECRET_KEY` is required at boot with no default and validated to be ≥32 chars
  (`app/core/config.py`), generated via `openssl rand -hex 32`.

### Password hashing

bcrypt, cost factor 12 (`bcrypt.gensalt(rounds=12)`) — matches the `pyca/bcrypt` project's own
current documentation (12-13 rounds recommended for production, verified via context7). A
precomputed dummy hash is checked on every login attempt so bcrypt always runs, defeating
timing-based user enumeration (see the dedicated test in `tests/test_auth_integration.py`).

### Security headers

⬜ **Not built.** `apps/backend/main.py` only registers `CORSMiddleware` and `SlowAPIASGIMiddleware`
— there is no HSTS, `X-Content-Type-Options`, or `Referrer-Policy` middleware. This is a real gap
against the original "Standard hardening" line and should be added before any production exposure.

## Database (PostgreSQL)

### Tables — as actually migrated (`apps/backend/alembic/versions/001-005`)

#### `users` (real — `001_baseline_users.py` + `004_users_add_role_id_fk.py`)

Actual columns, read from `app/models/user.py`: `id` (UUID PK, app-side `default=uuid.uuid4`, not
`gen_random_uuid()`), `email` (varchar(255), unique, indexed), `name` (varchar(255)),
`hashed_password` (varchar(255), nullable — nullable to support future Gov.br-only users),
`avatar_url` (varchar(512), nullable), `is_active` (boolean, default true), `role` (varchar(50),
default `citizen` — denormalized slug kept in sync with `role_id`), `auth_provider` (varchar(50),
default `email` — `"email"` \| `"govbr"`, though no code path ever sets `"govbr"` yet), `role_id`
(UUID FK → `roles.id`, nullable, indexed, `ON DELETE RESTRICT` — nullable "during transition" per
the model's own comment), `created_at` (timestamptz), `deleted_at` (timestamptz, nullable — soft
delete).

**Not present, contrary to the original spec below**: `city_id` (no multi-tenant scope on users at
all — a real gap flagged in Context), `cpf_hash`, a `status` enum (`is_active` + `deleted_at` cover
this instead), `email_verified_at`, `language`, `reputation`, `updated_at`. Adding any of these
later requires a new Alembic migration — never hand-edit the schema (per `CLAUDE.md`).

#### `roles`, `permissions`, `role_permissions` (real — `002_create_rbac_tables.py`, seeded by `003`)

`roles`: `id` UUID PK, `name` unique (`admin`, `mayor`, `secretary`, `dispatcher`, `field_team`,
`citizen`), `rank` int (lower = higher privilege), `is_superuser` bool. `permissions`: `id` UUID PK,
`name` unique (e.g. `user:read`, `report:assign`), `description`. `role_permissions`: composite PK
(`role_id`, `permission_id`), both `ON DELETE CASCADE`.

Loaded into an in-process dict cache (`app/core/rbac_cache.py`) at FastAPI startup via
`load_permission_cache` — not queried per-request. `005_seed_default_users.py` seeds one bootstrap
user per role from `APP_ADMIN`/`APP_ADMIN_PASSWORD`/`APP_USERS_PASSWORD` env vars.

#### `auth_refresh_tokens` — ⬜ not migrated, does not exist today

Kept here as the target schema for when refresh tokens are built (see Backend). No migration creates
this table; there is currently nothing to rotate or revoke. Target shape, unchanged from the
original plan: `id` (UUID PK), `user_id` (FK, cascading delete), `token_hash` (SHA-256 of the raw
token — never store raw tokens), `expires_at`, `revoked_at` (nullable), `rotated_to_id`
(self-reference to the next token in the rotation chain), `user_agent`, `ip`, `created_at`.

#### `auth_audit_log` — ⬜ not migrated, does not exist today

Kept here as the target schema for when login/logout/failed-login auditing is built (needed for both
the LGPD audit-trail requirement in `CLAUDE.md` and the brute-force scenario above). No migration
creates this table; none of the `auth.*` analytics events below are currently persisted server-side.
Target shape, unchanged: `id` (UUID PK), `user_id` (FK, set null on user deletion), `event`
(varchar(50): `login`, `logout`, `failed_login`, etc.), `ip`, `user_agent`, `metadata` (jsonb),
`occurred_at`, indexed on `(user_id, occurred_at desc)`.

## Edge Cases

- **User changes email**: ⬜ not applicable yet — there is no update-email endpoint at all, so
  re-verification-on-change doesn't apply.
- **Two devices logged in simultaneously**: ✅ works today, trivially — each login issues an
  independent 60-minute access token; there's no session table to conflict.
- **Rotation race**: ⬜ not applicable — no refresh tokens exist to rotate.
- **Gov.br returns minimal profile**: ⬜ not applicable — Gov.br isn't implemented.
- **CPF collision**: ⬜ not applicable — no CPF field exists.
- **Deleted user tries to log in**: ✅ handled — `login()` in `auth_service.py` filters on
  `User.deleted_at.is_(None)` and checks `user.is_active` before issuing a token; a soft-deleted or
  deactivated user gets the same generic 401 as a wrong password, by design, to avoid leaking
  account state to an attacker probing emails.
- **Refresh token reuse after rotation**: ⬜ not applicable — no refresh tokens exist yet.
- **Rate limiter storage is per-process (real, newly-flagged gap)**: because `slowapi`'s limiter
  here uses its default in-memory store (no `storage_uri` configured), running more than one backend
  replica behind a load balancer means each replica tracks its own 3/min and 5/min counters — a
  distributed attacker effectively gets a higher combined limit than intended. Not exploitable at
  today's single-replica scale, but should be fixed (e.g. `storage_uri="redis://..."`, per slowapi's
  own documented Redis backend) before any multi-replica production deploy.

## Privacy / LGPD

**Status: 🟡 partially met, real gaps remain** — this section stays applicable (LGPD is mandatory
per `CLAUDE.md`), but most items below are still targets, not shipped behavior:

- Explicit consent: ⬜ not implemented — `POST /auth/register` has no terms-acceptance field and no
  link to a terms/privacy-policy document. Needs a schema change (a required boolean or timestamp)
  plus product copy before citizen-facing signup ships.
- CPF as SHA-256 hash: ⬜ not applicable yet — no CPF field exists (Gov.br is deferred).
- Account deletion grace period: ⬜ not implemented — the soft-delete in `user_service.delete_user`
  has no anonymization step and no distinction between a 30-day grace window and permanent erasure;
  it's an admin action today, not a citizen self-service LGPD flow.
- Audit log retention: ⬜ not applicable — no audit log table exists to retain anything in.
- Email/name never logged in observability tools: ⚠️ unverified — no observability/Sentry
  integration exists yet in `apps/backend` to check against (see
  `00-foundation/20-observability-package.md`); revisit this line once that package lands.

See `security-baseline.md` for the broader baseline this task should eventually satisfy.

## Analytics

**Status: ⬜ not implemented** — none of these events are currently emitted or persisted;
`apps/backend` has no analytics/event-tracking integration yet (see
`00-foundation/14-analytics-tracking.md`). Kept as the target event catalog for when that lands;
`auth.token_refreshed` and `auth.logout` won't be emittable until refresh tokens and a logout
endpoint exist, respectively.

| Event                   | Where   | Props                                               |
| ----------------------- | ------- | --------------------------------------------------- |
| `auth.signup_started`   | Mobile  | `method: email \| govbr`                            |
| `auth.signup_succeeded` | Backend | `method`                                            |
| `auth.signup_failed`    | Both    | `reason`                                            |
| `auth.login_succeeded`  | Backend | `method`                                            |
| `auth.login_failed`     | Backend | `reason`                                            |
| `auth.token_refreshed`  | Backend | — (blocked: no refresh endpoint yet)                |
| `auth.logout`           | Both    | `voluntary: bool` (blocked: no logout endpoint yet) |
| `auth.account_deleted`  | Backend | —                                                   |

## Tests

**Status: 🟡 backend covered for what's built.** `apps/backend/tests/test_auth_integration.py` and
`test_security_unit.py` are real and passing today — they cover: password hashing (bcrypt salting,
constant-time verification, the timing-safe dummy hash), JWT
issuance/decoding/expiry/tamper/wrong-key rejection, `/auth/register` (password-strength rules,
duplicate email, no-password-leak-in-response), `/auth/login` (wrong password, unknown email,
identical 401 for both, SQL-injection attempts, JWT-in-response validity), and `/users/me` /
`/users/{id}` auth + permission checks. There is **no token-rotation test** (no rotation exists) and
**no brute-force-counter unit test** (the limiter is exercised only implicitly, not asserted against
in tests today).

- **Unit**: ✅ password hashing, JWT issuance + verification — done. ⬜ token rotation logic,
  brute-force counter — not applicable/not tested (features don't exist yet).
- **Integration**: ✅ register → login → `/users/me` end-to-end — done, with SQL-injection and
  timing-attack regression tests. ⬜ verify email → refresh → logout, Gov.br callback, account
  deletion anonymization — blocked on the corresponding endpoints not existing.
- **Security**: ✅ parameterized queries (SQLAlchemy `select()`, no raw SQL string interpolation),
  constant-time password verification — done. ⬜ refresh token reuse triggers family revocation —
  not applicable, no refresh tokens.
- **E2E**: ⬜ mobile signup happy path, login → protected screen → logout — blocked entirely: no
  mobile client exists to drive an E2E test against.

## Definition of Done

- [x] Core auth endpoints implemented — `/auth/register`, `/auth/login`, `/users/me` and full user
      CRUD/RBAC; **not** the full original list (no refresh/logout/verify/reset/Gov.br — see Backend
      table above for the exact split)
- [ ] Mobile auth state wired to the API client — blocked: neither the API client
      (`00-foundation/05-api-client.md`) nor any mobile auth screens exist yet
- [ ] Secure token storage on mobile, HttpOnly cookies on web — web half done (`apps/web`); mobile
      half not started (no `expo-secure-store` dependency)
- [ ] Gov.br OAuth tested end-to-end against the sandbox — deferred, not started (see Context)
- [ ] Email verification through SMTP (dev: MailHog; prod: SES or similar) — not started, no SMTP
      integration anywhere in `apps/backend`
- [ ] Password reset end-to-end — not started; only an admin-forced password overwrite exists
- [ ] LGPD deletion endpoint with 30-day grace — not started; current delete is an admin soft-delete
      with no anonymization or grace-period semantics
- [ ] Brute-force rate limit (Redis-backed) — partially done: slowapi rate-limits login/register by
      IP, but on the default in-memory store, not Redis — doesn't scale across replicas (see Edge
      Cases)
- [ ] Audit log populated — not started; no `auth_audit_log` table exists
- [ ] Security headers in middleware — not started; only CORS + rate-limit middleware are registered
- [x] Unit + integration tests ≥85% coverage **for what's built** — `test_auth_integration.py` and
      `test_security_unit.py` thoroughly exercise register/login/me and the security properties
      (timing, tampering, injection); coverage of the _not-built_ endpoints is necessarily absent
- [ ] Code review by a security-aware reviewer — recommended before this reconciliation is treated
      as final, given the LGPD and rate-limiting gaps called out above

## Standards & References

### Cross-cutting standards

- Security: `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references

Verified against current documentation via context7 on 2026-07-15 (see task report for the full list
of libraries checked; no deprecated patterns found in what's actually implemented):

- FastAPI (`/fastapi/fastapi`) — `HTTPBearer` dependency pattern in `security.py` matches current
  docs.
- PyJWT (`/jpadilla/pyjwt`) — https://pyjwt.readthedocs.io/ — explicit `algorithms=` on every
  `jwt.decode()` call (as used in `security.py` and `graphql/context.py`) matches current guidance
  to avoid algorithm-confusion attacks.
- bcrypt (`/pyca/bcrypt`) — https://github.com/pyca/bcrypt — cost factor 12 matches the project's
  own current "12-13 rounds for production" recommendation.
- slowapi (`/laurents/slowapi`) — https://slowapi.readthedocs.io/ — confirmed the limiter's default
  storage is in-memory unless `storage_uri` is set; Redis backend is documented and a drop-in
  change.
- Strawberry GraphQL (`/strawberry-graphql/strawberry`) — https://strawberry.rocks/docs — the
  dict-based `context_getter` pattern in `graphql/context.py` matches the current FastAPI
  integration guide.
- SQLAlchemy 2.0 async (`/websites/sqlalchemy_en_20`) — `async_sessionmaker` + asyncpg dialect usage
  matches current docs.
- Gov.br Developer Portal: https://manual-roteiro-integracao-login-unico.servicos.gov.br/ (unchanged
  — deferred feature, not re-verified since nothing consumes it yet)
- LGPD (Brazilian data protection law): Lei nº 13.709/2018
- Expo AuthSession (`/expo/expo`) — https://docs.expo.dev/versions/latest/sdk/auth-session/ —
  current docs confirm PKCE-based `useAuthRequest`/`useAutoDiscovery` + `exchangeCodeAsync` is still
  the recommended pattern (implicit flow is explicitly called out as deprecated); relevant once
  Gov.br work starts.
- expo-secure-store (`/expo/expo`) — confirmed current API (`setItemAsync`/`getItemAsync`),
  2048-byte value limit, and native-only (no web support) — relevant for mobile token storage once
  that work starts.

### Project context

- `CLAUDE.md`
