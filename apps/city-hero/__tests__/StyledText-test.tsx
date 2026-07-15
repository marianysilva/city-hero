import { ThemeProvider } from "@city-hero/design-system";
import { render, screen } from "@testing-library/react-native";

import { MonoText } from "../components/StyledText";

test("renders the given text", async () => {
  // RNTL v14 targets React 19's async rendering model, so render() must be awaited
  // before the screen object is populated — see the v14 migration guide.
  // Themed.tsx's <Text> reads the color scheme via the design system's
  // useTheme(), which throws outside a <ThemeProvider> — see ThemeProvider.tsx.
  await render(
    <ThemeProvider>
      <MonoText>Hello CityHero</MonoText>
    </ThemeProvider>,
  );
  expect(screen.getByText("Hello CityHero")).toBeTruthy();
});
