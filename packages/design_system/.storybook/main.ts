import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-native-web-vite",
    options: {
      // NativeWind transforms `className` into RN styles at the JSX layer —
      // Storybook's Vite/Babel pass needs the same jsxImportSource to render
      // components the same way the app does.
      pluginReactOptions: {
        jsxImportSource: "nativewind",
      },
    },
  },
};

export default config;
