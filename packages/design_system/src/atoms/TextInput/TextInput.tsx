"use client";

import React, { forwardRef, useState } from "react";
import {
  TextInput as RNTextInput,
  View,
  Text,
  type TextInputProps as RNTextInputProps,
} from "react-native";

import { useTheme } from "../../hooks/useTheme";

export type TextInputProps = Omit<RNTextInputProps, "style" | "placeholderTextColor"> & {
  label: string;
  /** Rendered before the input — e.g. an envelope/lock glyph. */
  icon?: React.ReactNode;
  /** Rendered after the input, inside the field — e.g. a password-reveal toggle. */
  rightElement?: React.ReactNode;
};

/**
 * Labeled text field with a focus ring and optional leading/trailing
 * slots — composition over configuration (docs/engineering/design-system.md):
 * this atom doesn't know about password visibility, validation, or search;
 * callers compose those via `rightElement`/`secureTextEntry`/`onChangeText`.
 *
 * The "ring" around the border on focus is approximated with a colored
 * `boxShadow` (RN 0.76+'s spec-compliant, cross-platform shadow prop —
 * superseded the platform-specific `shadowColor`/`shadowOffset`/
 * `shadowOpacity`/`shadowRadius` set, which react-native-web now warns are
 * deprecated) rather than a second wrapping view. Android still needs
 * `elevation` for outset shadows to render at all pre-Android 10, as a
 * secondary depth cue alongside the border-width/color change. First-pass
 * approximation, matching this repo's "refine against real designs"
 * tolerance (see design-system.md's Storybook setup section).
 */
export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ label, icon, rightElement, onFocus, onBlur, accessibilityLabel, ...props }, ref) => {
    const { colors, spacing, radius, typography, scheme } = useTheme();
    const [focused, setFocused] = useState(false);

    return (
      <View>
        <Text
          style={{
            ...typography.micro,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: colors.text.secondary,
            marginBottom: spacing.xs,
            marginLeft: spacing.xs / 2,
          }}
        >
          {label}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            borderWidth: focused ? 2 : 1,
            borderColor: focused ? colors.brand[400] : colors.border,
            boxShadow: focused ? `0px 0px 4px ${colors.brand[100]}` : undefined,
            elevation: focused ? 3 : 0,
          }}
        >
          {icon}
          <RNTextInput
            ref={ref}
            style={{
              flex: 1,
              ...typography.body,
              fontWeight: "500",
              fontSize: 14,
              color: colors.text.primary,
            }}
            placeholderTextColor={scheme === "dark" ? colors.slate[500] : colors.slate[300]}
            accessibilityLabel={accessibilityLabel ?? label}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {rightElement}
        </View>
      </View>
    );
  },
);

TextInput.displayName = "TextInput";
