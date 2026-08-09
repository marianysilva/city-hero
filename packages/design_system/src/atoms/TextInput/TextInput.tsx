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
 * shadow rather than a second wrapping view. `shadowColor`/`shadowOpacity`
 * only render on iOS; Android needs `elevation` too (and even then can't
 * render a *colored* shadow — elevation is grayscale-only there), so the
 * border-width/color change is the primary focus cue on Android, with
 * elevation as a secondary depth cue. First-pass approximation, matching
 * this repo's "refine against real designs" tolerance (see
 * design-system.md's Storybook setup section).
 */
// Named per docs/engineering/design-system.md's inline-style convention —
// react-native/no-color-literals only allows a literal when it's a variable
// reference, not written directly inside a `style` object.
const NO_SHADOW = "transparent";

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
            shadowColor: focused ? colors.brand[100] : NO_SHADOW,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: focused ? 1 : 0,
            shadowRadius: 4,
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
