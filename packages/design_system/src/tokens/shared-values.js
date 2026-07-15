/**
 * Plain-CommonJS token primitives — the single source of truth for values
 * shared between the TypeScript token modules (colors.ts, spacing.ts,
 * radius.ts, shadows.ts, typography.ts) and ../../tailwind.preset.js.
 *
 * This has to stay plain JS (no TypeScript syntax) so both loaders can
 * `require()` it directly with no build step: Tailwind's config loader
 * (used via apps/web's `@config` directive) and NativeWind's `presets`
 * array (used via apps/city-hero/tailwind.config.js, loaded with a plain
 * Node `require()`, not Tailwind's jiti-based TS-capable loader).
 */
module.exports = {
  brand: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },
  civic: {
    purple: "#7C3AED",
    mint: "#10B981",
    sky: "#0EA5E9",
    amber: "#F59E0B",
    rose: "#F43F5E",
    slate: "#0F172A",
  },
  // 4dp grid.
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
    "4xl": 64,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
  },
  // `soft` is ported from the prototype's `shadow-soft` Tailwind extension
  // (design/index.html: `0 10px 30px -10px rgba(15,23,42,.18)`). `md`/`lg`
  // extrapolate from it — not pulled from a design file, refine later.
  shadows: {
    soft: "0 10px 30px -10px rgba(15,23,42,.18)",
    md: "0 14px 34px -12px rgba(15,23,42,.20)",
    lg: "0 20px 45px -15px rgba(15,23,42,.24)",
  },
  fontFamily: {
    sans: "Plus Jakarta Sans",
  },
};
