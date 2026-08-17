import { expect, test } from "@playwright/test";

// Boots the real Expo web bundler and loads the real route tree — this is
// the level a unit test (which mocks expo-router and renders <SplashScreen>
// in isolation) cannot reach. It exists specifically to catch bundler/route
// -level failures like the one that shipped once: a stray test file placed
// directly under app/ got scanned as a route by Expo Router and crashed the
// entire web bundle with "expect is not defined" — every unit test still
// passed, and the dev server 500'd on every route including "/".
test.describe("Splash screen", () => {
  test("loads at / and renders without crashing", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByTestId("splash-logo")).toBeVisible();
    await expect(page.getByText("CityHero")).toBeVisible();
  });

  test("shows the email and Gov.br sign-in CTAs, the privacy link, and a tagline", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByTestId("splash-cta-email")).toBeVisible();
    await expect(page.getByTestId("splash-cta-govbr")).toBeVisible();
    await expect(page.getByTestId("splash-privacy-link")).toBeVisible();
    await expect(page.getByTestId("splash-tagline")).toBeVisible();
  });

  test("renders the brand gradient background in light mode", async ({ page }) => {
    await page.goto("/");

    // expo-linear-gradient's web implementation renders as a real CSS
    // background-image, so the actual color stops are checkable here — not
    // just "some element is visible", which would also pass if the
    // light/dark ternary in SplashScreen.tsx were deleted entirely.
    await expect(page.getByTestId("splash-background")).toHaveCSS(
      "background-image",
      /rgb\(249, 115, 22\).*rgb\(234, 88, 12\).*rgb\(124, 58, 237\)/,
    );
  });

  test("renders the deep-slate gradient background in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    const response = await page.goto("/");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByTestId("splash-logo")).toBeVisible();
    await expect(page.getByTestId("splash-background")).toHaveCSS(
      "background-image",
      /rgb\(15, 23, 42\).*rgb\(30, 41, 59\)/,
    );
  });
});
