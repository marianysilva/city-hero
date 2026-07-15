import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @city-hero/design-system ships raw TS/JSX (no build step) — Next.js
  // only transpiles node_modules/workspace packages it's explicitly told to.
  transpilePackages: ["@city-hero/design-system"],
  // The design system's main entry (ThemeProvider, hooks) imports from
  // "react-native" (for useColorScheme/AccessibilityInfo). Code that only
  // needs tokens can import "@city-hero/design-system/tokens" instead — that
  // subpath has no react-native dependency, so this alias becomes optional
  // for it. Next.js 16 uses Turbopack by default for both dev and build, so
  // the alias goes through `turbopack.resolveAlias` (the legacy `webpack()`
  // config function is not invoked under Turbopack). Do NOT add a `webpack()`
  // fallback here "for safety" — Next 16 detects any custom webpack config
  // and refuses to build under Turbopack unless `next build --webpack` is
  // passed explicitly, so an unused webpack() function would break the
  // default (Turbopack) build rather than protect it.
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
  },
};

export default nextConfig;
