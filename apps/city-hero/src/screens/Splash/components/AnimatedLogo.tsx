import { LogoMark } from "@city-hero/design-system";
import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const ENTRANCE_DURATION_MS = 400;

export type AnimatedLogoProps = {
  /** Skips the fade/scale entrance when the OS "reduce motion" setting is on. */
  reduceMotion: boolean;
};

/**
 * Fades in and scales the shared `LogoMark` atom (`on-color` variant, see
 * `packages/design_system/src/atoms/LogoMark`) from 0.85 to 1.0 on mount.
 * The mark itself — frame, gradient, emoji — is design-system-owned and
 * also used statically by Login's header; this component only adds the
 * Splash-specific entrance animation around it.
 */
export function AnimatedLogo({ reduceMotion }: AnimatedLogoProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.85);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    opacity.value = withTiming(1, { duration: ENTRANCE_DURATION_MS });
    scale.value = withTiming(1, { duration: ENTRANCE_DURATION_MS });
  }, [opacity, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle} testID="splash-logo">
      <LogoMark variant="on-color" size="lg" />
    </Animated.View>
  );
}
