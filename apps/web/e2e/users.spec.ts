import { test, expect } from "@playwright/test";

import { AUTH_FILE } from "./global-setup";

// Reuse the admin session saved by global-setup
test.use({ storageState: AUTH_FILE });

test.describe("Users page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    // Wait for the tablist to be visible — this ensures React hydration has
    // completed and all in-flight API requests (permissions, user list) have
    // finished before we interact with any elements.
    await expect(page.getByRole("tablist")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Usuários");
  });

  test("should display users list with tabs (Ativos/Inativos/Deletados)", async ({ page }) => {
    const tablist = page.getByRole("tablist");
    await expect(tablist).toBeVisible();

    // Use regex anchored at the start so "Ativos" does not accidentally match
    // "Inativos" (which contains "ativos" as a substring — Playwright's
    // getByRole does case-insensitive partial matching by default).
    await expect(page.getByRole("tab", { name: /^Ativos/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /^Inativos/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /^Deletados/ })).toBeVisible();
  });

  test("should switch between tabs and update URL param", async ({ page }) => {
    // Default tab is "active" — no ?tab= in URL
    expect(page.url()).not.toContain("tab=");

    // Click "Inativos" — use regex to avoid partial match with "Ativos"
    await page.getByRole("tab", { name: /^Inativos/ }).click();
    await page.waitForURL(/tab=inactive/);
    expect(page.url()).toContain("tab=inactive");

    // Click "Deletados"
    await page.getByRole("tab", { name: /^Deletados/ }).click();
    await page.waitForURL(/tab=deleted/);
    expect(page.url()).toContain("tab=deleted");

    // Back to "Ativos" — URL param should be removed
    await page.getByRole("tab", { name: /^Ativos/ }).click();
    await page.waitForURL((url) => !url.search.includes("tab="));
    expect(page.url()).not.toContain("tab=");
  });

  test("should search for a user by name", async ({ page }) => {
    // UserSearchBar renders an <input type="search" placeholder="Buscar por nome ou e-mail...">
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill("admin");

    // Submit via the "Buscar" button (not Enter — the form's onSubmit handler
    // calls e.preventDefault() so Enter works too, but button is more explicit)
    await page.getByRole("button", { name: /^Buscar/ }).click();

    // Wait for the URL to reflect the query
    await page.waitForURL(/q=admin/);
    expect(page.url()).toContain("q=admin");
  });

  test("should open create user modal when clicking Novo usuário", async ({ page }) => {
    // The button is gated behind !permissionsLoading && canCreate.
    // networkidle in beforeEach ensures the permissions request has completed.
    const newUserButton = page.getByRole("button", { name: /Novo usuário/i });
    await expect(newUserButton).toBeVisible();

    await newUserButton.click();

    // The modal title should appear
    await expect(page.getByRole("dialog").getByText("Novo usuário")).toBeVisible();

    // Form fields inside the modal should be visible
    await expect(page.locator("#u-name")).toBeVisible();
    await expect(page.locator("#u-email")).toBeVisible();
    await expect(page.locator("#u-password")).toBeVisible();
    await expect(page.locator("#u-role")).toBeVisible();
  });

  test("should validate required fields in create user form", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Novo usuário/i }).click();
    await page.waitForSelector("#u-name");

    // Click submit without filling anything
    await page.getByRole("button", { name: /^Criar/ }).click();

    // page.$eval is Playwright's typed DOM-query API — it serializes the
    // typed callback and runs it inside the browser against the matched
    // element. It is NOT the global eval(); no arbitrary string is executed.
    const nameValid = await page.$eval("#u-name", (el) => (el as HTMLInputElement).validity.valid);
    expect(nameValid).toBe(false);
  });

  test("should display error when creating user with duplicate email", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Novo usuário/i }).click();
    await page.waitForSelector("#u-name");

    // Use the seeded admin email to trigger a duplicate-email error
    const adminEmail = process.env.TEST_ADMIN_EMAIL ?? "admin@cityhero.app";
    await page.fill("#u-name", "Duplicate Test");
    await page.fill("#u-email", adminEmail);
    await page.fill("#u-password", "Password123!");

    // Wait for the POST response so we assert after the API replies
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/users") && r.request().method() === "POST",
      ),
      page.getByRole("button", { name: /^Criar/ }).click(),
    ]);

    expect(response.status()).not.toBe(200);

    // UserFormModal surfaces errors via AlertMessage with role="alert"
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
    const text = await errorAlert.textContent();
    expect(text?.trim()).toBeTruthy();
  });
});
