import React from "react";
import type { Preview } from "@storybook/react-native-web-vite";

import { ThemeProvider } from "../src/theme/ThemeProvider";

import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: {
        mobile: { name: "Mobile (375×667)", styles: { width: "375px", height: "667px" } },
        mobileLarge: {
          name: "Mobile Large (414×896)",
          styles: { width: "414px", height: "896px" },
        },
        tablet: { name: "Tablet (768×1024)", styles: { width: "768px", height: "1024px" } },
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Light/dark theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, { globals }) => (
      // Keying on the theme forces ThemeProvider to remount and pick up the
      // new `initialPreference` — it only reads that prop once on mount.
      <ThemeProvider key={globals.theme} initialPreference={globals.theme ?? "light"}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
