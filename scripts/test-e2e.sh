#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# test-e2e.sh — run apps/web's Playwright e2e suite against an isolated,
# disposable stack (docker-compose.e2e.yml), never the developer's own dev
# database or dev servers.
#
# See docs/tasks/00-foundation/21-e2e-test-database.md for the problem this
# solves: the suite used to run against docker-compose.yml's real `cityhero`
# database and reuse the developer's own `npm run dev` on :3000, polluting
# dev data and racing with any manual testing happening at the same time.
#
# Lifecycle: bring up db-e2e -> migrate-e2e -> backend-e2e (own ports, own
# database) -> start apps/web's own dev server on its own port, pointed at
# backend-e2e -> run Playwright -> tear the whole e2e stack down again,
# whether the tests passed or failed. Any extra arguments are passed through
# to `playwright test` (e.g. `./scripts/test-e2e.sh --headed auth.spec.ts`).
#
# Usage:
#   ./scripts/test-e2e.sh [playwright args...]
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BOLD='\033[1m'
RESET='\033[0m'
GREEN='\033[32m'
CYAN='\033[36m'
RED='\033[31m'

E2E_COMPOSE=(docker-compose -f docker-compose.e2e.yml)
# Single source of truth for the isolated web server's origin — exported so
# docker-compose.e2e.yml's ALLOWED_ORIGINS substitution sees the same value
# playwright.config.ts targets, whether or not the caller overrides the
# default.
export E2E_WEB_URL="${E2E_WEB_URL:-http://localhost:3100}"
E2E_BACKEND_URL="http://localhost:8001"
# Must match docker-compose.e2e.yml's migrate-e2e/backend-e2e seed vars.
E2E_ADMIN_EMAIL="admin@cityhero.com"
E2E_ADMIN_PASSWORD="e2e-admin-pass-123"
# Shared password for every non-admin seed user (mayor, secretary, dispatcher,
# field_team, citizen) — see migrate-e2e's APP_USERS_PASSWORD.
E2E_USERS_PASSWORD="e2e-users-pass-123"

wait_for_url() {
  local url="$1" label="$2" timeout="${3:-60}"
  printf "  Waiting for %s" "$label"
  local n=0
  until curl -sf "$url" > /dev/null 2>&1; do
    n=$((n + 1))
    if [ "$n" -ge "$timeout" ]; then
      echo ""
      echo -e "${RED}  x $label did not become ready after ${timeout}s${RESET}"
      return 1
    fi
    printf "."
    sleep 1
  done
  echo -e " ${GREEN}ready${RESET}"
}

cleanup() {
  # Run from $ROOT explicitly — a trap fires in whatever directory the shell
  # happens to be in when the script exits, and the compose file only exists
  # at the repo root, not inside apps/web (where the playwright run below
  # needs to invoke `npm`/`npx` from).
  echo -e "${RED}==> Tearing down e2e stack${RESET}"
  (cd "$ROOT" && "${E2E_COMPOSE[@]}" down -v --remove-orphans) || true
}
trap cleanup EXIT

echo -e "${CYAN}${BOLD}==> Starting isolated e2e stack (db-e2e, migrate-e2e, backend-e2e)${RESET}"
"${E2E_COMPOSE[@]}" up -d --build db-e2e
# Build and start one at a time, same as scripts/dev.sh's dev stack — starting
# migrate-e2e and backend-e2e together can race on the image build.
"${E2E_COMPOSE[@]}" up -d --build migrate-e2e
"${E2E_COMPOSE[@]}" up -d --build backend-e2e
wait_for_url "${E2E_BACKEND_URL}/docs" "e2e backend" 60

echo -e "${CYAN}${BOLD}==> Running Playwright against ${E2E_WEB_URL} (backend: ${E2E_BACKEND_URL})${RESET}"
(
  cd "$ROOT/apps/web"
  E2E_WEB_URL="$E2E_WEB_URL" \
  E2E_BACKEND_URL="$E2E_BACKEND_URL" \
  TEST_ADMIN_EMAIL="$E2E_ADMIN_EMAIL" \
  TEST_ADMIN_PASSWORD="$E2E_ADMIN_PASSWORD" \
  TEST_USERS_PASSWORD="$E2E_USERS_PASSWORD" \
    npx playwright test "$@"
)
