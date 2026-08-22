import { expect, test } from "@playwright/test";

// The bottom nav + placeholder tab shell (03-bottom-nav-component, app-side
// wiring). Routes are directly reachable under expo-router on web, so these
// navigate straight to /home rather than driving the whole Splash->Login flow.
test.describe("Bottom navigation shell", () => {
  test("renders the nav (4 tabs + Camera FAB) on a root screen", async ({ page }) => {
    await page.goto("/home");

    await expect(page.getByTestId("nav-tab-home")).toBeVisible();
    await expect(page.getByTestId("nav-tab-feed")).toBeVisible();
    await expect(page.getByTestId("nav-tab-profile")).toBeVisible();
    await expect(page.getByTestId("nav-tab-more")).toBeVisible();
    await expect(page.getByTestId("nav-fab-camera")).toBeVisible();
    // Placeholder body confirms the screen itself rendered under the nav.
    await expect(page.getByText("This screen isn't implemented yet.")).toBeVisible();
  });

  test("switching tabs navigates and keeps the nav visible", async ({ page }) => {
    await page.goto("/home");

    await page.getByTestId("nav-tab-feed").click();
    await page.waitForURL(/\/feed/);
    await expect(page.getByTestId("nav-tab-feed")).toHaveAttribute("aria-selected", "true");

    await page.getByTestId("nav-tab-profile").click();
    await page.waitForURL(/\/profile/);
    await expect(page.getByTestId("nav-tab-profile")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("nav-fab-camera")).toBeVisible();
  });

  test("the More tab opens a sheet whose item navigates and dismisses it", async ({ page }) => {
    await page.goto("/home");

    await page.getByTestId("nav-tab-more").click();
    await expect(page.getByTestId("more-item-settings")).toBeVisible();

    await page.getByTestId("more-item-settings").click();
    await page.waitForURL(/\/settings/);
    // Sheet dismissed on select; the More tab is now the active one.
    await expect(page.getByTestId("more-item-settings")).toHaveCount(0);
    await expect(page.getByTestId("nav-tab-more")).toHaveAttribute("aria-selected", "true");
  });

  test("the Camera FAB opens the camera modal, which closes back to Home", async ({ page }) => {
    await page.goto("/home");

    await page.getByTestId("nav-fab-camera").click();
    await page.waitForURL(/\/camera/);
    // The camera modal has its own title + close control (it's presented over
    // the tab screen, so it carries no bottom nav of its own).
    await expect(page.getByText("Camera", { exact: true })).toBeVisible();
    await expect(page.getByTestId("placeholder-close")).toBeVisible();

    await page.getByTestId("placeholder-close").click();
    await page.waitForURL(/\/home/);
    await expect(page.getByTestId("nav-tab-home")).toBeVisible();
  });
});
