/**
 * Canonical size scale shared by every sizeable atom (Button, Badge, ...).
 * A single source of truth so per-atom `XxxSize` unions can't quietly drift
 * apart (e.g. one atom missing "xs" that another added) with no shared type
 * to catch it — see docs/engineering/design-system.md.
 */
export type Size = "xs" | "sm" | "md" | "lg";
