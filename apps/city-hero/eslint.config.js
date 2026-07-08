// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

const sharedConfig = require("../../eslint.config.base.js");

module.exports = defineConfig([
  ...sharedConfig({ withImportPlugin: false }),
  expoConfig,
  {
    ignores: ["dist/*"],
  },
]);
