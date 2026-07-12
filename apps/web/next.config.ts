import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @city-hero/design-system ships raw TS/JSX (no build step) — Next.js
  // only transpiles node_modules/workspace packages it's explicitly told to.
  transpilePackages: ["@city-hero/design-system"],
  // The design system's ThemeProvider imports from "react-native" (for
  // useColorScheme/AccessibilityInfo). Next.js 16 uses Turbopack by default
  // for both dev and build, so the alias goes through `turbopack.resolveAlias`
  // (the legacy `webpack()` config function is not invoked under Turbopack).
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
  },
};

export default nextConfig;
