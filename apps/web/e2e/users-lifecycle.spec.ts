import { test, expect } from "@playwright/test";

import { AUTH_FILE } from "./global-setup";

// Reuse the admin session saved by global-setup — no extra /auth/login calls,
// keeping this file independent of the shared login rate-limit budget that
// auth.spec.ts already runs close to (see the note near the top of that file).
test.use({ storageState: AUTH_FILE });

const PROBE_PASSWORD = "E2eTest123!";

test.describe("User lifecycle: create, deactivate, delete, restore, reactivate", () => {
  test("walks a user through the full status lifecycle via the dashboard UI", async ({ page }) => {
    const email = `e2e-lifecycle-${Date.now()}@cityhero.com`;

    await page.goto("/users");
    await expect(page.getByRole("tablist")).toBeVisible();

    await test.step("create", async () => {
      await page.getByRole("button", { name: /Novo usuário/i }).click();
      await page.waitForSelector("#u-name");
      await page.fill("#u-name", "E2E Lifecycle Probe");
      await page.fill("#u-email", email);
      await page.fill("#u-password", PROBE_PASSWORD);

      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/users") && r.request().method() === "POST",
        ),
        page.getByRole("button", { name: /^Criar/ }).click(),
      ]);
      expect(response.status()).toBe(201);

      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("deactivate", async () => {
      await page
        .getByRole("row", { name: new RegExp(email) })
        .getByLabel("Editar usuário")
        .click();
      await expect(page.getByRole("checkbox", { name: "Usuário ativo" })).toBeChecked();
      await page.getByRole("checkbox", { name: "Usuário ativo" }).click();

      // The PATCH fires on "Salvar", not on the checkbox click itself.
      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "PATCH",
        ),
        page.getByRole("button", { name: "Salvar" }).click(),
      ]);
      expect(response.status()).toBe(200);

      await page.getByRole("tab", { name: /^Inativos/ }).click();
      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("soft-delete", async () => {
      await page
        .getByRole("row", { name: new RegExp(email) })
        .getByLabel("Excluir usuário")
        .click();

      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "DELETE",
        ),
        page.getByRole("button", { name: "Excluir", exact: true }).click(),
      ]);
      expect(response.status()).toBe(204);

      await page.getByRole("tab", { name: /^Deletados/ }).click();
      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("restore", async () => {
      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/restore") && r.request().method() === "POST",
        ),
        page
          .getByRole("row", { name: new RegExp(email) })
          .getByLabel("Restaurar usuário")
          .click(),
      ]);
      expect(response.status()).toBe(200);

      // This user was deactivated before being deleted above, so a correct
      // restore must bring it back to Inativos, not Ativos — see the
      // dedicated regression test in restore-status.spec.ts for the same
      // assertion at the API level.
      await page.getByRole("tab", { name: /^Deletados/ }).click();
      await expect(page.getByRole("row", { name: new RegExp(email) })).not.toBeVisible();

      await page.getByRole("tab", { name: /^Inativos/ }).click();
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
        await page.getByRole("tab", { name: /^Inativos/ }).click();
      }
      const row = page.getByRole("row", { name: new RegExp(email) });
      await expect(row).toBeVisible();
      await row.getByLabel("Editar usuário").click();

      const checkbox = page.getByRole("checkbox", { name: "Usuário ativo" });
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
      }

      // Submitting always fires a PATCH, whether or not the checkbox itself
      // changed above (e.g. restore already left it active).
      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "PATCH",
        ),
        page.getByRole("button", { name: "Salvar" }).click(),
      ]);
      expect(response.status()).toBe(200);

      await page.goto("/users");
      await expect(page.getByRole("row", { name: new RegExp(email) })).toBeVisible();
    });

    await test.step("cleanup: soft-delete the probe user", async () => {
      await page
        .getByRole("row", { name: new RegExp(email) })
        .getByLabel("Excluir usuário")
        .click();
      await Promise.all([
        page.waitForResponse(
          (r) => /\/api\/users\/[^/]+$/.test(r.url()) && r.request().method() === "DELETE",
        ),
        page.getByRole("button", { name: "Excluir", exact: true }).click(),
      ]);
    });
  });
});
