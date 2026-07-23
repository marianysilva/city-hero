# E2E test database · isolated stack, seed → run → drop

> **Type:** Foundation · Testing infra\
> **Screen(s):** N/A — applies to any Playwright e2e suite (today: `apps/web`; `apps/city-hero` has
> none yet)\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/17-docker-dev-environment.md`\
> **Status:** ✅ Done — `./scripts/test-e2e.sh` brings up `docker-compose.e2e.yml`'s isolated
> `db-e2e` (tmpfs-backed, port 5433) / `migrate-e2e` / `backend-e2e` (port 8001, same fast
> `LOGIN_RATE_LIMIT`/etc. as the dev override) trio, runs `apps/web`'s own dev server on its own
> port (3100) and `distDir` (`.next-e2e`, via `next.config.ts`'s `NEXT_DIST_DIR`) so it doesn't
> contend with a `next dev` the developer already has running for the same project directory
> (Next.js 16 locks `next dev` per-`distDir`, not per-port — discovered while implementing this),
> runs all of today's specs against it, then tears the whole stack down. Verified directly: ran the
> script three times back-to-back while a real `npm run dev`/`docker-compose.yml` dev stack was up
> and in use — all 15 specs passed every time, the dev database's row count was unchanged
> before/after (8 users, same 2 pre-existing leftover probe rows from before this task), the
> developer's own `:3000` dev server was never disturbed, and no e2e containers/networks were left
> behind. CI wiring itself is out of scope here — no workflow currently runs any e2e suite — but the
> script has no dependency on a pre-existing dev stack, so it's CI-ready as-is.\
> **Labels:** `foundation`, `backend`, `database`, `testing`

## Context

`apps/web`'s Playwright e2e suite (`apps/web/e2e/*.spec.ts`, added in the `feat/api-client-package`
branch alongside `packages/api_client`) currently runs against whatever dev stack is already up on
the developer's machine:

- `playwright.config.ts`'s `webServer` reuses the developer's own `npm run dev` on `:3000`
  (`reuseExistingServer: !process.env.CI`), which reads `apps/web/.env.local`'s `BACKEND_URL` —
  today, `http://localhost:8000`, the same backend container a developer manually clicks against.
- That backend's `DATABASE_URL` (root `.env`) points at the real dev database, `cityhero` — **not**
  the separate `cityhero_test` database `apps/backend`'s pytest suite already uses.

Running `npm run test:e2e` therefore creates, mutates, and deletes real rows in the developer's own
dev database — confirmed directly: a manual+automated testing pass on 2026-07-22 left throwaway
probe users (`e2e-lifecycle-*@cityhero.com`, `e2e-restore-bug-*@cityhero.com`, etc.) sitting in the
real `cityhero` database, mixed in with the Alembic-seeded
`admin@cityhero.com`/`mayor@cityhero.com`/ etc. accounts and anything the developer created by hand.
Two concrete problems:

1. **Pollution** — e2e runs leave test data behind in the same database used for manual QA/demoing.
2. **Contention** — e2e drives the _same running backend process_ a developer might be using at that
   moment (e.g. clicking through `/users` in a browser tab while `npm run test:e2e` runs), so the
   two can race on the same rows.

`apps/backend`'s own pytest suite already solves an adjacent problem the right way (see
`apps/backend/tests/conftest.py`): a dedicated `cityhero_test` database, `alembic upgrade head` /
`alembic downgrade base` bracketing the whole test session, and an autouse `_clean_tables` fixture
resetting between tests. That pattern doesn't port over unchanged, though — pytest talks to the
FastAPI app in-process via `httpx.ASGITransport` (no real server, no fixed `DATABASE_URL` for a
long-running process), while Playwright drives an **actually-running** `apps/web` dev server that
proxies to an **actually-running** backend container over real HTTP. Isolating the e2e run means
standing up a second backend+db pair, not just swapping an env var on the existing one (swapping the
developer's own running backend's `DATABASE_URL` would require restarting it, and would block them
from using their own dev environment for the duration of the e2e run).

Also relevant: `docker-compose.override.yml` already sets fast, dev-only rate-limit windows
(`LOGIN_RATE_LIMIT=5/10 second`, etc. — see `00-foundation/05-api-client.md`'s Status note) for the
same "don't make local iteration wait on production timings" reason this task exists for the
database. Whatever e2e-only compose overlay this task adds should carry the same values forward.

## User Story

**As a** developer running the e2e suite locally or in CI,\
**I want** Playwright tests to run against an isolated, disposable database that's freshly seeded
before each run and torn down after,\
**In order to** never pollute or depend on my own manual dev data, and get a reproducible suite
regardless of what's already in the shared dev database.

## Acceptance Criteria

### Scenario · Isolated stack

**Given** the e2e test command is invoked\
**When** it starts\
**Then** a dedicated Postgres database is created for e2e — never `cityhero`, the developer's real
dev database, and not necessarily reusing `cityhero_test` either (pytest's autouse `_clean_tables`
fixture and this suite's lifecycle shouldn't have to coordinate over a shared database)\
**And** a dedicated backend process/container connects to that database, distinct from the
developer's own `city-hero-backend-1`\
**And** `apps/web`'s e2e run talks to that dedicated backend, not `BACKEND_URL` from the developer's
`.env.local`

### Scenario · Web server isolation

**Given** the developer may already have `npm run dev` running on `:3000` for their own manual
testing\
**When** the e2e command starts its own web server\
**Then** it does not reuse the developer's `:3000` instance (which was started with the developer's
own `BACKEND_URL` baked in at process start and can't be safely retargeted without a restart)\
**And** it runs its own `apps/web` dev/build process on a different port, configured with
`BACKEND_URL` pointed at the dedicated e2e backend

### Scenario · Seeded fresh

**Given** the isolated e2e stack is starting\
**When** migrations run\
**Then** Alembic applies every migration, including `005_seed_default_users.py` (admin/mayor/
secretary/dispatcher/field_team/citizen), so `apps/web/e2e/global-setup.ts`'s admin login has the
known-good account it expects on every run\
**And** any data created during the run (throwaway probe users from `users-lifecycle.spec.ts`,
`restore-status.spec.ts`, `auth.spec.ts`, etc.) never carries over into the next run

### Scenario · Run

**Given** the isolated, seeded stack is healthy\
**When** `npx playwright test` runs against it\
**Then** all of today's specs (`auth.spec.ts`, `users.spec.ts`, `users-lifecycle.spec.ts`,
`restore-status.spec.ts`) pass unmodified in behavior — this task changes _what_ they run against,
not what they assert\
**And** the developer's own dev stack, if separately running, is completely unaffected — they can
keep using their own browser tab against their own data while the e2e run happens

### Scenario · Drop / teardown

**Given** the e2e run finished, pass or fail\
**When** teardown runs\
**Then** the dedicated database and any dedicated containers created for the run are removed\
**And** repeated local runs don't accumulate leftover containers, volumes, or disk usage

### Scenario · CI parity

**Given** CI has no persistent dev stack to protect in the first place\
**When** the e2e job runs there\
**Then** the same seed → run → drop lifecycle applies — CI and local behave identically, and neither
requires manual sequencing (starting the real dev stack first, remembering to stop it, etc.)

## Frontend (TypeScript)

- `apps/web/playwright.config.ts`: `webServer` and `use.baseURL` need to target the isolated stack's
  web server/port instead of unconditionally reusing `:3000`. Likely an env var (e.g.
  `E2E_WEB_URL`/`E2E_BACKEND_URL`) read here and threaded into `global-setup.ts`'s existing
  `baseURL` fallback logic, rather than hardcoding a second port everywhere.
- `apps/web/e2e/global-setup.ts`: already reads `TEST_ADMIN_EMAIL`/`TEST_ADMIN_PASSWORD` from the
  mapped `APP_ADMIN`/`APP_ADMIN_PASSWORD` — no change needed there as long as the isolated stack's
  `.env` seeds the same way.
- No changes expected to the spec files themselves (`auth.spec.ts`, `users.spec.ts`,
  `users-lifecycle.spec.ts`, `restore-status.spec.ts`) — they talk to `apps/web`'s BFF routes, which
  don't change shape based on which backend/database sits behind them.

## Backend (FastAPI)

- A dedicated backend service (e.g. `backend-e2e` in a new `docker-compose.e2e.yml` overlay,
  mirroring `docker-compose.override.yml`'s dev-only pattern) pointed at a dedicated database.
- Carry forward the fast rate-limit env vars from `docker-compose.override.yml` (`LOGIN_RATE_LIMIT`,
  `REGISTER_RATE_LIMIT`, `GRAPHQL_RATE_LIMIT` — see `00-foundation/05-api-client.md`) so e2e runs
  don't hit the real 5/minute production window either.
- Migration/seed step reuses the existing `migrate` service pattern (`docker-compose.yml`'s
  `migrate` target already runs `alembic upgrade head`, including the seed migration) against the
  new database instead of the dev one.

## Database

- A new database — e.g. `cityhero_e2e` — distinct from both `cityhero` (dev) and `cityhero_test`
  (pytest), to avoid any coordination between this suite's lifecycle and pytest's autouse
  `_clean_tables` fixture over a shared database.
- Teardown: drop the database (or, if using a dedicated `db-e2e` container, remove the container and
  its volume entirely) once the Playwright run exits, pass or fail.
- Alembic's existing `upgrade head` / `downgrade base` pair (already used by
  `apps/backend/tests/conftest.py`'s session-scoped fixture) is the natural mechanism for the seed
  step — no new migration-running code needed, just pointed at the new database.

## Edge Cases

- **Next.js's per-project dev-server lock is keyed on `distDir`, not port** (discovered during
  implementation, not anticipated when this task was written): Next.js 16 refuses to start a second
  `next dev` for the same project directory via a lockfile at `<distDir>/dev/lock`
  (`node_modules/next/dist/build/lockfile.js`) — running the isolated web server on a different port
  alone still hits "Another next dev server is already running." Fixed by giving the isolated run
  its own `distDir` (`next.config.ts` reads `NEXT_DIST_DIR` when set; `playwright.config.ts` sets it
  to `.next-e2e` only for the isolated run). Also required adding `.next-e2e/**` to
  `apps/web/eslint.config.mjs`'s ignores (same reason `.next/**` is already there) — otherwise
  ESLint lints the generated build output and produces thousands of unrelated errors.
- **Port collisions**: the isolated backend/db/web instances need different host ports than the
  developer's real dev stack (`8000`/`5432`/`3000`) so both can run simultaneously without conflict.
- **`.env` isolation**: the e2e overlay needs its own `DATABASE_URL`/`APP_ADMIN_PASSWORD`/etc.,
  separate from the root `.env` a developer already has configured — not read from the same file
  unconditionally, or a developer's real secrets end up seeding (or, worse, the e2e run silently
  falls back to the dev stack's values and connects to the wrong database).
- **CI without Podman/Colima**: whatever tooling this uses (`docker-compose`, `podman-compose`) must
  work the same way in CI as it does locally per `scripts/dev.sh`'s existing cross-platform
  handling.
- **Partial teardown on crash**: if the Playwright process itself crashes (not just a test failure),
  teardown should still run (e.g. via a wrapper script's trap/finally, not solely relying on
  Playwright's own lifecycle hooks).

## Privacy / LGPD

Not applicable — no photo/PII pipeline involved. The e2e database only ever holds synthetic seed
users and throwaway probe accounts (`e2e-*@cityhero.com`), never real citizen data.

## Analytics

Not applicable.

## Tests

- This task's own "test" is the e2e suite itself passing against the isolated stack — no new test
  framework needed, just retargeting the existing one.
- Add a smoke check (manual or scripted) confirming the developer's real `cityhero` database's row
  counts are unchanged before/after an e2e run, as the acceptance signal that isolation actually
  holds.

## Definition of Done

- [x] A dedicated e2e database, distinct from both `cityhero` (dev) and `cityhero_test` (pytest) —
      `db-e2e` / `cityhero_e2e` in `docker-compose.e2e.yml`, tmpfs-backed so there's nothing to
      explicitly drop
- [x] A dedicated backend (and, per the Web server isolation scenario, a dedicated `apps/web`
      process) pointed at that database — not the developer's own running dev stack — `backend-e2e`
      (port 8001) and `apps/web`'s own `next dev` on port 3100 with its own `distDir` (`.next-e2e`)
- [x] A single command (`./scripts/test-e2e.sh`, mirroring `scripts/dev.sh`'s style) handles the
      full seed → run → drop lifecycle
- [x] All of today's specs (`auth.spec.ts`, `users.spec.ts`, `users-lifecycle.spec.ts`,
      `restore-status.spec.ts`) pass unmodified in behavior against the isolated stack — 15/15, run
      three times back-to-back
- [x] Verified: running the e2e suite leaves the developer's own dev database and running dev
      servers completely untouched — dev DB row count identical before/after, `:3000` dev server
      never restarted, confirmed across 3 consecutive runs
- [ ] Works the same way in CI as locally — no CI workflow currently runs any e2e suite to verify
      this against; the script itself has no dependency on a pre-existing dev stack, so wiring a job
      in `.github/workflows/` is a small, separate follow-up whenever e2e in CI is wanted
- [x] Documented in `README.md` (root, alongside the `scripts/dev.sh` command table) and
      `apps/web/README.md`

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Prior art in this repo

- `apps/backend/tests/conftest.py` — the `cityhero_test` database + Alembic upgrade/downgrade +
  `_clean_tables` pattern this task's database lifecycle should draw from, adapted for a real
  running server instead of an in-process ASGI transport.
- `docker-compose.override.yml` — the existing dev-only overlay pattern (fast rate-limit windows,
  bind-mounted source) to mirror for an e2e-only overlay.
- `scripts/dev.sh` — the existing cross-platform (Windows/Linux, Podman-compatible) lifecycle script
  whose `start`/`stop`/`status` command style this task's seed/run/drop command should match.

### Project context

- `00-foundation/05-api-client.md` — the PR that introduced `apps/web/e2e/*` and the
  `LOGIN_RATE_LIMIT`/`REGISTER_RATE_LIMIT`/`GRAPHQL_RATE_LIMIT` env vars this task's overlay reuses.
- `00-foundation/17-docker-dev-environment.md`
- `CLAUDE.md`
