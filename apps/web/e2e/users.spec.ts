import { test, expect } from "@playwright/test";

import { AUTH_FILE } from "./global-setup";

// Reuse the admin session saved by global-setup. The seeded admin's stored
// `language` is en-US (migration 006's default) and, since PR #45, the login
// route syncs that into the `cityhero_language` cookie — so this session
// deterministically renders in English regardless of the runner's own OS/
// Accept-Language default. Before that fix, these assertions happened to
// pass or fail purely based on the test runner's own locale; if the seeded
// admin's default language ever changes, update the strings below to match.
test.use({ storageState: AUTH_FILE });

test.describe("Users page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    // Wait for the tablist to be visible — this ensures React hydration has
    // completed and all in-flight API requests (permissions, user list) have
    // finished before we interact with any elements.
    await expect(page.getByRole("tablist")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Users");
  });

  test("should display users list with tabs (Active/Inactive/Deleted)", async ({ page }) => {
    const tablist = page.getByRole("tablist");
    await expect(tablist).toBeVisible();

    // Use regex anchored at the start so "Active" does not accidentally match
    // "Inactive" (which contains "active" as a substring — Playwright's
    // getByRole does case-insensitive partial matching by default).
    await expect(page.getByRole("tab", { name: /^Active/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /^Inactive/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /^Deleted/ })).toBeVisible();
  });

  test("should switch between tabs and update URL param", async ({ page }) => {
    // Default tab is "active" — no ?tab= in URL
    expect(page.url()).not.toContain("tab=");

    // Click "Inactive" — use regex to avoid partial match with "Active"
    await page.getByRole("tab", { name: /^Inactive/ }).click();
    await page.waitForURL(/tab=inactive/);
    expect(page.url()).toContain("tab=inactive");

    // Click "Deleted"
    await page.getByRole("tab", { name: /^Deleted/ }).click();
    await page.waitForURL(/tab=deleted/);
    expect(page.url()).toContain("tab=deleted");

    // Back to "Active" — URL param should be removed
    await page.getByRole("tab", { name: /^Active/ }).click();
    await page.waitForURL((url) => !url.search.includes("tab="));
    expect(page.url()).not.toContain("tab=");
  });

  test("should search for a user by name", async ({ page }) => {
    // UserSearchBar renders an <input type="search" placeholder="Search by name or email...">
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill("admin");

    // Submit via the "Search" button (not Enter — the form's onSubmit handler
    // calls e.preventDefault() so Enter works too, but button is more explicit)
    await page.getByRole("button", { name: /^Search/ }).click();

    // Wait for the URL to reflect the query
    await page.waitForURL(/q=admin/);
    expect(page.url()).toContain("q=admin");
  });

  test("should open create user modal when clicking New user", async ({ page }) => {
    // The button is gated behind !permissionsLoading && canCreate.
    // networkidle in beforeEach ensures the permissions request has completed.
    const newUserButton = page.getByRole("button", { name: /New user/i });
    await expect(newUserButton).toBeVisible();

    await newUserButton.click();

    // The modal title should appear
    await expect(page.getByRole("dialog").getByText("New user")).toBeVisible();

    // Form fields inside the modal should be visible
    await expect(page.locator("#u-name")).toBeVisible();
    await expect(page.locator("#u-email")).toBeVisible();
    await expect(page.locator("#u-password")).toBeVisible();
    await expect(page.locator("#u-role")).toBeVisible();
    await expect(page.locator("#u-language")).toBeVisible();
  });

  test("should validate required fields in create user form", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /New user/i }).click();
    await page.waitForSelector("#u-name");

    // Click submit without filling anything
    await page.getByRole("button", { name: "Create", exact: true }).click();

    // page.$eval is Playwright's typed DOM-query API — it serializes the
    // typed callback and runs it inside the browser against the matched
    // element. It is NOT the global eval(); no arbitrary string is executed.
    const nameValid = await page.$eval("#u-name", (el) => (el as HTMLInputElement).validity.valid);
    expect(nameValid).toBe(false);
  });

  test("should display error when creating user with duplicate email", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /New user/i }).click();
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
      page.getByRole("button", { name: "Create", exact: true }).click(),
    ]);

    expect(response.status()).not.toBe(200);

    // UserFormModal surfaces errors via AlertMessage with role="alert". Filtered
    // to non-empty text because this Next.js version also renders its own
    // empty route-announcer div with role="alert" (id="__next-route-announcer__"),
    // which otherwise makes this locator ambiguous (strict-mode violation).
    const errorAlert = page.getByRole("alert").filter({ hasText: /\S/ });
    await expect(errorAlert).toBeVisible();
    const text = await errorAlert.textContent();
    expect(text?.trim()).toBeTruthy();
  });
});
