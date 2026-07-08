const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Only watch the workspace root's node_modules (hoisted deps) and the
// specific sibling packages this app actually consumes — NOT the whole
// monorepo root. Watching workspaceRoot itself pulls in apps/backend
// (including its multi-thousand-file .venv), apps/web, docs/, design/,
// .git, etc., which is what made the Metro crawl hang/stall for minutes,
// especially with OneDrive's cloud-file placeholders slowing every stat().
config.watchFolders = [
  path.resolve(workspaceRoot, "node_modules"),
  path.resolve(workspaceRoot, "packages/design_system"),
];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// Defense in depth: even within the watched folders above, never traverse
// into other packages' own node_modules or build output.
config.resolver.blockList = [
  /packages\/design_system\/node_modules\/.*/,
  /packages\/design_system\/storybook-static\/.*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
