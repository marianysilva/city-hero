import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @city-hero/design-system ships raw TS/JSX (no build step) — Next.js
  // only transpiles node_modules/workspace packages it's explicitly told to.
  transpilePackages: ["@city-hero/design-system"],
};

export default nextConfig;
