import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const ENTRANCE_DURATION_MS = 400;

export type AnimatedLogoProps = {
  /** Skips the fade/scale entrance when the OS "reduce motion" setting is on. */
  reduceMotion: boolean;
};

/**
 * The CityHero mark: a rounded gradient square (brand-orange → civic-purple,
 * constant across light/dark — see 01-render-splash-ui.md's "System dark
 * mode" scenario) that fades in and scales from 0.85 to 1.0 on mount.
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
      <LinearGradient
        colors={["#F97316", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mark}
      >
        <Text style={styles.icon}>🦸</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 40,
  },
});
