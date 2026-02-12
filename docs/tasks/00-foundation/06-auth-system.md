# Auth System · Login + JWT + refresh + Gov.br SSO

> **Type:** Foundation · Authentication
> **Screen(s):** All authenticated flows (16, 28, anything user-specific)
> **Effort:** L (3-5 days)
> **Dependencies:** `00-foundation/05-api-client.md`, `00-foundation/01-monorepo-setup.md`, `00-foundation/17-docker-dev-environment.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `auth`, `security`, `lgpd`, `foundation`

## Context

Authentication system supporting two methods:

- **Email + password** (MVP fallback) — bcrypt-hashed, JWT-based.
- **Gov.br SSO** (Brazilian federal digital identity, OAuth2/OIDC) — preferred for users who already have a Gov.br account, since it proves real-person status.

Tokens are short-lived JWT access tokens combined with long-lived refresh
tokens (rotated on every use). Tokens are stored securely on the device
(secure storage on mobile, HttpOnly cookies on web). LGPD compliance is
mandatory: explicit consent at signup, account deletion on request, and an
audit trail for sensitive actions.

## User Story

### Email + password (MVP)

**As a** Citizen,
**I want** to create an account with email and password,
**In order to** start reporting issues immediately.

### Gov.br SSO (advanced)

**As a** Citizen with a Gov.br account,
**I want** to log in via Gov.br,
**In order to** prove I'm a real person without creating yet another account.

## Acceptance Criteria

### Scenario · Email signup

**Given** the user is on the signup screen
**When** they submit name, email, password, city, and accept the terms
**Then** the backend validates email format and password strength (min 8 chars, at least one number and one letter)
**And** creates a user with `pending_verification` status
**And** sends a verification email with a 24h-valid link
**And** returns a response indicating verification is required

### Scenario · Email verification

**Given** the user clicks the verification link
**When** the backend validates the token
**Then** the user status becomes `active`
**And** the user can now log in
**And** if the token is expired, the response indicates that and offers to resend

### Scenario · Email login

**Given** the user has an active account
**When** they submit email and password
**Then** the backend verifies the password against its bcrypt hash
**And** returns a new access token (≤60 minutes) and refresh token (≤30 days), plus the user object
**And** logs the login event with IP and user agent

### Scenario · Token refresh

**Given** the access token is expired
**When** the client requests a refresh
**Then** the backend validates the refresh token (single-use; rotation invalidates the old one)
**And** returns a new access/refresh pair
**And** if the refresh fails, the client treats it as a forced logout

### Scenario · Gov.br SSO

**Given** the user clicks "Login with Gov.br"
**When** they complete the OAuth/OIDC flow at gov.br
**Then** the backend receives the auth code, exchanges it for tokens, fetches the profile (CPF, name)
**And** creates or matches a local user (using a hashed CPF as the identifier)
**And** issues local JWT tokens
**And** the user lands on Home

### Scenario · Logout

**Given** the user is logged in
**When** they tap "Logout"
**Then** the client clears tokens from secure storage
**And** the backend invalidates the refresh token server-side
**And** the user is sent back to the login flow

### Scenario · Account deletion (LGPD)

**Given** the user requests account deletion
**When** the backend processes the request
**Then** PII fields are anonymized (nulled or replaced with hashes)
**And** reports are de-linked from the user but kept for the city's record
**And** all tokens are revoked
**And** a confirmation email is sent
**And** the deletion is recorded in the audit log

### Scenario · Brute force protection

**Given** an IP attempts 5 failed logins within 60 seconds
**When** the 6th attempt arrives
**Then** the backend returns 429 with `Retry-After`
**And** if the email belongs to a real user, that user is notified about suspicious attempts

### Scenario · Password reset

**Given** the user forgot their password
**When** they request a reset via email
**Then** the backend sends a 1h-valid reset-token link
**And** the link opens a screen to set a new password
**And** all existing sessions are invalidated after the reset

## Frontend (React Native + Web)

### Screens (covered separately)

- Login (email + password, Gov.br button)
- Signup (form, terms acceptance)
- Forgot password
- Email verification feedback

### Token storage

- Mobile: secure storage (Keychain on iOS, Keystore on Android).
- Web: HttpOnly + SameSite=strict cookies set by the backend.

### Auth state

A global state store tracks the current user, authentication status, and loading state. It exposes operations to log in (email/Gov.br), log out, refresh, and reload the user profile. The API client (foundation 05) plugs into this state for token reads and refresh on 401.

### Gov.br OAuth flow (mobile)

Use a system-browser-backed OAuth library with PKCE. The redirect URI is a custom scheme handled by the deep-link handler (`00-foundation/12-deep-link-handler.md`). After the redirect, the backend exchanges the code and returns the app's local JWT pair.

### Biometric unlock (optional)

After login, offer Face ID / fingerprint to unlock subsequent app opens. The biometric setting is a stored flag — the password itself is never stored in biometric-protected storage.

## Backend (FastAPI)

### Endpoints

| Method | Path                              | Purpose                                         |
|--------|-----------------------------------|-------------------------------------------------|
| POST   | `/auth/signup`                    | Create account                                  |
| POST   | `/auth/login`                     | Email + password login                          |
| POST   | `/auth/logout`                    | Invalidate the current refresh token            |
| POST   | `/auth/refresh`                   | Rotate access + refresh tokens                  |
| POST   | `/auth/verify-email`              | Activate account from email link                |
| POST   | `/auth/resend-verification`       | Resend verification email                       |
| POST   | `/auth/forgot-password`           | Send reset email                                |
| POST   | `/auth/reset-password`            | Set new password from reset token               |
| GET    | `/auth/me`                        | Get current user                                |
| DELETE | `/auth/me`                        | Account deletion (LGPD)                         |
| GET    | `/auth/govbr/login`               | Redirect to Gov.br OAuth                        |
| GET    | `/auth/govbr/callback`            | Handle Gov.br callback                          |

### JWT structure

- Algorithm: HS256.
- Claims include: subject (user UUID), issued-at, expiry, city scope, role, and a unique token ID.
- Refresh tokens are stored server-side and rotated on every use (single-use).

### Password hashing

bcrypt with a cost factor of at least 12.

### Security headers

Standard hardening: HSTS, X-Content-Type-Options, Referrer-Policy, etc.

## Database (PostgreSQL)

### Tables

#### `users`

| Column                 | Type           | Notes                                        |
|------------------------|----------------|----------------------------------------------|
| `id`                   | UUID PK        | `gen_random_uuid()`                          |
| `email`                | varchar unique | Required                                     |
| `password_hash`        | varchar        | Nullable for Gov.br-only users               |
| `name`                 | varchar        | Required                                     |
| `cpf_hash`             | varchar(64)    | Nullable, SHA-256 of CPF for Gov.br users    |
| `city_id`              | UUID FK        | Multi-tenant scope                           |
| `status`               | varchar        | `pending_verification`, `active`, `deleted`  |
| `email_verified_at`    | timestamptz    | Nullable                                     |
| `language`             | varchar(10)    | Default `pt-BR`                              |
| `reputation`           | int            | Default 50                                   |
| `created_at`           | timestamptz    |                                              |
| `updated_at`           | timestamptz    |                                              |
| `deleted_at`           | timestamptz    | Soft delete                                  |

Indexes on `city_id` and on `email` (where not deleted).

#### `auth_refresh_tokens`

| Column           | Type         | Notes                                           |
|------------------|--------------|-------------------------------------------------|
| `id`             | UUID PK      |                                                  |
| `user_id`        | UUID FK      | Cascading delete                                 |
| `token_hash`     | varchar(64)  | SHA-256 of the token; never store raw tokens     |
| `expires_at`     | timestamptz  |                                                  |
| `revoked_at`     | timestamptz  | Nullable                                         |
| `rotated_to_id`  | UUID FK      | Self-reference to the next token in the chain    |
| `user_agent`     | text         | For audit                                        |
| `ip`             | inet         | For audit                                        |
| `created_at`     | timestamptz  |                                                  |

Index on `user_id` where not revoked.

#### `auth_audit_log`

| Column         | Type         | Notes                                 |
|----------------|--------------|----------------------------------------|
| `id`           | UUID PK      |                                        |
| `user_id`      | UUID FK      | Set null on user deletion              |
| `event`        | varchar(50)  | `login`, `logout`, `failed_login`, etc.|
| `ip`           | inet         |                                        |
| `user_agent`   | text         |                                        |
| `metadata`     | jsonb        | Event-specific context                  |
| `occurred_at`  | timestamptz  |                                        |

Index on `(user_id, occurred_at desc)`.

## Edge Cases

- **User changes email**: requires re-verification of the new email; the old email remains valid for password reset for 30 days.
- **Two devices logged in simultaneously**: each has a separate refresh token; both stay valid.
- **Rotation race**: the client always uses the latest token; rotation is atomic.
- **Gov.br returns minimal profile**: missing optional fields are handled gracefully.
- **CPF collision**: shouldn't happen, but if it does, prevent automatic account merge — flag for manual review.
- **Deleted user tries to log in**: a clear error indicates the account is closed.
- **Refresh token reuse after rotation**: assume token theft — revoke the entire token family and force logout.

## Privacy / LGPD

- Explicit consent: terms acceptance is mandatory at signup, with links to the terms of use and privacy policy.
- CPF is stored as a SHA-256 hash, never as plaintext, and never returned via API.
- Account deletion has a 30-day grace period (soft delete) before full anonymization.
- Audit log retention: 5 years (per LGPD recommendation).
- Email, CPF, and name are never logged in observability tools (Sentry, APM) — use the user's UUID instead.

See `security-baseline.md` for the broader baseline.

## Analytics

| Event                          | Where     | Props                              |
|--------------------------------|-----------|-------------------------------------|
| `auth.signup_started`          | Mobile    | `method: email|govbr`              |
| `auth.signup_succeeded`        | Backend   | `method`                           |
| `auth.signup_failed`           | Both      | `reason`                           |
| `auth.login_succeeded`         | Backend   | `method`                           |
| `auth.login_failed`            | Backend   | `reason`                           |
| `auth.token_refreshed`         | Backend   | —                                  |
| `auth.logout`                  | Both      | `voluntary: bool`                  |
| `auth.account_deleted`         | Backend   | —                                  |

## Tests

- **Unit**: password hashing, JWT issuance + verification, token rotation logic, brute-force counter.
- **Integration**: signup → verify email → login → refresh → logout end-to-end; Gov.br callback with a mocked OAuth server; account deletion flow validates anonymization.
- **Security**: parameterized queries on email field; constant-time password verification; refresh token reuse triggers family revocation.
- **E2E**: mobile signup happy path; login → see protected screen → logout.

## Definition of Done

- [ ] All auth endpoints implemented
- [ ] Mobile auth state wired to the API client
- [ ] Secure token storage on mobile, HttpOnly cookies on web
- [ ] Gov.br OAuth tested end-to-end against the sandbox
- [ ] Email verification through SMTP (dev: MailHog; prod: SES or similar)
- [ ] Password reset end-to-end
- [ ] LGPD deletion endpoint with 30-day grace
- [ ] Brute-force rate limit (Redis-backed)
- [ ] Audit log populated
- [ ] Security headers in middleware
- [ ] Unit + integration tests ≥85% coverage
- [ ] Code review by a security-aware reviewer

## Standards & References

### Cross-cutting standards
- Security: `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references
- Gov.br Developer Portal: https://manual-roteiro-integracao-login-unico.servicos.gov.br/
- LGPD (Brazilian data protection law): Lei nº 13.709/2018
- Expo Auth Session: https://docs.expo.dev/versions/latest/sdk/auth-session/
- bcrypt: https://en.wikipedia.org/wiki/Bcrypt

### Project context
- `CLAUDE.md`
