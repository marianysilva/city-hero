import { test, expect, request as playwrightRequest } from "@playwright/test";

import { AUTH_FILE } from "./global-setup";

// Credentials are loaded from the root .env via playwright.config.ts (APP_ADMIN /
// APP_ADMIN_PASSWORD → TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD). The fallback
// email matches the seed migration default; password has no fallback so the
// suite fails loudly rather than silently when the env is not configured.
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin@cityhero.app";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "";
// Matches playwright.config.ts's own BASE_URL derivation — scripts/test-e2e.sh
// (docs/tasks/00-foundation/21-e2e-test-database.md) runs this suite's web
// server on its own port, not :3000.
const BASE_URL = `http://localhost:${process.env.E2E_WEB_PORT ?? "3000"}`;
const PROBE_PASSWORD = "E2eTest123!";

// apps/backend/app/routers/auth.py rate-limits /auth/login to 5 requests per
// window, per IP — shared across every test in this file plus
// e2e/global-setup.ts's own login. The window is 1 minute in production, but
// docker-compose.override.yml sets LOGIN_RATE_LIMIT=5/10 second for local dev
// (see apps/backend/app/core/limiter.py), so in practice this budget resets
// every 10s here, not every 60s. The tests below are still ordered and
// budgeted to stay at or under 5 real /auth/login calls before the dedicated
// rate-limit test (last) deliberately exceeds it, so the suite behaves
// correctly either way — including against a backend that doesn't have the
// shorter dev window configured (e.g. CI). Setup calls for the
// deactivated/deleted-user tests reuse the admin session already saved by
// global-setup instead of logging in again, to avoid spending extra budget on
// non-login-related requests.
async function adminApiContext() {
  return playwrightRequest.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
}

// Auth tests run without stored auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login flow", () => {
  test("should redirect unauthenticated users to /login", async ({ page }) => {
    await page.goto("/users");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("should show validation error on empty form submit", async ({ page }) => {
    await page.goto("/login");
    await page.waitForSelector("#email");

    // HTML5 validation prevents submission with empty required fields.
    // Click submit and check the email field reports validity.
    await page.click('button[type="submit"]');

    // page.$eval is Playwright's typed DOM-query API — it serializes the
    // typed callback and runs it inside the browser against the matched
    // element. It is NOT the global eval(); no arbitrary string is executed.
    const emailValid = await page.$eval("#email", (el) => (el as HTMLInputElement).validity.valid);
    expect(emailValid).toBe(false);
  });

  test("should show error on wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.waitForSelector("#email");

    await page.fill("#email", "wrong@example.com");
    await page.fill("#password", "wrongpassword");

    // Use waitForResponse so we check the error message only after the API
    // responds — not before, which would race against elements in the DOM
    // that happen to share CSS classes with the error component.
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/auth/login") && r.request().method() === "POST",
      ),
      page.click('button[type="submit"]'),
    ]);

    expect(response.status()).not.toBe(200);

    // AlertMessage renders with role="alert" for the error variant. Filtered
    // to non-empty text because this Next.js version also renders its own
    // empty route-announcer div with role="alert" (id="__next-route-announcer__"),
    // which otherwise makes this locator ambiguous (strict-mode violation).
    const errorAlert = page.getByRole("alert").filter({ hasText: /\S/ });
    await expect(errorAlert).toBeVisible();
    const text = await errorAlert.textContent();
    expect(text?.trim()).toBeTruthy();
  });

  test("should reject login for a deactivated user with the same generic error", async ({
    request,
  }) => {
    const email = `e2e-inactive-${Date.now()}@cityhero.com`;
    const adminApi = await adminApiContext();
    try {
      const created = await adminApi.post("/api/users", {
        data: { email, name: "E2E Inactive Probe", password: PROBE_PASSWORD, role: "citizen" },
      });
      expect(created.ok()).toBeTruthy();
      const { id } = await created.json();

      const deactivated = await adminApi.patch(`/api/users/${id}`, {
        data: { isActive: false },
      });
      expect(deactivated.ok()).toBeTruthy();
    } finally {
      await adminApi.dispose();
    }

    // apps/backend/app/services/auth_service.py's login() rejects a disabled
    // account with the exact same generic 401 as a wrong password — asserting
    // on that literal message is what proves the backend isn't leaking
    // "this account exists but is disabled" to an unauthenticated caller.
    const attempt = await request.post("/api/auth/login", {
      data: { email, password: PROBE_PASSWORD },
    });
    expect(attempt.status()).toBe(401);
    expect((await attempt.json()).error).toBe("Invalid email or password");
  });

  test("should reject login for a soft-deleted user with the same generic error", async ({
    request,
  }) => {
    const email = `e2e-deleted-${Date.now()}@cityhero.com`;
    const adminApi = await adminApiContext();
    try {
      const created = await adminApi.post("/api/users", {
        data: { email, name: "E2E Deleted Probe", password: PROBE_PASSWORD, role: "citizen" },
      });
      expect(created.ok()).toBeTruthy();
      const { id } = await created.json();

      const deleted = await adminApi.delete(`/api/users/${id}`);
      expect(deleted.status()).toBe(204);
    } finally {
      await adminApi.dispose();
    }

    const attempt = await request.post("/api/auth/login", {
      data: { email, password: PROBE_PASSWORD },
    });
    expect(attempt.status()).toBe(401);
    expect((await attempt.json()).error).toBe("Invalid email or password");
  });

  // Merged from two previously separate tests ("should login successfully..."
  // and "should persist session across page reload") specifically to keep
  // this file's total /auth/login call count within the shared 5/minute
  // budget — see the note near the top of this file.
  test("should login successfully, redirect to dashboard, and persist session across reload", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForSelector("#email");

    await page.fill("#email", ADMIN_EMAIL);
    await page.fill("#password", ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // After login, middleware redirects to / (dashboard)
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 });
    expect(page.url()).not.toContain("/login");

    // Reload and verify we're still on the dashboard (not redirected to /login)
    await page.reload();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 10000 });
    expect(page.url()).not.toContain("/login");
  });

  // Must stay LAST in this file: deliberately exhausts the shared /auth/login
  // rate-limit bucket for this IP (5 per window — apps/backend/app/routers/
  // auth.py / LOGIN_RATE_LIMIT), which would otherwise make any login attempt
  // in a test that runs after it fail with 429 instead of whatever that test
  // expects.
  test("should return 429 after exceeding the login rate limit", async ({ request }) => {
    test.setTimeout(30000);

    // Every test above this one already spent part of this same window's
    // budget (plus one more from e2e/global-setup.ts's own login), so this
    // doesn't assume a fixed attempt count — it just keeps firing failed
    // attempts until the limiter kicks in, up to a generous bound.
    let status = 0;
    for (let attempt = 0; attempt < 10 && status !== 429; attempt++) {
      const res = await request.post("/api/auth/login", {
        data: { email: "rate-limit-probe@cityhero.com", password: "wrong-password" },
      });
      status = res.status();
    }

    expect(status).toBe(429);
  });
});
