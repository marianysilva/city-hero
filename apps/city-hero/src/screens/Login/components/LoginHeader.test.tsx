import { ThemeProvider } from "@city-hero/design-system";
import { LocaleProvider } from "@city-hero/i18n";
import { render, screen } from "@testing-library/react-native";

import { LoginHeader } from "./LoginHeader";

function renderHeader() {
  return render(
    <ThemeProvider>
      <LocaleProvider initialLocale="en-US">
        <LoginHeader />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

test("renders the logo, heading, and subtitle", async () => {
  await renderHeader();

  expect(screen.getByTestId("login-logo")).toBeTruthy();
  expect(screen.getByText("Sign in to CityHero")).toBeTruthy();
  expect(screen.getByText("Sign in to report and track")).toBeTruthy();
});

test("groups heading and subtitle under one composed accessibility label", async () => {
  await renderHeader();

  expect(screen.getByLabelText("Sign in to CityHero. Sign in to report and track")).toBeTruthy();
});
