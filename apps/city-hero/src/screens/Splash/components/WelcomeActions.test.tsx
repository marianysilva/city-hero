import { ThemeProvider } from "@city-hero/design-system";
import { LocaleProvider } from "@city-hero/i18n";
import { render, screen, userEvent } from "@testing-library/react-native";

import { WelcomeActions } from "./WelcomeActions";

function renderActions(props: Partial<React.ComponentProps<typeof WelcomeActions>> = {}) {
  return render(
    <ThemeProvider>
      <LocaleProvider initialLocale="en-US">
        <WelcomeActions {...props} />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

test("renders both CTAs and the privacy policy link", async () => {
  await renderActions();

  expect(screen.getByText("Sign in with email")).toBeTruthy();
  expect(screen.getByText("Sign in with Gov.br")).toBeTruthy();
  expect(screen.getByText("Privacy Policy")).toBeTruthy();
});

test("logs a stub instead of crashing when the Gov.br CTA or the privacy link is pressed", async () => {
  const user = userEvent.setup();
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  await renderActions();

  await user.press(screen.getByTestId("splash-cta-govbr"));
  await user.press(screen.getByTestId("splash-privacy-link"));

  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Gov.br login"));
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("privacy policy"));

  logSpy.mockRestore();
});

test("falls back to the not-implemented stub for the email CTA when no onEmailLogin is given", async () => {
  const user = userEvent.setup();
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  await renderActions();

  await user.press(screen.getByTestId("splash-cta-email"));

  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("email login"));

  logSpy.mockRestore();
});

test("calls the provided onEmailLogin instead of the stub when the email CTA is pressed", async () => {
  const user = userEvent.setup();
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  const onEmailLogin = jest.fn();
  await renderActions({ onEmailLogin });

  await user.press(screen.getByTestId("splash-cta-email"));

  expect(onEmailLogin).toHaveBeenCalledTimes(1);
  expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining("email login"));

  logSpy.mockRestore();
});
