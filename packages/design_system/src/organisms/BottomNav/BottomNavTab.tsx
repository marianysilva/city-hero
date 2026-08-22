"use client";

import React, { forwardRef, memo } from "react";
import { Pressable, Text, View } from "react-native";

import { Badge } from "../../atoms/Badge/Badge";
import { useTheme } from "../../hooks/useTheme";

import { formatBadgeCount } from "./BottomNav.utils";

export type BottomNavTabProps = {
  label: string;
  /** Emoji/glyph string, or a self-contained icon element (e.g. an SVG). */
  icon: React.ReactNode;
  /** Whether this tab maps to the current route. */
  active: boolean;
  onPress: () => void;
  /** Screen-reader name; defaults to `label`. */
  accessibilityLabel?: string;
  /** Count badge; `0`/`undefined` renders nothing. */
  badgeCount?: number;
  testID?: string;
};

const ICON_SIZE = 22;

/**
 * A single presentational tab (non-FAB) in the {@link BottomNav}. Owns no
 * navigation or haptic side effects — the caller wires those in `onPress`,
 * which keeps this renderable through react-native-web (Storybook + Vitest)
 * and free of native-only deps, the same constraint the design-system's
 * other shared pieces follow.
 *
 * Active vs inactive is a color/weight change (brand primary + bold when
 * active, neutral secondary otherwise). Screen readers get `role="tab"` +
 * `selected` state natively, so VoiceOver/TalkBack compose the
 * "<label>, tab, selected" announcement from those plus `accessibilityLabel`.
 *
 * Memoized so a container re-render (e.g. opening the More sheet) doesn't
 * re-render every tab — only the one whose `active`/`badgeCount` actually
 * changed, per the spec's performance note. Relies on the container passing
 * stable `onPress` identities.
 */
export const BottomNavTab = memo(
  forwardRef<React.ComponentRef<typeof Pressable>, BottomNavTabProps>(
    ({ label, icon, active, onPress, accessibilityLabel, badgeCount, testID }, ref) => {
      const { colors, spacing, typography } = useTheme();

      const tint = active ? colors.brand[600] : colors.text.secondary;
      const iconOpacity = active ? 1 : 0.7;
      const showBadge = typeof badgeCount === "number" && badgeCount > 0;

      return (
        <Pressable
          ref={ref}
          testID={testID}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          // Native screen readers read `accessibilityState.selected` above;
          // react-native-web (Storybook/Vitest) doesn't project that onto the
          // DOM, so mirror it as an explicit `aria-selected` for the web layer.
          // RN maps `aria-selected` back onto `accessibilityState.selected`, so
          // the two agree on native rather than conflicting.
          aria-selected={active}
          accessibilityLabel={accessibilityLabel ?? label}
          onPress={onPress}
          // 48×48dp minimum target (WCAG/Material) even though the visible
          // icon+label stack is smaller — `hitSlop` pads the rest.
          hitSlop={8}
          style={{
            flex: 1,
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.xs / 2,
            paddingVertical: spacing.xs,
          }}
        >
          <View>
            {/* A raw string must live inside <Text> on native; a self-contained
                icon element (e.g. SVG) must NOT be wrapped in <Text> (it breaks
                on iOS/Android), so it renders inside an opacity <View> instead. */}
            {typeof icon === "string" ? (
              <Text
                style={{ fontSize: ICON_SIZE, opacity: iconOpacity, textAlign: "center" }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                {icon}
              </Text>
            ) : (
              <View
                style={{ opacity: iconOpacity }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                {icon}
              </View>
            )}
            {showBadge ? (
              <View style={{ position: "absolute", top: -6, right: -12 }}>
                <Badge color="danger" size="xs" radius="full">
                  {formatBadgeCount(badgeCount)}
                </Badge>
              </View>
            ) : null}
          </View>
          <Text
            numberOfLines={1}
            style={{
              color: tint,
              fontSize: typography.micro.fontSize,
              lineHeight: typography.micro.lineHeight,
              fontWeight: active ? "700" : typography.micro.fontWeight,
            }}
          >
            {label}
          </Text>
        </Pressable>
      );
    },
  ),
);

BottomNavTab.displayName = "BottomNavTab";
