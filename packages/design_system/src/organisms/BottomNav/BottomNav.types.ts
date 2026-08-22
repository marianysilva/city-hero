import type React from "react";

/**
 * The four routable tabs. Camera is intentionally NOT here — it's the center
 * FAB, which opens a modal instead of switching the active tab (see the task
 * spec's Route → active tab mapping). `more` can still be the *active* tab
 * (highlighted) when the user is on one of its sub-screens, even though
 * pressing it opens a sheet rather than navigating.
 */
export type BottomNavTabKey = "home" | "feed" | "profile" | "more";

/** One routable tab in the bar (everything except the center Camera FAB). */
export type BottomNavItem = {
  key: BottomNavTabKey;
  /** Already-translated label (components don't call the i18n hook — see design-system.md rule 5). */
  label: string;
  /** Any renderable icon (emoji `<Text>`, SVG, icon-font glyph). Rendered as-is. */
  icon: React.ReactNode;
  /**
   * Screen-reader label. Defaults to `label`. Role ("tab") and selection
   * state are supplied by the component via native a11y props, so this should
   * be just the name, not "tab 1 of 5, selected".
   */
  accessibilityLabel?: string;
  /**
   * Optional count badge on the tab itself (e.g. aggregate unread on `more`).
   * `0`/`undefined` renders no badge.
   */
  badgeCount?: number;
};

/** One row inside the "More" bottom sheet. */
export type BottomNavMoreItem = {
  key: string;
  /** Already-translated label. */
  label: string;
  icon?: React.ReactNode;
  /**
   * Count badge (e.g. Sync Queue pending count, Notifications unread count).
   * `0`/`undefined` renders no badge — so a Sync Queue row with nothing
   * pending shows no red dot, per the offline-mode acceptance criteria.
   */
  badgeCount?: number;
  onPress: () => void;
};
