import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@city-hero/types"],
  output: "standalone",
};

export default nextConfig;
