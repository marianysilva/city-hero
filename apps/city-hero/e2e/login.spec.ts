import { expect, test } from "@playwright/test";

test.describe("Splash -> Login -> Splash navigation", () => {
  test("the email CTA on Splash navigates to /login", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("splash-cta-email").click();

    await page.waitForURL(/\/login/);
    await expect(page.getByText("Sign in to CityHero")).toBeVisible();
  });

  test("the back button on Login returns to /", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-back-button")).toBeVisible();

    await page.getByTestId("login-back-button").click();

    // expo-router's client-side back navigation doesn't fire a "load" event
    // (no full page reload), so page.waitForURL()'s default waitUntil never
    // resolves — assert on the resulting content instead, which is also the
    // more direct read of the AC ("back button returns to Splash").
    await expect(page.getByTestId("splash-logo")).toBeVisible();
  });
});

test.describe("Login screen", () => {
  test("loads at /login and renders the form", async ({ page }) => {
    const response = await page.goto("/login");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText("Sign in to CityHero")).toBeVisible();
    await expect(page.getByPlaceholder("you@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByText("Create now")).toBeVisible();
  });

  test("toggles password visibility between masked and plain text", async ({ page }) => {
    await page.goto("/login");
    const password = page.getByPlaceholder("••••••••");
    await password.fill("hunter2");

    await expect(password).toHaveAttribute("type", "password");
    await expect(page.getByLabel("Show password")).toBeVisible();

    await page.getByTestId("login-password-toggle").click();

    // react-native-web renders secureTextEntry=false by omitting `type`
    // entirely (relying on the HTML default of type=text) rather than
    // writing type="text" explicitly — assert it's no longer masked, not
    // that a literal "text" attribute value exists.
    await expect(password).not.toHaveAttribute("type", "password");
    await expect(password).toHaveValue("hunter2");
    await expect(page.getByLabel("Hide password")).toBeVisible();

    await page.getByTestId("login-password-toggle").click();
    await expect(password).toHaveAttribute("type", "password");
  });

  test('pressing "Next" on the email field moves focus to the password field', async ({ page }) => {
    await page.goto("/login");
    const email = page.getByPlaceholder("you@email.com");
    const password = page.getByPlaceholder("••••••••");

    await email.fill("citizen@example.com");
    await email.press("Enter");

    await expect(password).toBeFocused();
  });

  test("renders the white-to-brand-50 background in light mode", async ({ page }) => {
    await page.goto("/login");

    // expo-linear-gradient's web implementation renders as a real CSS
    // background-image, so the actual color stops are checkable here — not
    // just "some element is visible", which would also pass if the
    // light/dark ternary in LoginScreen.tsx were deleted entirely.
    await expect(page.getByTestId("login-background")).toHaveCSS(
      "background-image",
      /rgb\(255, 255, 255\).*rgb\(255, 247, 237\)/,
    );
  });

  test("renders the deep-slate background in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    const response = await page.goto("/login");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText("Sign in to CityHero")).toBeVisible();
    await expect(page.getByPlaceholder("you@email.com")).toBeVisible();
    await expect(page.getByTestId("login-background")).toHaveCSS(
      "background-image",
      /rgb\(15, 23, 42\).*rgb\(30, 41, 59\)/,
    );
  });
});
