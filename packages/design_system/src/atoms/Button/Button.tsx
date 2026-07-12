import React, { forwardRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { useTheme } from "../../hooks/useTheme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "children" | "style" | "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  children: string;
};

const SIZE_TYPOGRAPHY: Record<ButtonSize, "caption" | "body" | "bodyBold"> = {
  sm: "caption",
  md: "body",
  lg: "bodyBold",
};

/**
 * Primary action atom. Variant is a discriminated set (not boolean flags —
 * see docs/engineering/design-system.md) and every visual value (color,
 * spacing, radius, type scale) comes from design tokens, never a literal.
 *
 * Colors/spacing/radius are applied via inline `style` (a plain object, not
 * the `style={(state) => ...}` callback form — that form isn't picked up by
 * this Storybook/Vite NativeWind interop). react-native-web's Pressable
 * injects its own baseline backgroundColor/padding rules that win the
 * cascade over Tailwind `className` utilities on this element (confirmed
 * empirically — layout classes like `flex-row` are unaffected). Press
 * feedback uses onPressIn/onPressOut + local state instead of the style
 * callback, for the same reason.
 */
export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      onPressIn,
      onPressOut,
      ...props
    },
    ref,
  ) => {
    const { colors, spacing, radius, typography } = useTheme();
    const [pressed, setPressed] = useState(false);
    const isDisabled = disabled || loading;
    const textVariant = typography[SIZE_TYPOGRAPHY[size]];

    const VARIANT_COLORS: Record<ButtonVariant, { bg: string; bgPressed: string; text: string }> = {
      primary: { bg: colors.brand[500], bgPressed: colors.brand[600], text: "#FFFFFF" },
      secondary: { bg: colors.slate[100], bgPressed: colors.slate[200], text: colors.slate[900] },
      ghost: { bg: "transparent", bgPressed: colors.brand[50], text: colors.brand[600] },
      destructive: {
        bg: colors.semantic.danger,
        bgPressed: colors.semantic.danger,
        text: "#FFFFFF",
      },
    };

    const SIZE_METRICS: Record<
      ButtonSize,
      { paddingHorizontal: number; paddingVertical: number; borderRadius: number }
    > = {
      sm: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
      md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md },
      lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md },
    };

    const { bg, bgPressed, text } = VARIANT_COLORS[variant];
    const metrics = SIZE_METRICS[size];

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        className="flex-row items-center justify-center"
        onPressIn={(e) => {
          setPressed(true);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          setPressed(false);
          onPressOut?.(e);
        }}
        style={{
          ...metrics,
          backgroundColor: pressed && !isDisabled ? bgPressed : bg,
          opacity: isDisabled ? 0.4 : 1,
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: colors.slate[200],
        }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={text} />
        ) : (
          <Text
            style={{
              color: text,
              fontSize: textVariant.fontSize,
              lineHeight: textVariant.lineHeight,
              fontWeight: textVariant.fontWeight,
            }}
          >
            {children}
          </Text>
        )}
      </Pressable>
    );
  },
);

Button.displayName = "Button";
