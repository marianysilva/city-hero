// The package root re-exports everything for backward compatibility with
// existing call sites. New server-only code should prefer importing from
// "@city-hero/i18n/core" directly (no React in its module graph) instead of
// this barrel — see ./core.ts and ./react.ts for the underlying split.
export * from "./core";
export * from "./react";
