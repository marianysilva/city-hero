import { ThemeProvider } from "@city-hero/design-system";
import { LocaleProvider } from "@city-hero/i18n";
import { render, screen, userEvent } from "@testing-library/react-native";

import { CreateAccountLink } from "./CreateAccountLink";

function renderLink(onCreateAccount = jest.fn()) {
  return render(
    <ThemeProvider>
      <LocaleProvider initialLocale="en-US">
        <CreateAccountLink onCreateAccount={onCreateAccount} />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

test("renders the prompt and the create-account link", async () => {
  await renderLink();

  expect(screen.getByText("Don't have an account?", { exact: false })).toBeTruthy();
  expect(screen.getByText("Create now")).toBeTruthy();
});

test("calls onCreateAccount when the link is pressed", async () => {
  const user = userEvent.setup();
  const onCreateAccount = jest.fn();
  await renderLink(onCreateAccount);

  await user.press(screen.getByTestId("login-create-account"));

  expect(onCreateAccount).toHaveBeenCalledTimes(1);
});

test("exposes the link with an accessible link role", async () => {
  await renderLink();

  expect(screen.getByRole("link")).toBeTruthy();
});
