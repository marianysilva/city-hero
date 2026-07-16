import { defineConfig } from "@playwright/test";

// Visual regression against the *built* Storybook (not `storybook dev`), so
// snapshots are taken against the same static bundle CI/reviewers would ship.
// Run `npm run build-storybook` before `npm run test:visual`.
export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:6007",
  },
  webServer: {
    command: "npx http-server storybook-static -p 6007 -s",
    port: 6007,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
