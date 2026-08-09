import { ThemeProvider } from "@city-hero/design-system";
import { LocaleProvider } from "@city-hero/i18n";
import { render, screen, userEvent } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";

import { LoginScreen } from "./LoginScreen";

function renderLoginScreen(
  props: Partial<React.ComponentProps<typeof LoginScreen>> = {},
  preference: "light" | "dark" = "light",
) {
  return render(
    <ThemeProvider initialPreference={preference}>
      <LocaleProvider initialLocale="en-US">
        <LoginScreen {...props} />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

test("renders the header, the form, and the create-account link", async () => {
  await renderLoginScreen();

  expect(screen.getByText("Sign in to CityHero")).toBeTruthy();
  expect(screen.getByPlaceholderText("you@email.com")).toBeTruthy();
  expect(screen.getByText("Create now")).toBeTruthy();
});

test("calls onBack when the back button is pressed", async () => {
  const user = userEvent.setup();
  const onBack = jest.fn();
  await renderLoginScreen({ onBack });

  await user.press(screen.getByTestId("login-back-button"));

  expect(onBack).toHaveBeenCalledTimes(1);
});

test('labels the back button "Back" for screen readers', async () => {
  await renderLoginScreen();

  expect(screen.getByLabelText("Back")).toBeTruthy();
});

test("announces the composed heading for screen readers on mount", async () => {
  const announceSpy = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
  await renderLoginScreen();

  expect(announceSpy).toHaveBeenCalledWith("Sign in to CityHero. Sign in to report and track");

  announceSpy.mockRestore();
});

test("logs login.screen_viewed with the source on mount", async () => {
  const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
  await renderLoginScreen({ source: "deep_link" });

  expect(infoSpy).toHaveBeenCalledWith(
    expect.stringContaining("login.screen_viewed"),
    expect.objectContaining({ source: "deep_link" }),
  );

  infoSpy.mockRestore();
});

test("logs login.forgot_tapped and calls onForgotPassword when the link is pressed", async () => {
  const user = userEvent.setup();
  const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
  const onForgotPassword = jest.fn();
  await renderLoginScreen({ onForgotPassword });

  await user.press(screen.getByText("Forgot my password"));

  expect(onForgotPassword).toHaveBeenCalledTimes(1);
  expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("login.forgot_tapped"), undefined);

  infoSpy.mockRestore();
});

test("logs login.create_tapped and calls onCreateAccount when the link is pressed", async () => {
  const user = userEvent.setup();
  const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
  const onCreateAccount = jest.fn();
  await renderLoginScreen({ onCreateAccount });

  await user.press(screen.getByTestId("login-create-account"));

  expect(onCreateAccount).toHaveBeenCalledTimes(1);
  expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("login.create_tapped"), undefined);

  infoSpy.mockRestore();
});

test("propagates the typed email and password from the composed form to onSubmit", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  await renderLoginScreen({ onSubmit });

  await user.type(screen.getByPlaceholderText("you@email.com"), "citizen@example.com");
  await user.type(screen.getByPlaceholderText("••••••••"), "hunter2");
  await user.press(screen.getByText("Sign in"));

  expect(onSubmit).toHaveBeenCalledWith("citizen@example.com", "hunter2");
});

// RN's jest environment resolves LinearGradient's `colors` through
// processColor, turning "#RRGGBB" into a 0xAARRGGBB integer by the time it
// reaches the rendered props — hence the numeric expectations below rather
// than the hex strings passed in LoginScreen.tsx.
test("uses the brand-tinted gradient in light mode", async () => {
  await renderLoginScreen({}, "light");

  expect(screen.getByTestId("login-background").props.colors).toEqual([0xffffffff, 0xfffff7ed]);
});

test("uses the deep-slate gradient in dark mode", async () => {
  await renderLoginScreen({}, "dark");

  expect(screen.getByTestId("login-background").props.colors).toEqual([0xff0f172a, 0xff1e293b]);
});
