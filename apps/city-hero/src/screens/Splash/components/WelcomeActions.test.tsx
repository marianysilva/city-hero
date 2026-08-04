import { LocaleProvider } from "@city-hero/i18n";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { WelcomeActions } from "./WelcomeActions";

function renderActions() {
  return render(
    <LocaleProvider initialLocale="en-US">
      <WelcomeActions />
    </LocaleProvider>,
  );
}

test("renders both CTAs and the privacy policy link", async () => {
  await renderActions();

  expect(screen.getByText("Sign in with email")).toBeTruthy();
  expect(screen.getByText("Sign in with Gov.br")).toBeTruthy();
  expect(screen.getByText("Privacy Policy")).toBeTruthy();
});

test("logs a stub instead of crashing when a welcome action is pressed", async () => {
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  await renderActions();

  fireEvent.press(screen.getByTestId("splash-cta-email"));
  fireEvent.press(screen.getByTestId("splash-cta-govbr"));
  fireEvent.press(screen.getByTestId("splash-privacy-link"));

  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("email login"));
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Gov.br login"));
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("privacy policy"));

  logSpy.mockRestore();
});
