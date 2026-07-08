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
    files: ["*.config.js", "*.config.mjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
