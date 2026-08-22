"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { useTheme } from "../../hooks/useTheme";

import type { BottomNavItem, BottomNavMoreItem, BottomNavTabKey } from "./BottomNav.types";
import { BottomNavFab } from "./BottomNavFab";
import { BottomNavMoreSheet } from "./BottomNavMoreSheet";
import { BottomNavTab } from "./BottomNavTab";

// The bar layout (two tabs | center FAB | two tabs) assumes exactly this many
// routable tabs. Enforced with a dev-only warning rather than a type-level
// tuple so callers can still map over a config array ergonomically.
const EXPECTED_TAB_COUNT = 4;

export type BottomNavProps = {
  /**
   * The tab matching the current route, or `null` for a route that maps to no
   * tab (nothing highlighted — see the "Unknown route" edge case).
   */
  activeTab: BottomNavTabKey | null;
  /**
   * The four routable tabs, in bar order (Map, Feed, Profile, More). The center
   * Camera FAB is rendered between the two middle tabs and is configured
   * separately via `fab`. Exactly four are expected — a different count warns in
   * dev and renders a lopsided/off-center bar.
   */
  items: BottomNavItem[];
  /**
   * Fired when a non-`more` tab is tapped. `more` opens the sheet instead of
   * navigating, so it never reaches here. Haptics/analytics fire in the caller.
   */
  onTabPress: (key: BottomNavTabKey) => void;
  fab: {
    icon?: React.ReactNode;
    accessibilityLabel: string;
    onPress: () => void;
  };
  /** Rows shown in the "More" sheet. Omit/empty to render an empty sheet. */
  moreItems?: BottomNavMoreItem[];
  /** Called when the "More" tab is tapped (for analytics); the sheet opens regardless. */
  onMorePress?: () => void;
  /** Device bottom safe-area inset (from `useSafeAreaInsets().bottom`). */
  bottomInset?: number;
  /** Already-translated a11y label for the More sheet's tap-outside backdrop (e.g. "Fechar"). */
  moreCloseAccessibilityLabel: string;
  testID?: string;
};

/**
 * The app's primary bottom navigation: four tabs (Map, Feed, Profile, More)
 * plus an elevated center Camera FAB. Presentational and route-driven — it
 * derives the active tab from the `activeTab` prop rather than owning
 * navigation state, and delegates navigation/haptics/analytics to caller
 * callbacks so it renders through react-native-web (Storybook + Vitest)
 * without any native-only dependency.
 *
 * The only state it owns is the ephemeral "More" sheet visibility, which is
 * UI state, not navigation state.
 */
export function BottomNav({
  activeTab,
  items,
  onTabPress,
  fab,
  moreItems = [],
  onMorePress,
  bottomInset = 0,
  moreCloseAccessibilityLabel,
  testID,
}: BottomNavProps) {
  const { colors, spacing } = useTheme();
  const [moreVisible, setMoreVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && items.length !== EXPECTED_TAB_COUNT) {
      console.warn(
        `BottomNav expects exactly ${EXPECTED_TAB_COUNT} tabs (Map, Feed, Profile, More); ` +
          `received ${items.length}. The center-FAB split assumes ${EXPECTED_TAB_COUNT}.`,
      );
    }
  }, [items.length]);

  // Single stable dispatcher; `more` opens the sheet instead of routing.
  const activateTab = useCallback(
    (key: BottomNavTabKey) => {
      if (key === "more") {
        onMorePress?.();
        setMoreVisible(true);
      } else {
        onTabPress(key);
      }
    },
    [onMorePress, onTabPress],
  );

  // Stable per-tab handlers so the memoized tabs don't re-render when only the
  // sheet's visibility changes (spec's "other tabs are memoized" note).
  const tabHandlers = useMemo(() => {
    const map: Partial<Record<BottomNavTabKey, () => void>> = {};
    for (const item of items) {
      map[item.key] = () => activateTab(item.key);
    }
    return map;
  }, [items, activateTab]);

  // Selecting a More item dismisses the sheet (then runs the item's own
  // handler). The nav bar is persistent chrome, so without this the sheet
  // would stay open on top of whatever screen the item navigated to.
  const sheetItems = useMemo(
    () =>
      moreItems.map((item) => ({
        ...item,
        onPress: () => {
          setMoreVisible(false);
          item.onPress();
        },
      })),
    [moreItems],
  );

  // Split the tabs around the center FAB: for the canonical 4 tabs this is
  // [home, feed] | FAB | [profile, more].
  const mid = Math.ceil(items.length / 2);
  const leftTabs = items.slice(0, mid);
  const rightTabs = items.slice(mid);

  const renderTab = (item: BottomNavItem) => (
    <BottomNavTab
      key={item.key}
      testID={`nav-tab-${item.key}`}
      label={item.label}
      icon={item.icon}
      active={activeTab === item.key}
      accessibilityLabel={item.accessibilityLabel}
      badgeCount={item.badgeCount}
      onPress={tabHandlers[item.key]!}
    />
  );

  return (
    <View testID={testID}>
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: spacing.xs,
          paddingBottom: bottomInset,
          paddingHorizontal: spacing.xs,
        }}
      >
        {leftTabs.map(renderTab)}
        <View style={{ flex: 1, alignItems: "center" }}>
          <BottomNavFab
            testID="nav-fab-camera"
            icon={fab.icon}
            accessibilityLabel={fab.accessibilityLabel}
            onPress={fab.onPress}
          />
        </View>
        {rightTabs.map(renderTab)}
      </View>

      {/* Mount only while open: react-native-web's Modal keeps its children
          in the DOM even when `visible` is false, so gating the mount here is
          what actually tears the sheet down on close (and keeps that
          teardown deterministic in tests). */}
      {moreVisible ? (
        <BottomNavMoreSheet
          testID="nav-more-sheet"
          visible
          items={sheetItems}
          onClose={() => setMoreVisible(false)}
          closeAccessibilityLabel={moreCloseAccessibilityLabel}
        />
      ) : null}
    </View>
  );
}
