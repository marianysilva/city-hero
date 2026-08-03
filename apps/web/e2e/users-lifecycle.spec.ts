import { test, expect } from "@playwright/test";

import { AUTH_FILE } from "./global-setup";

// Reuse the admin session saved by global-setup — no extra /auth/login calls,
// keeping this file independent of the shared login rate-limit budget that
// auth.spec.ts already runs close to (see the note near the top of that file).
// The seeded admin's stored `language` is en-US (migration 006's default),
// synced into the session cookie by the login route since PR #45 — see the
// matching note in users.spec.ts for why these assertions are in English.
test.use({ storageState: AUTH_FILE });

const PROBE_PASSWORD = "E2eTest123!";

test.describe("User lifecycle: create, deactivate, delete, restore, reactivate", () => {
  test("walks a user through the full status lifecycle via the dashboard UI", async ({ page }) => {
    const email = `e2e-lifecycle-${Date.now()}@cityhero.com`;

    await page.goto("/users");
    await expect(page.getByRole("tablist")).toBeVisible();

    await test.step("create", async () => {
      await page.getByRole("button", { name: /New user/i }).click();
      await page.waitForSelector("#u-name");
      await page.fill("#u-name", "E2E Lifecycle Probe");
      await page.fill("#u-email", email);
      await page.fill("#u-password", PROBE_PASSWORD);

      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/users") && r.request().method() === "POST",
        ),
        page.getByRole("button", { name: "Create", exact: true }).click(),
      ]);
      expect(response.status()).toBe(201);

      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("deactivate", async () => {
      await page
        .getByRole("row", { name: new RegExp(email) })
        .getByLabel("Edit user")
        .click();
      await expect(page.getByRole("checkbox", { name: "Active user" })).toBeChecked();
      await page.getByRole("checkbox", { name: "Active user" }).click();

      // The PATCH fires on "Save", not on the checkbox click itself.
      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "PATCH",
        ),
        page.getByRole("button", { name: "Save" }).click(),
      ]);
      expect(response.status()).toBe(200);

      await page.getByRole("tab", { name: /^Inactive/ }).click();
      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("soft-delete", async () => {
      await page
        .getByRole("row", { name: new RegExp(email) })
        .getByLabel("Delete user")
        .click();

      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "DELETE",
        ),
        page.getByRole("button", { name: "Delete", exact: true }).click(),
      ]);
      expect(response.status()).toBe(204);

      await page.getByRole("tab", { name: /^Deleted/ }).click();
      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("restore", async () => {
      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/restore") && r.request().method() === "POST",
        ),
        page
          .getByRole("row", { name: new RegExp(email) })
          .getByLabel("Restore user")
          .click(),
      ]);
      expect(response.status()).toBe(200);

      // This user was deactivated before being deleted above, so a correct
      // restore must bring it back to Inactive, not Active — see the
      // dedicated regression test in restore-status.spec.ts for the same
      // assertion at the API level.
      await page.getByRole("tab", { name: /^Deleted/ }).click();
      await expect(page.getByRole("row", { name: new RegExp(email) })).not.toBeVisible();

      await page.getByRole("tab", { name: /^Inactive/ }).click();
      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("reactivate via edit (idempotent — works whichever tab restore left the user in)", async () => {
      // Ask the API directly which tab the user is currently in, instead of
      // probing the UI with a non-retrying isVisible() check — that raced
      // against the page's own post-navigation data fetch and could see an
      // empty, not-yet-loaded table as "not on this tab".
      const check = await page.request.get(
        `/api/users?status=active&q=${encodeURIComponent(email)}`,
      );
      const { total: activeCount } = await check.json();

      await page.goto("/users");
      if (activeCount === 0) {
        await page.getByRole("tab", { name: /^Inactive/ }).click();
      }
      const row = page.getByRole("row", { name: new RegExp(email) });
      await expect(row).toBeVisible();
      await row.getByLabel("Edit user").click();

      const checkbox = page.getByRole("checkbox", { name: "Active user" });
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
      }

      // Submitting always fires a PATCH, whether or not the checkbox itself
      // changed above (e.g. restore already left it active).
      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "PATCH",
        ),
        page.getByRole("button", { name: "Save" }).click(),
      ]);
      expect(response.status()).toBe(200);

      await page.goto("/users");
      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("cleanup: soft-delete the probe user", async () => {
      await page
        .getByRole("row", { name: new RegExp(email) })
        .getByLabel("Delete user")
        .click();
      await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "DELETE",
        ),
        page.getByRole("button", { name: "Delete", exact: true }).click(),
      ]);
    });
  });

  test("round-trips a non-default language selection through create and edit", async ({ page }) => {
    const email = `e2e-language-${Date.now()}@cityhero.com`;

    await page.goto("/users");
    await expect(page.getByRole("tablist")).toBeVisible();

    await test.step("create with pt-BR selected", async () => {
      await page.getByRole("button", { name: /New user/i }).click();
      await page.waitForSelector("#u-name");
      await page.fill("#u-name", "E2E Language Probe");
      await page.fill("#u-email", email);
      await page.fill("#u-password", PROBE_PASSWORD);
      await page.selectOption("#u-language", "pt-BR");

      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/users") && r.request().method() === "POST",
        ),
        page.getByRole("button", { name: "Create", exact: true }).click(),
      ]);
      expect(response.status()).toBe(201);
      const created = await response.json();
      expect(created.language).toBe("pt-BR");

      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("edit modal is pre-filled with the stored language, not the default", async () => {
      await page
        .getByRole("row", { name: new RegExp(email) })
        .getByLabel("Edit user")
        .click();
      await page.waitForSelector("#u-language");

      expect(await page.locator("#u-language").inputValue()).toBe("pt-BR");
    });

    await test.step("cleanup: soft-delete the probe user", async () => {
      await page.getByRole("button", { name: "Cancel" }).click();
      await page
        .getByRole("row", { name: new RegExp(email) })
        .getByLabel("Delete user")
        .click();
      await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "DELETE",
        ),
        page.getByRole("button", { name: "Delete", exact: true }).click(),
      ]);
    });
  });
});
