// Physical re-export, not just a package.json "exports" map entry.
//
// Metro (apps/city-hero's bundler) doesn't opt into `unstable_enablePackageExports`
// for client bundles by default (only inside its server-environment branch), so
// `import ... from "@city-hero/design-system/hooks/useStatusBarVariant"` falls back
// to Node's classic resolution: a literal `hooks/useStatusBarVariant.*` file relative
// to this package's root. This file is that target — it exists specifically so the
// subpath resolves under Metro's classic resolver, in addition to the "exports" map
// entry (package.json) that already serves tsc/Vite/Vitest's exports-aware resolvers.
export * from "../src/hooks/useStatusBarVariant";
