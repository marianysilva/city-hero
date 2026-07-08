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

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    headless: true,
  },
  globalSetup: "./e2e/global-setup.ts",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
