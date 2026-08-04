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
 * The CityHero mark, per the prototype (design/src/screens/01-splash.js): a
 * translucent rounded frame around an inner white-to-brand-100 gradient
 * square. Fades in and scales from 0.85 to 1.0 on mount.
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
    <Animated.View style={[styles.frame, animatedStyle]} testID="splash-logo">
      <LinearGradient
        colors={["#FFFFFF", "#FFEDD5"]}
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
  frame: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 30,
  },
});
