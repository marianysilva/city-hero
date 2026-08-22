"use client";

import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Badge } from "../../atoms/Badge/Badge";
import { useTheme } from "../../hooks/useTheme";

import type { BottomNavMoreItem } from "./BottomNav.types";
import { formatBadgeCount } from "./BottomNav.utils";

export type BottomNavMoreSheetProps = {
  visible: boolean;
  items: BottomNavMoreItem[];
  onClose: () => void;
  /**
   * Already-translated screen-reader label for the tap-outside backdrop
   * (e.g. "Fechar"). Required — components don't hardcode user-facing copy
   * (design-system.md rule 5), so there is no English default.
   */
  closeAccessibilityLabel: string;
  testID?: string;
};

const BACKDROP_COLOR = "rgba(15,23,42,0.45)";
const ROW_ICON_SIZE = 20;

/**
 * The "More" bottom sheet: secondary destinations that don't warrant a
 * permanent tab (Notifications, News, City Profile, Programs, Services, Sync
 * Queue, Settings, Logout). Presentational — visibility is caller-controlled,
 * and each row's navigation + analytics fire in its own `onPress`.
 *
 * Built on React Native's `Modal` (a real screen-covering overlay that works
 * on native and react-native-web) rather than `@gorhom/bottom-sheet`: the
 * gesture-dismissable sheet with a drag handle is an app-level upgrade that
 * pulls in `react-native-gesture-handler`, a native-only peer this
 * web-consumed package deliberately avoids. Tap-outside and the close control
 * both dismiss here, covering the acceptance criteria without that dependency.
 */
export function BottomNavMoreSheet({
  visible,
  items,
  onClose,
  closeAccessibilityLabel,
  testID,
}: BottomNavMoreSheetProps) {
  const { colors, spacing, radius, typography, shadows } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        testID="more-sheet-backdrop"
        // Without `accessible={false}` the backdrop's own touchable would
        // collapse the whole sheet subtree into one a11y node on native, making
        // every row invisible to VoiceOver/TalkBack. It stays fully tappable —
        // `accessible` controls the a11y tree, not touch handling.
        accessible={false}
        accessibilityLabel={closeAccessibilityLabel}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: BACKDROP_COLOR, justifyContent: "flex-end" }}
      >
        {/* Stop taps on the panel itself from bubbling to the backdrop.
            `accessible={false}` for the same subtree-collapse reason. */}
        <Pressable
          testID="more-sheet-panel"
          accessible={false}
          onPress={() => {}}
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xl,
            shadowColor: shadows.lg.ios.shadowColor,
            shadowOffset: shadows.lg.ios.shadowOffset,
            shadowOpacity: shadows.lg.ios.shadowOpacity,
            shadowRadius: shadows.lg.ios.shadowRadius,
            elevation: shadows.lg.android.elevation,
          }}
        >
          {/* Drag-handle affordance (visual only — no gesture wired). */}
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              alignSelf: "center",
              width: 40,
              height: 4,
              borderRadius: radius.full,
              backgroundColor: colors.border,
              marginBottom: spacing.sm,
            }}
          />
          <ScrollView style={{ maxHeight: 360 }}>
            {items.map((item) => {
              const showBadge = typeof item.badgeCount === "number" && item.badgeCount > 0;
              return (
                <Pressable
                  key={item.key}
                  testID={`more-item-${item.key}`}
                  accessibilityRole="menuitem"
                  accessibilityLabel={item.label}
                  onPress={item.onPress}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                    minHeight: 48,
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.sm,
                  }}
                >
                  {item.icon != null ? (
                    typeof item.icon === "string" ? (
                      <Text
                        style={{ fontSize: ROW_ICON_SIZE }}
                        accessibilityElementsHidden
                        importantForAccessibility="no"
                      >
                        {item.icon}
                      </Text>
                    ) : (
                      <View accessibilityElementsHidden importantForAccessibility="no">
                        {item.icon}
                      </View>
                    )
                  ) : null}
                  <Text
                    numberOfLines={1}
                    style={{
                      flex: 1,
                      color: colors.text.primary,
                      fontSize: typography.body.fontSize,
                      lineHeight: typography.body.lineHeight,
                      fontWeight: typography.body.fontWeight,
                    }}
                  >
                    {item.label}
                  </Text>
                  {showBadge ? (
                    <Badge color="danger" size="xs" radius="full">
                      {formatBadgeCount(item.badgeCount!)}
                    </Badge>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
