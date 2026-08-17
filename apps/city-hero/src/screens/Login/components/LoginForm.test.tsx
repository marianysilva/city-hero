import { ThemeProvider } from "@city-hero/design-system";
import { LocaleProvider } from "@city-hero/i18n";
import { render, screen, userEvent } from "@testing-library/react-native";

import { LoginForm } from "./LoginForm";

// fireEvent.changeText/press invoke the handler synchronously but this
// project's React 19 + RNTL 14 combination doesn't flush the resulting
// state update before the next synchronous line runs (confirmed with a
// minimal repro: a plain useState + TextInput still read the pre-update
// value immediately after fireEvent.changeText). userEvent's helpers await
// internally, so every state-changing interaction below uses those instead.
function renderForm(props: Partial<React.ComponentProps<typeof LoginForm>> = {}) {
  const defaultProps = { onSubmit: jest.fn(), onForgotPassword: jest.fn() };
  return render(
    <ThemeProvider>
      <LocaleProvider initialLocale="en-US">
        <LoginForm {...defaultProps} {...props} />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

test("renders the email and password fields, the forgot-password link, and the submit button", async () => {
  await renderForm();

  expect(screen.getByPlaceholderText("you@email.com")).toBeTruthy();
  expect(screen.getByPlaceholderText("••••••••")).toBeTruthy();
  expect(screen.getByText("Forgot my password")).toBeTruthy();
  expect(screen.getByText("Sign in")).toBeTruthy();
});

test("submits the typed email and password", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  await renderForm({ onSubmit });

  await user.type(screen.getByPlaceholderText("you@email.com"), "citizen@example.com");
  await user.type(screen.getByPlaceholderText("••••••••"), "hunter2");
  await user.press(screen.getByText("Sign in"));

  expect(onSubmit).toHaveBeenCalledWith("citizen@example.com", "hunter2");
});

test("masks the password by default and reveals it via the SHOW/HIDE toggle", async () => {
  const user = userEvent.setup();
  await renderForm();

  const passwordInput = screen.getByPlaceholderText("••••••••");
  expect(passwordInput.props.secureTextEntry).toBe(true);
  expect(screen.getByLabelText("Show password")).toBeTruthy();

  await user.press(screen.getByTestId("login-password-toggle"));

  expect(screen.getByPlaceholderText("••••••••").props.secureTextEntry).toBe(false);
  expect(screen.getByLabelText("Hide password")).toBeTruthy();
  expect(screen.getByText("HIDE")).toBeTruthy();

  await user.press(screen.getByTestId("login-password-toggle"));

  expect(screen.getByPlaceholderText("••••••••").props.secureTextEntry).toBe(true);
  expect(screen.getByLabelText("Show password")).toBeTruthy();
});

test('wires "Next" on the email keyboard to hand off to the password field without throwing', async () => {
  const user = userEvent.setup();
  await renderForm();

  const emailInput = screen.getByPlaceholderText("you@email.com");
  expect(emailInput.props.returnKeyType).toBe("next");

  // Exercises the onSubmitEditing -> passwordRef.current?.focus() handoff;
  // RN's jest preset mocks the native TextInput, so this asserts the
  // handler runs cleanly rather than a real OS-level focus transition
  // (untestable outside a native environment).
  await expect(user.type(emailInput, "a", { submitEditing: true })).resolves.not.toThrow();
});

test('submits when "Go" is pressed on the password keyboard', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  await renderForm({ onSubmit });

  await user.type(screen.getByPlaceholderText("you@email.com"), "citizen@example.com");
  const passwordInput = screen.getByPlaceholderText("••••••••");
  expect(passwordInput.props.returnKeyType).toBe("go");

  await user.type(passwordInput, "hunter2", { submitEditing: true });

  expect(onSubmit).toHaveBeenCalledWith("citizen@example.com", "hunter2");
});

test("calls onForgotPassword when the forgot-password link is pressed", async () => {
  const user = userEvent.setup();
  const onForgotPassword = jest.fn();
  await renderForm({ onForgotPassword });

  await user.press(screen.getByText("Forgot my password"));

  expect(onForgotPassword).toHaveBeenCalledTimes(1);
});

test("keeps the full value on a very long email address", async () => {
  const user = userEvent.setup();
  await renderForm();
  const longEmail = `${"a".repeat(50)}@example.com`;

  await user.type(screen.getByPlaceholderText("you@email.com"), longEmail);

  expect(screen.getByPlaceholderText("you@email.com").props.value).toBe(longEmail);
});

test("submits with an empty password when nothing was typed (no client-side validation in this task)", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  await renderForm({ onSubmit });

  await user.type(screen.getByPlaceholderText("you@email.com"), "citizen@example.com");
  await user.press(screen.getByText("Sign in"));

  expect(onSubmit).toHaveBeenCalledWith("citizen@example.com", "");
});
