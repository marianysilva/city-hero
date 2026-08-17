"use client";

import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef } from "react";
import { Text, View, type ViewProps } from "react-native";

import { useTheme } from "../../hooks/useTheme";

export type LogoMarkVariant = "on-color" | "on-light";
export type LogoMarkSize = "md" | "lg";

export type LogoMarkProps = Omit<ViewProps, "style" | "children"> & {
  /**
   * `on-color` sits on the brand gradient background (Splash's full-screen
   * hero): translucent frame, white-to-brand-100 inner gradient. `on-light`
   * sits on a white/light surface (Login's header): the frame itself carries
   * the brand gradient, with a solid white inner mark.
   */
  variant?: LogoMarkVariant;
  size?: LogoMarkSize;
};

const SIZE_METRICS: Record<
  LogoMarkSize,
  { frame: number; frameRadius: number; mark: number; markRadius: number; icon: number }
> = {
  lg: { frame: 96, frameRadius: 24, mark: 64, markRadius: 16, icon: 30 },
  md: { frame: 64, frameRadius: 16, mark: 40, markRadius: 12, icon: 24 },
};

// Named per docs/engineering/design-system.md's inline-style convention —
// react-native/no-color-literals only allows literals when they're a
// variable reference, not written directly inside a `style` object (same
// pattern Button.tsx's VARIANT_COLORS follows).
const ON_LIGHT_MARK_BG = "#FFFFFF";
const ON_COLOR_FRAME_BG = "rgba(255,255,255,0.15)";
const ON_COLOR_FRAME_BORDER = "rgba(255,255,255,0.2)";

/**
 * The CityHero mark — shared between Splash's animated hero logo and
 * Login's static header logo. Previously duplicated between the two; see
 * docs/engineering/design-system.md ("promote as soon as the second screen
 * wants the same piece"). Callers that need an entrance animation (Splash)
 * wrap this in their own `Animated.View`/shared values rather than this
 * atom owning animation — components don't know about navigation or
 * screen-specific timing, per the same doc's React patterns.
 */
export const LogoMark = forwardRef<View, LogoMarkProps>(
  ({ variant = "on-color", size = "lg", ...props }, ref) => {
    const { colors } = useTheme();
    const { frame, frameRadius, mark, markRadius, icon } = SIZE_METRICS[size];

    const markStyle = {
      width: mark,
      height: mark,
      borderRadius: markRadius,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    };

    if (variant === "on-light") {
      return (
        <LinearGradient
          ref={ref as never}
          colors={[colors.brand[500], colors.civic.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: frame,
            height: frame,
            borderRadius: frameRadius,
            alignItems: "center",
            justifyContent: "center",
          }}
          {...props}
        >
          <View style={[markStyle, { backgroundColor: ON_LIGHT_MARK_BG }]}>
            <Text style={{ fontSize: icon }}>🦸</Text>
          </View>
        </LinearGradient>
      );
    }

    return (
      <View
        ref={ref}
        style={{
          width: frame,
          height: frame,
          borderRadius: frameRadius,
          backgroundColor: ON_COLOR_FRAME_BG,
          borderWidth: 1,
          borderColor: ON_COLOR_FRAME_BORDER,
          alignItems: "center",
          justifyContent: "center",
        }}
        {...props}
      >
        <LinearGradient
          colors={["#FFFFFF", colors.brand[100]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={markStyle}
        >
          <Text style={{ fontSize: icon }}>🦸</Text>
        </LinearGradient>
      </View>
    );
  },
);

LogoMark.displayName = "LogoMark";
