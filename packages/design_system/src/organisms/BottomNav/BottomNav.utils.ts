/** Highest count shown before collapsing to "N+", matching the prototype's badge cap. */
export const BADGE_CAP = 9;

/**
 * Formats a notification/queue count for a badge: the raw number up to `cap`,
 * then `"<cap>+"` above it (e.g. `42` → `"9+"`). Shared by the tab badges and
 * the "More" sheet rows so the cap can't drift between them.
 */
export function formatBadgeCount(count: number, cap: number = BADGE_CAP): string {
  return count > cap ? `${cap}+` : `${count}`;
}
