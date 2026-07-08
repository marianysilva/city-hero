/**
 * Shared Tailwind theme, consumed by both apps/web (via Tailwind v4's
 * `@config` compatibility directive, since colors/spacing here still need a
 * single non-CSS source both platforms can `require()`) and apps/city-hero
 * (via NativeWind's `presets` array — stable NativeWind 4.x still expects a
 * classic JS config, unlike the CSS-first `@theme`/`@plugin` API that only
 * ships in NativeWind v5, which is preview-only).
 *
 * Values are hand-kept in sync with the TypeScript tokens in `src/tokens/`
 * (colors.ts, spacing.ts, radius.ts, shadows.ts, typography.ts) — this file
 * has to be plain CommonJS so both Tailwind's config loader and NativeWind's
 * `require()` can read it directly, with no build step.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
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
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#F43F5E",
        info: "#0EA5E9",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(15,23,42,.18)",
        DEFAULT: "0 14px 34px -12px rgba(15,23,42,.20)",
        lg: "0 20px 45px -15px rgba(15,23,42,.24)",
      },
    },
  },
};
