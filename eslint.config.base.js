// Shared layer spread into each app's own framework config (Next.js in
// apps/web, Expo in apps/city-hero) — only rules that make sense across
// both belong here.
//
// eslint-config-expo/flat already registers its own instance of the
// "import" plugin (a different object reference from our own require,
// even though it resolves to the same npm package/version), so trying to
// register a second "import" plugin key throws "Cannot redefine plugin".
// apps/city-hero calls this with { withImportPlugin: false } and relies on
// Expo's own registration instead.
module.exports = ({ withImportPlugin = true } = {}) => {
  const rules = {
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    // Design-system consumers must import from the package root, never an
    // internal path — see docs/engineering/design-system.md "Imports from
    // screens".
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@city-hero/design-system/src/*", "@city-hero/design-system/src"],
            message:
              "Import from '@city-hero/design-system' (the package root), not an internal path.",
          },
        ],
      },
    ],
  };

  if (!withImportPlugin) {
    return [{ rules }];
  }

  const importPlugin = require("eslint-plugin-import");
  return [{ plugins: { import: importPlugin }, rules }];
};
