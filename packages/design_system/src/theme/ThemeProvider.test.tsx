import { render, screen } from "@testing-library/react";
import { Text } from "react-native";
import { describe, expect, it } from "vitest";

import { useTheme } from "../hooks/useTheme";
import { darkTheme, lightTheme } from "../tokens/theme";

import { ThemeProvider, useThemeContext } from "./ThemeProvider";

function Probe() {
  const theme = useTheme();
  return <Text testID="scheme">{theme.scheme}</Text>;
}

describe("ThemeProvider", () => {
  it("resolves the light theme when initialPreference is 'light'", () => {
    render(
      <ThemeProvider initialPreference="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("scheme")).toHaveTextContent("light");
  });

  it("resolves the dark theme when initialPreference is 'dark'", () => {
    render(
      <ThemeProvider initialPreference="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("scheme")).toHaveTextContent("dark");
  });

  it("useTheme() returns the same token shape for both themes", () => {
    expect(Object.keys(lightTheme).sort()).toEqual(Object.keys(darkTheme).sort());
  });

  it("throws a clear error when useTheme() is used outside a provider", () => {
    function Bare() {
      useThemeContext();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/must be called within a <ThemeProvider>/);
  });
});
