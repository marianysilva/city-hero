const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// expo-sqlite (used by lib/i18n.ts for locale persistence) needs its wasm
// worker resolvable as an asset on web, plus cross-origin isolation headers
// for SharedArrayBuffer. See https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/#web-support
config.resolver.assetExts.push("wasm");
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    middleware(req, res, next);
  };
};

module.exports = withNativeWind(config);
