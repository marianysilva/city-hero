import { Button, ThemeProvider } from "@city-hero/design-system";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Proves apps/web can actually render a real @city-hero/design-system
// component end-to-end (ThemeProvider context + react-native-web), not just
// resolve the import — apps/city-hero has the equivalent coverage in
// packages/design_system/src/theme/ThemeProvider.test.tsx.
describe("apps/web · design-system consumption", () => {
  it("renders a design-system Button inside ThemeProvider", () => {
    render(
      <ThemeProvider initialPreference="light">
        <Button>Salvar</Button>
      </ThemeProvider>,
    );
    expect(screen.getByText("Salvar")).toBeInTheDocument();
  });
});
