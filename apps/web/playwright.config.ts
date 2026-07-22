import path from "path";

import { defineConfig } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Load root .env so APP_ADMIN / APP_ADMIN_PASSWORD are available.
// Tests then read them via TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD, falling
// back to the APP_ADMIN* vars so no credentials need to be hardcoded here.
loadEnv({ path: path.join(__dirname, "../../.env"), override: false });

// Map the project-wide seed vars to the test-specific names that test files
// reference, only when the test-specific names are not already set.
if (!process.env.TEST_ADMIN_EMAIL && process.env.APP_ADMIN) {
  process.env.TEST_ADMIN_EMAIL = process.env.APP_ADMIN;
}
if (!process.env.TEST_ADMIN_PASSWORD && process.env.APP_ADMIN_PASSWORD) {
  process.env.TEST_ADMIN_PASSWORD = process.env.APP_ADMIN_PASSWORD;
}

// scripts/test-e2e.sh sets these to run this suite's own apps/web dev server
// on its own origin, pointed at the isolated e2e backend — never the
// developer's own :3000/BACKEND_URL from .env.local (see
// docs/tasks/00-foundation/21-e2e-test-database.md). Falls back to the
// original :3000/:8000 pair for anyone invoking `playwright test` directly
// against an already-running dev stack. E2E_WEB_URL is the single source of
// truth for the isolated origin — the numeric port `next dev`'s PORT env var
// needs is parsed back out of it rather than tracked as a second variable.
const IS_ISOLATED_RUN = !!process.env.E2E_WEB_URL;
const BASE_URL = process.env.E2E_WEB_URL ?? "http://localhost:3000";
const WEB_PORT = new URL(BASE_URL).port || "3000";
const BACKEND_URL = process.env.E2E_BACKEND_URL ?? "http://localhost:8000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    browserName: "chromium",
    headless: true,
  },
  globalSetup: "./e2e/global-setup.ts",
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    // Isolated runs never reuse an existing process on this port: a leftover
    // server from a hard-killed prior run would still be wired to that run's
    // (now-torn-down) backend-e2e container, and silently reusing it would
    // surface as confusing connection failures instead of a clear port
    // conflict. Non-isolated (:3000) runs keep the original reuse behavior.
    reuseExistingServer: IS_ISOLATED_RUN ? false : !process.env.CI,
    timeout: 120000,
    env: {
      PORT: WEB_PORT,
      BACKEND_URL,
      // Distinct build-output dir so this instance's lockfile doesn't
      // collide with a `next dev` the developer already has running on
      // :3000 for the same project directory (see next.config.ts).
      ...(IS_ISOLATED_RUN ? { NEXT_DIST_DIR: ".next-e2e" } : {}),
    },
  },
});
