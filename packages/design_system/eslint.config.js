const { defineConfig } = require("eslint/config");
const reactHooks = require("eslint-plugin-react-hooks");
const tseslint = require("typescript-eslint");

const sharedConfig = require("../../eslint.config.base.js");

module.exports = defineConfig([
  ...sharedConfig(),
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    ignores: ["storybook-static/**", ".storybook/**"],
  },
  {
    // Config files stay CommonJS so Node (Metro/Tailwind/Storybook loaders)
    // can require() them with no build step — see eslint.config.base.js.
    // tailwind.preset.js is included here for the same reason: it requires
    // ./src/tokens/shared-values.js directly, with no build step.
    files: ["*.config.js", "*.config.mjs", "tailwind.preset.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
