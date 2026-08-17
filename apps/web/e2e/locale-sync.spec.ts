import { test, expect } from "@playwright/test";

import { AUTH_FILE } from "./global-setup";

// This is the one spec that actually proves PR #45's core claim: a user's
// stored `language` drives their dashboard locale on login, not the browser/
// environment's own Accept-Language. Deliberately does NOT reuse
// users.spec.ts's `h1 -> "Users"` assertion as evidence of this — that
// assertion only proves the *admin* session (en-US) renders in English; it
// says nothing about whether a DIFFERENT user with a DIFFERENT stored
// language actually gets a different locale. Uses two independent sessions:
// - admin@cityhero.com (language: en-US, migration 006's default) via the
//   already-authenticated AUTH_FILE from global-setup — no extra login.
// - mayor@cityhero.com (language: pt-BR, migration 007) via one fresh UI
//   login — kept to a single extra /auth/login call to stay well under the
//   shared 5-per-window rate-limit budget documented in auth.spec.ts.
// TEST_USERS_PASSWORD (set by scripts/test-e2e.sh to match docker-compose.e2e.yml's
// seed value) takes priority; APP_USERS_PASSWORD is the dev-stack fallback for
// anyone invoking `playwright test` directly against an already-running dev stack.
const MAYOR_EMAIL = "mayor@cityhero.com";
const MAYOR_PASSWORD = process.env.TEST_USERS_PASSWORD ?? process.env.APP_USERS_PASSWORD ?? "";

// This file's alphabetical position runs it right after auth.spec.ts, whose
// last test deliberately exhausts the shared /auth/login rate-limit bucket
// (5 per 10s window — see that file's own note). One extra login here can
// land inside that same still-cooling-down window and get a real 429 that
// has nothing to do with this test's own behavior. Retry through it rather
// than assume file execution order or add inter-file coordination.
async function loginRetryingRateLimit(page: import("@playwright/test").Page) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await page.waitForTimeout(10_000);
    await page.goto("/login");
    await page.waitForSelector("#email");
    await page.fill("#email", MAYOR_EMAIL);
    await page.fill("#password", MAYOR_PASSWORD);

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/auth/login") && r.request().method() === "POST",
      ),
      page.click("#login-submit"),
    ]);
    if (response.status() !== 429) return response;
  }
  throw new Error("Login rate-limited on every retry");
}

test.describe("Locale sync on login", () => {
  test("admin (en-US) sees an English dashboard", async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();
    try {
      await page.goto("/users");
      await expect(page.getByRole("tablist")).toBeVisible();
      await expect(page.locator("h1")).toContainText("Users");
      await expect(page.getByRole("tab", { name: /^Active/ })).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("mayor (pt-BR) sees a Portuguese dashboard after logging in fresh", async ({ browser }) => {
    test.setTimeout(45000);
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      const response = await loginRetryingRateLimit(page);
      expect(response.status()).toBe(200);
      const { user } = await response.json();
      expect(user.language).toBe("pt-BR");

      await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 });
      await page.goto("/users");
      await expect(page.getByRole("tablist")).toBeVisible();

      // The behavior this whole PR exists to fix: same app, same code, a
      // DIFFERENT user, a DIFFERENT rendered locale — driven by the stored
      // `language` value, not by the runner's own OS/Accept-Language default.
      await expect(page.locator("h1")).toContainText("Usuários");
      await expect(page.getByRole("tab", { name: /^Ativos/ })).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
