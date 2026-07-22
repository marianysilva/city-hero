import type { NextConfig } from "next";

// Non-nonce CSP (the simpler of Next's two documented approaches) — 'unsafe-inline'
// is needed because Next.js's own hydration/RSC bootstrap scripts and styled-jsx
// aren't nonce-tagged here. This still blocks the thing that matters most for an
// XSS payload: loading or exfiltrating to any host other than this app's own
// origin. 'unsafe-eval' is dev-only — React uses eval() in development for
// richer error stack reconstruction, not in production builds.
// https://nextjs.org/docs/app/guides/content-security-policy
const isDev = process.env.NODE_ENV === "development";
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  // Stop advertising the framework to every response.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
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
