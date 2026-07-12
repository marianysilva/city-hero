import React, { forwardRef, useEffect, useRef } from "react";
import { Animated, Pressable, Text, View, type PressableProps, type ViewProps } from "react-native";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTheme } from "../../hooks/useTheme";

/**
 * WCAG relative-luminance contrast check (per the spec's own formula).
 * Some token colors (e.g. warning/amber) don't clear 4.5:1 against white —
 * picking white unconditionally for filled badges fails color-contrast a11y
 * checks. `darkFallback` should be a near-black token, not a literal.
 */
function contrastText(backgroundHex: string, darkFallback: string): string {
  const hex = backgroundHex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.substring(i, i + 2), 16) / 255);
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithWhite >= 4.5 ? "#FFFFFF" : darkFallback;
}

export type BadgeColor = "brand" | "success" | "warning" | "danger" | "info" | "neutral";
export type BadgeSize = "xs" | "sm" | "md" | "lg";
export type BadgeVariant = "filled" | "outline" | "ghost";
export type BadgeRadius = "sm" | "md" | "full";

type BaseProps = {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  variant?: BadgeVariant;
  radius?: BadgeRadius;
  /** Subtle pulsing animation — respects the OS "reduce motion" setting. */
  pulse?: boolean;
  /** Visual selected state for interactive chips (e.g. FilterChipRow). */
  selected?: boolean;
};

export type BadgeProps = BaseProps &
  (
    | ({ onPress?: undefined } & Omit<ViewProps, keyof BaseProps>)
    | ({ onPress: () => void } & Omit<PressableProps, keyof BaseProps | "onPress" | "children">)
  );

const SIZE_TYPOGRAPHY: Record<BadgeSize, "micro" | "caption" | "body"> = {
  xs: "micro",
  sm: "caption",
  md: "caption",
  lg: "body",
};

/**
 * Canonical "label-shaped surface" container — status pills, category chips,
 * confidence scores, filter chips, kickers, etc. all compose this with
 * children, rather than each getting their own component. See the Badge
 * section in docs/engineering/component-inventory.md for the full set of
 * compositions this replaces.
 *
 * Styling is inline (not `className`) for the same reason as Button: this
 * Storybook/Vite NativeWind interop loses backgroundColor/padding utility
 * classes to react-native-web's Pressable/View baseline styles.
 */
export const Badge = forwardRef<View, BadgeProps>(
  (
    {
      children,
      color = "neutral",
      size = "md",
      variant = "filled",
      radius = "full",
      pulse = false,
      selected = false,
      onPress,
      ...props
    },
    ref,
  ) => {
    const { colors, spacing, radius: radiusTokens, typography } = useTheme();
    const reduceMotion = useReducedMotion();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (!pulse || reduceMotion) {
        pulseAnim.setValue(1);
        return;
      }
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }, [pulse, reduceMotion, pulseAnim]);

    const SOLID_COLOR: Record<BadgeColor, string> = {
      brand: colors.brand[500],
      success: colors.semantic.success,
      warning: colors.semantic.warning,
      danger: colors.semantic.danger,
      info: colors.semantic.info,
      neutral: colors.slate[500],
    };
    const solidColor = SOLID_COLOR[color];

    const VARIANT_STYLE: Record<
      BadgeVariant,
      { backgroundColor: string; textColor: string; borderColor?: string }
    > = {
      filled: {
        backgroundColor: solidColor,
        textColor: contrastText(solidColor, colors.slate[900]),
      },
      outline: { backgroundColor: "transparent", textColor: solidColor, borderColor: solidColor },
      ghost: { backgroundColor: `${solidColor}20`, textColor: solidColor },
    };

    const SIZE_METRICS: Record<BadgeSize, { paddingHorizontal: number; paddingVertical: number }> =
      {
        xs: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs / 2 },
        sm: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
        md: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
        lg: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
      };

    const RADIUS_VALUE: Record<BadgeRadius, number> = {
      sm: radiusTokens.sm,
      md: radiusTokens.md,
      full: radiusTokens.full,
    };

    const { backgroundColor, textColor, borderColor } = VARIANT_STYLE[variant];
    const metrics = SIZE_METRICS[size];
    const textVariant = typography[SIZE_TYPOGRAPHY[size]];

    const containerStyle = {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      alignSelf: "flex-start" as const,
      gap: spacing.xs,
      backgroundColor,
      paddingHorizontal: metrics.paddingHorizontal,
      paddingVertical: metrics.paddingVertical,
      borderRadius: RADIUS_VALUE[radius],
      borderWidth: borderColor ? 1 : selected ? 2 : 0,
      borderColor: selected ? colors.brand[600] : (borderColor ?? "transparent"),
    };

    const content =
      typeof children === "string" ? (
        <Text style={{ color: textColor, ...textVariant }}>{children}</Text>
      ) : (
        children
      );

    if (onPress) {
      return (
        <Pressable
          ref={ref as never}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={onPress}
          style={containerStyle}
          {...(props as Omit<PressableProps, "onPress" | "children">)}
        >
          <Animated.View
            style={{
              opacity: pulseAnim,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            {content}
          </Animated.View>
        </Pressable>
      );
    }

    return (
      <Animated.View
        ref={ref}
        style={[containerStyle, { opacity: pulseAnim }]}
        {...(props as Omit<ViewProps, "children">)}
      >
        {content}
      </Animated.View>
    );
  },
);

Badge.displayName = "Badge";
