import { colors } from "@city-hero/design-system/tokens";
import { describe, expect, it } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain CJS config, no TS types published
const preset = require("../../../packages/design_system/tailwind.preset.js");

// The preset and the TS token modules must draw from the same values (see
// tailwind.preset.js's own header comment) — this is the actual
// "mobile and web stay in sync" guarantee from 02-design-tokens.md's
// Acceptance Criteria, not just two files that happen to agree today.
describe("apps/web · Tailwind preset stays in sync with design-system tokens", () => {
  it("brand color scale matches the shared token", () => {
    expect(preset.theme.extend.colors.brand).toEqual(colors.brand);
  });

  it("civic color scale matches the shared token", () => {
    expect(preset.theme.extend.colors.civic).toEqual(colors.civic);
  });

  it("semantic aliases map to the same civic hues", () => {
    expect(preset.theme.extend.colors.success).toBe(colors.civic.mint);
    expect(preset.theme.extend.colors.warning).toBe(colors.civic.amber);
    expect(preset.theme.extend.colors.danger).toBe(colors.civic.rose);
    expect(preset.theme.extend.colors.info).toBe(colors.civic.sky);
  });
});
