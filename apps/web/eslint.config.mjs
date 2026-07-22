import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import sharedConfig from "../../eslint.config.base.js";

const eslintConfig = defineConfig([
  ...sharedConfig(),
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // scripts/test-e2e.sh's isolated Playwright run builds here (see
    // next.config.ts's NEXT_DIST_DIR) — same reason .next/** is ignored above.
    ".next-e2e/**",
  ]),
]);

export default eslintConfig;
