import { defineConfig } from "@playwright/test";

// Splash and Login (the only two screens implemented so far) are pure UI —
// no backend calls — so unlike apps/web's e2e suite this doesn't need an
// isolated backend/database stack (see docs/tasks/00-foundation/21-e2e-test-database.md
// for why that exists over there). It only needs the Expo web bundler
// actually running and serving real routes, which is exactly the class of
// bug this suite exists to catch: Expo Router scans the whole `app/`
// directory as routes with no built-in exclusion for stray files (confirmed
// against the SDK 56 docs, which explicitly say not to put test files under
// `app/`) — a unit test with a mocked router can never see that class of
// failure, only an e2e test that boots the real bundler does.
//
// Runs on :8082, not the dev server's :8081, so this suite never collides
// with (or gets confused by) a `./scripts/dev.sh mobile` the developer
// already has running.
const PORT = 8082;
const BASE_URL = `http://localhost:${PORT}`;

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
    // Deterministic regardless of the host machine's OS locale — the app's
    // own locale-resolution logic (packages/i18n) reads the browser
    // locale via expo-localization, and specs assert on English strings.
    locale: "en-US",
    // Both screens are phone-only in production (no responsive breakpoints
    // in either) — running at Playwright's 1280x720 desktop default would
    // exercise a layout no real user sees. iPhone-class width/height.
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: `npx expo start --web --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // Cold Metro bundling for the whole app/web target is slow, especially
    // the first run — matches apps/web's own e2e webServer timeout.
    timeout: 120000,
    env: {
      // The actual (verified against @expo/cli's own env.js registry) flag
      // that suppresses Expo CLI's interactive dev-menu/QR prompts, which
      // would otherwise hang Playwright's webServer boot indefinitely.
      // EXPO_NONINTERACTIVE is not a real Expo CLI env var — do not add it
      // back without confirming it exists in @expo/cli/src/utils/env.ts.
      CI: "1",
    },
  },
});
