"use client";

import React, { forwardRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import type { Size } from "../../tokens/size";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  // On-color variants — for CTAs sitting on top of a colorful/photo
  // background instead of the default surface (e.g. Splash's welcome
  // actions), where `primary`/`secondary`'s surface-based colors don't
  // have enough contrast.
  | "inverse"
  | "glass";
export type ButtonSize = Size;

export type ButtonProps = Omit<PressableProps, "children" | "style" | "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  /** Rendered before the label — e.g. a provider mark on a social-login button. */
  icon?: React.ReactNode;
  children: string;
};

const SIZE_TYPOGRAPHY: Record<ButtonSize, "caption" | "body" | "bodyBold"> = {
  xs: "caption",
  sm: "caption",
  md: "body",
  lg: "bodyBold",
};

/**
 * Primary action atom. Variant is a discriminated set (not boolean flags —
 * see docs/engineering/design-system.md) and every visual value (color,
 * spacing, radius, type scale) comes from design tokens, never a literal.
 *
 * Colors/spacing/radius are applied via inline `style` rather than
 * `className` — see "Known limitations" in docs/engineering/design-system.md.
 */
export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
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

    const VARIANT_COLORS: Record<
      ButtonVariant,
      { bg: string; bgPressed: string; text: string; border?: { width: number; color: string } }
    > = {
      primary: { bg: colors.brand[500], bgPressed: colors.brand[600], text: "#FFFFFF" },
      secondary: {
        bg: colors.slate[100],
        bgPressed: colors.slate[200],
        text: colors.slate[900],
        border: { width: 1, color: colors.slate[200] },
      },
      ghost: { bg: "transparent", bgPressed: colors.brand[50], text: colors.brand[600] },
      destructive: {
        bg: colors.semantic.danger,
        bgPressed: colors.semantic.dangerPressed,
        text: "#FFFFFF",
      },
      inverse: { bg: "#FFFFFF", bgPressed: colors.brand[50], text: colors.brand[700] },
      glass: {
        bg: "rgba(255,255,255,0.15)",
        bgPressed: "rgba(255,255,255,0.25)",
        text: "#FFFFFF",
        border: { width: 1, color: "rgba(255,255,255,0.25)" },
      },
    };

    const SIZE_METRICS: Record<
      ButtonSize,
      { paddingHorizontal: number; paddingVertical: number; borderRadius: number }
    > = {
      xs: {
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs / 2,
        borderRadius: radius.sm,
      },
      sm: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
      md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md },
      lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md },
    };

    const { bg, bgPressed, text, border } = VARIANT_COLORS[variant];
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
          gap: spacing.sm,
          backgroundColor: pressed && !isDisabled ? bgPressed : bg,
          opacity: isDisabled ? 0.4 : 1,
          borderWidth: border?.width ?? 0,
          borderColor: border?.color ?? "transparent",
        }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={text} />
        ) : (
          <>
            {icon}
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
          </>
        )}
      </Pressable>
    );
  },
);

Button.displayName = "Button";
