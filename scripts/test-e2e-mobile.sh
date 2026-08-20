#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# test-e2e-mobile.sh — run apps/city-hero's Playwright e2e suite.
#
# Unlike scripts/test-e2e.sh (apps/web), this doesn't need an isolated
# backend/database stack: the screens covered so far (Splash, Login) are
# pure UI with no backend calls (see docs/tasks/00-foundation/21-e2e-test-database.md
# for why that isolation exists over there — it doesn't apply here). Add it
# back if/when a screen under e2e coverage starts talking to the backend.
#
# Playwright's own `webServer` config (apps/city-hero/playwright.config.ts)
# boots a real `expo start --web` on :8082 (not the dev server's :8081, so
# this never collides with `./scripts/dev.sh mobile`), waits for it to be
# ready, runs the suite, and tears it down — no manual lifecycle needed here.
#
# Usage:
#   ./scripts/test-e2e-mobile.sh [playwright args...]
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/city-hero"

npx playwright test "$@"
