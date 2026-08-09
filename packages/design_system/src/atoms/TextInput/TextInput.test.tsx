import { fireEvent, render, screen } from "@testing-library/react";
import { Text } from "react-native";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "../../theme/ThemeProvider";

import { TextInput } from "./TextInput";

function renderInput(props: Partial<React.ComponentProps<typeof TextInput>> = {}) {
  return render(
    <ThemeProvider initialPreference="light">
      <TextInput label="E-mail" placeholder="seu@email.com" {...props} />
    </ThemeProvider>,
  );
}

describe("TextInput", () => {
  it("renders the label and placeholder", () => {
    renderInput();

    expect(screen.getByText("E-mail")).toBeTruthy();
    expect(screen.getByPlaceholderText("seu@email.com")).toBeTruthy();
  });

  it("calls onChangeText as the user types", () => {
    const onChangeText = vi.fn();
    renderInput({ onChangeText });

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "citizen@example.com" },
    });

    expect(onChangeText).toHaveBeenCalledWith("citizen@example.com");
  });

  it("defaults accessibilityLabel to the label when none is given", () => {
    renderInput();

    expect(screen.getByLabelText("E-mail")).toBeTruthy();
  });

  it("lets an explicit accessibilityLabel override the label", () => {
    renderInput({ accessibilityLabel: "Endereço de e-mail" });

    expect(screen.getByLabelText("Endereço de e-mail")).toBeTruthy();
    expect(screen.queryByLabelText("E-mail")).toBeNull();
  });

  it("renders a leading icon and a trailing rightElement", () => {
    renderInput({
      icon: <Text>✉</Text>,
      rightElement: <Text>VER</Text>,
    });

    expect(screen.getByText("✉")).toBeTruthy();
    expect(screen.getByText("VER")).toBeTruthy();
  });

  it("applies the focus border color on focus and reverts on blur", () => {
    renderInput();
    const input = screen.getByPlaceholderText("seu@email.com");
    const field = input.parentElement as HTMLElement;

    expect(field).toHaveStyle({ borderColor: "#E2E8F0" });

    fireEvent.focus(input);
    expect(field).toHaveStyle({ borderColor: "#FB923C" });

    fireEvent.blur(input);
    expect(field).toHaveStyle({ borderColor: "#E2E8F0" });
  });

  it("passes secureTextEntry through so password content is masked", () => {
    renderInput({ label: "Senha", placeholder: "••••••••", secureTextEntry: true });

    const input = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("does not crash and keeps the full value on a very long input", () => {
    const onChangeText = vi.fn();
    renderInput({ onChangeText });
    const longEmail = `${"a".repeat(200)}@example.com`;

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: longEmail },
    });

    expect(onChangeText).toHaveBeenCalledWith(longEmail);
  });
});
