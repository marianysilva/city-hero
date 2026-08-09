import { ThemeProvider } from "@city-hero/design-system";
import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { AnimatedLogo } from "./AnimatedLogo";

function renderLogo(reduceMotion: boolean) {
  return render(
    <ThemeProvider>
      <AnimatedLogo reduceMotion={reduceMotion} />
    </ThemeProvider>,
  );
}

test("renders the logo mark", async () => {
  await renderLogo(false);

  expect(screen.getByTestId("splash-logo")).toBeTruthy();
});

test("is already at full opacity and scale when reduce-motion is on, with no fade-in", async () => {
  await renderLogo(true);

  const { opacity, transform } = StyleSheet.flatten(screen.getByTestId("splash-logo").props.style);
  expect(opacity).toBe(1);
  expect(transform).toEqual([{ scale: 1 }]);
});
