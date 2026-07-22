const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");

const sharedConfig = require("../../eslint.config.base.js");

module.exports = defineConfig([
  ...sharedConfig(),
  ...tseslint.configs.recommended,
  {
    ignores: ["coverage/**"],
  },
  {
    // This file itself stays CommonJS so Node can require() it with no
    // build step (same reasoning as packages/design_system/eslint.config.js).
    files: ["*.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
