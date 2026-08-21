"use client";

import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef, memo } from "react";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "../../hooks/useTheme";

export type BottomNavFabProps = {
  /** Defaults to a camera glyph. Emoji/glyph string, or a self-contained icon element. */
  icon?: React.ReactNode;
  onPress: () => void;
  /** Required — the FAB has no visible text label, so a11y depends on this. */
  accessibilityLabel: string;
  testID?: string;
};

const DEFAULT_ICON = "📸";
const ICON_SIZE = 26;
// Elevated above the bar; the FAB's vertical center pokes above the bar's top edge.
const FAB_SIZE = 60;
const FAB_LIFT = 18;

/**
 * The center Camera action, rendered as an elevated FAB (not a tab). It never
 * becomes the "active" tab — pressing it opens the Camera modal, which the
 * caller wires in `onPress` (also where medium haptic feedback fires). The
 * brand→civic-purple gradient marks it as the product's anchor action, mirroring
 * `LogoMark`'s gradient treatment. Memoized so a container re-render doesn't
 * recreate it, per the spec's performance note.
 */
export const BottomNavFab = memo(
  forwardRef<React.ComponentRef<typeof Pressable>, BottomNavFabProps>(
    ({ icon, onPress, accessibilityLabel, testID }, ref) => {
      const { colors, shadows } = useTheme();
      const resolvedIcon = icon ?? DEFAULT_ICON;

      return (
        <Pressable
          ref={ref}
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          hitSlop={8}
          style={({ pressed }) => ({
            marginTop: -FAB_LIFT,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <LinearGradient
            colors={[colors.brand[500], colors.civic.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: FAB_SIZE,
              height: FAB_SIZE,
              borderRadius: FAB_SIZE / 2,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: shadows.md.ios.shadowColor,
              shadowOffset: shadows.md.ios.shadowOffset,
              shadowOpacity: shadows.md.ios.shadowOpacity,
              shadowRadius: shadows.md.ios.shadowRadius,
              elevation: shadows.md.android.elevation,
            }}
          >
            {/* String glyph goes in <Text>; a self-contained icon element must
                not be wrapped in <Text> (breaks on native) — render it as-is. */}
            {typeof resolvedIcon === "string" ? (
              <Text
                style={{ fontSize: ICON_SIZE }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                {resolvedIcon}
              </Text>
            ) : (
              <View accessibilityElementsHidden importantForAccessibility="no">
                {resolvedIcon}
              </View>
            )}
          </LinearGradient>
        </Pressable>
      );
    },
  ),
);

BottomNavFab.displayName = "BottomNavFab";
