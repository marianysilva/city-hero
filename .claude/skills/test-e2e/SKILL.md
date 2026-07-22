---
name: test-e2e
description: Run apps/web's Playwright e2e suite against the isolated, disposable stack (docker-compose.e2e.yml + scripts/test-e2e.sh) and correctly interpret the results. Use whenever the user asks to run e2e tests, run Playwright tests, verify the e2e suite, or check whether apps/web's login/users flows still work end-to-end. Do NOT run `npm run test:e2e` / `npx playwright test` directly against the dev stack — that bypasses the isolation this skill exists for (see docs/tasks/00-foundation/21-e2e-test-database.md) and pollutes the real dev database.
---

# Run e2e tests (isolated stack)

`apps/web/e2e/*.spec.ts` must run against the disposable stack in `docker-compose.e2e.yml`, never
against `docker-compose.yml`'s real dev database (`cityhero`) or the developer's own `npm run dev`.
See `docs/tasks/00-foundation/21-e2e-test-database.md` for why: before this existed, every e2e run
created/mutated/deleted real rows in the shared dev database and could race with a developer's own
manual testing.

## Running it

From the repo root:

```bash
./scripts/test-e2e.sh
```

Extra arguments pass straight through to `playwright test`:

```bash
./scripts/test-e2e.sh auth.spec.ts              # one file
./scripts/test-e2e.sh --headed users.spec.ts    # watch it in a real browser window
./scripts/test-e2e.sh --grep "restore"          # filter by test title
```

This brings up `db-e2e` (tmpfs Postgres, port `5433`) → `migrate-e2e` (Alembic, seeds the same
admin/mayor/secretary/dispatcher/field_team/citizen accounts as the dev stack) → `backend-e2e`
(port `8001`), starts `apps/web`'s own dev server on port `3100` with its own build dir
(`.next-e2e`), runs Playwright, then tears the whole stack down — pass or fail, via a shell `trap`.
It is safe to run while `make start` / `./scripts/dev.sh start` is already up: distinct ports
(`5433`/`8001`/`3100` vs `5432`/`8000`/`3000`) and a distinct Compose project name
(`cityhero-e2e`) keep the two stacks fully separate.

First run of a session is slower (fresh Docker image builds + a cold Turbopack build for
`.next-e2e`); subsequent runs reuse cached layers and are fast (~15-25s total).

## Reading the results — read this before reporting anything as failed

The list reporter prints one line per test with `✓` or `✘`, but **`✘` alone does not mean the
suite is broken.** `apps/web/e2e/restore-status.spec.ts` intentionally uses `test.fail()` to pin a
regression — if that test's own assertion fails (the correct, current behavior), Playwright prints
`✘` for it but does **not** count it in the failure summary, because that's the expected outcome.
The only things that mean something is actually wrong:

1. The final `N failed` block, listing specific test names — only these are real failures.
2. The overall run summary line does **not** say `NN passed (Ns)` cleanly, or the script's own exit
   code is non-zero for a reason other than an expected `test.fail()`.

A healthy run today (15 specs) ends with `15 passed (~20s)` and no `N failed` block, even though
`restore-status.spec.ts`'s line shows `✘`. Don't "fix" that test or report it as a regression without
first checking whether it's still using `test.fail()` — if `apps/web/app/services/user_service.py`'s
restore-preserves-status behavior were to regress again, that same test would flip to passing
unexpectedly, which Playwright reports as its own failure (the cue to remove `test.fail()`, not add
it back).

## If a test genuinely fails

1. Read the printed block first — file:line, expected vs. received, and often a `strict mode
   violation` or timeout explanation are enough on their own.
2. Check the `Error Context: test-results\...\error-context.md` path Playwright prints under a
   failure — it's an accessibility-tree snapshot of the page at the moment of failure, useful when
   the printed error alone doesn't explain what was actually on screen.
3. Re-run just that spec with `--headed` to watch it interactively:
   `./scripts/test-e2e.sh --headed <file>.spec.ts`.
4. If the failure looks environmental rather than a real regression (timeouts on every test, "port
   already in use", connection refused) — see Troubleshooting below before assuming the app broke.

## Verifying isolation actually held (only if asked, or something looks off)

The whole point of this stack is that it never touches the real dev database. To double-check:

```bash
# Before a run
podman exec city-hero-db-1 psql -U cityhero -d cityhero -t -c "select count(*) from users;"
./scripts/test-e2e.sh
# After — should be the exact same number
podman exec city-hero-db-1 psql -U cityhero -d cityhero -t -c "select count(*) from users;"
```

(`city-hero-db-1` is the dev stack's container name from `docker-compose.yml`, not `db-e2e`.) Also
confirm no e2e containers are left running: `podman ps -a --filter "name=cityhero-e2e"` should
print nothing after the script exits.

## Troubleshooting

- **Leftover `cityhero-e2e-*` containers from a killed/crashed run**: the `trap`-based teardown only
  fires on a normal exit. If the script was hard-killed, clean up manually:
  ```bash
  docker-compose -f docker-compose.e2e.yml down -v --remove-orphans
  ```
- **"port already in use" for `5433`/`8001`/`3100`**: almost always a stale container from the case
  above, not a real conflict with the dev stack (which uses `5432`/`8000`/`3000`). Check
  `podman ps -a --filter "name=cityhero-e2e"` and remove it per the command above before retrying.
- **"Another next dev server is already running"**: this should not happen — `next.config.ts` gives
  the isolated run its own `distDir` (`.next-e2e`) specifically so it doesn't collide with a
  developer's `:3000` dev server's lockfile. If it does happen, check that
  `playwright.config.ts`'s `webServer.env` still sets `NEXT_DIST_DIR` and that `next.config.ts`
  still reads it — this was a real Next.js 16 behavior discovered building this stack (locks
  `next dev` per build-output directory, not per port).
- **Docker/Podman not running at all**: `./scripts/test-e2e.sh` will fail immediately on the first
  `docker-compose ... up`. Start the container runtime (Colima on macOS, Podman Desktop on Windows)
  first — this script does not start it for you, unlike `./scripts/dev.sh`'s Colima-awareness on
  macOS.

## What NOT to do

- Don't run `cd apps/web && npm run test:e2e` or `npx playwright test` directly as the way to
  "quickly check" something — that script's `playwright.config.ts` defaults to `:3000`/`:8000`,
  the developer's real dev stack, exactly the pollution this skill exists to avoid. Only reach for
  the raw command if you've deliberately kept an isolated stack up yourself and know exactly what
  it's pointed at.
- Don't report `restore-status.spec.ts` showing `✘` as a failure without checking the final
  `N passed`/`N failed` summary first.
- Don't add a new probe/throwaway user's email without a unique suffix (the existing specs use
  `` `e2e-<purpose>-${Date.now()}@cityhero.com` ``) — collisions across runs surface as confusing
  409 "duplicate email" failures that have nothing to do with what's actually being tested.
