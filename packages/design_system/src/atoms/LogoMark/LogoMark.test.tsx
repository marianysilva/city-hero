import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "../../theme/ThemeProvider";

import { LogoMark } from "./LogoMark";

function renderMark(props: Partial<React.ComponentProps<typeof LogoMark>> = {}) {
  return render(
    <ThemeProvider initialPreference="light">
      <LogoMark testID="logo-mark" {...props} />
    </ThemeProvider>,
  );
}

describe("LogoMark", () => {
  it("renders the brand mark for the default (on-color, lg) variant", () => {
    renderMark();

    expect(screen.getByTestId("logo-mark")).toBeTruthy();
    expect(screen.getByText("🦸")).toBeTruthy();
  });

  it("renders the on-light variant without throwing", () => {
    renderMark({ variant: "on-light", size: "md" });

    expect(screen.getByTestId("logo-mark")).toBeTruthy();
    expect(screen.getByText("🦸")).toBeTruthy();
  });

  it("forwards arbitrary View props (e.g. testID) to the root element", () => {
    render(
      <ThemeProvider initialPreference="light">
        <LogoMark testID="splash-logo" />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("splash-logo")).toBeTruthy();
  });
});
