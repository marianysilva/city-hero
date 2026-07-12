/**
 * Shared Tailwind theme, consumed by both apps/web (via Tailwind v4's
 * `@config` compatibility directive, since colors/spacing here still need a
 * single non-CSS source both platforms can `require()`) and apps/city-hero
 * (via NativeWind's `presets` array — stable NativeWind 4.x still expects a
 * classic JS config, unlike the CSS-first `@theme`/`@plugin` API that only
 * ships in NativeWind v5, which is preview-only).
 *
 * Values come from ./src/tokens/shared-values.js — the single source of
 * truth also used by the TypeScript token modules (colors.ts, spacing.ts,
 * radius.ts, shadows.ts, typography.ts). This file has to be plain
 * CommonJS so both Tailwind's config loader and NativeWind's `require()`
 * can read it directly, with no build step — that's also why the shared
 * values live in a plain `.js` file rather than the `.ts` token modules.
 */
const shared = require("./src/tokens/shared-values.js");

const px = (n) => `${n}px`;
const toPxScale = (record) => Object.fromEntries(Object.entries(record).map(([key, n]) => [key, px(n)]));

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: shared.brand,
        civic: shared.civic,
        success: shared.civic.mint,
        warning: shared.civic.amber,
        danger: shared.civic.rose,
        info: shared.civic.sky,
      },
      fontFamily: {
        sans: [`"${shared.fontFamily.sans}"`, "system-ui", "sans-serif"],
      },
      spacing: toPxScale(shared.spacing),
      borderRadius: toPxScale(shared.radius),
      boxShadow: {
        soft: shared.shadows.soft,
        md: shared.shadows.md,
        // Alias so the bare `shadow` utility also resolves to the `md` token.
        DEFAULT: shared.shadows.md,
        lg: shared.shadows.lg,
      },
    },
  },
};
