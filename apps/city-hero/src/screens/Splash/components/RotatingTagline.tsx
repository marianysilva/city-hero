import { useTranslation } from "@city-hero/i18n";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const TAGLINE_COUNT = 6;
const CYCLE_INTERVAL_MS = 3000;
const FADE_DURATION_MS = 400;

export type RotatingTaglineProps = {
  /** Freezes on the first tagline, matching the prototype's `prefers-reduced-motion` override. */
  reduceMotion: boolean;
};

/**
 * Cycles through 6 marketing taglines every 3s (18s full loop) — see the
 * `.rot-line`/`@keyframes rot-cycle` prototype CSS
 * (design/src/styles/base.css). The stable `common.appTagline` key (used for
 * the screen's accessibilityLabel) is deliberately separate from these, so a
 * screen reader isn't re-announced every 3 seconds.
 */
export function RotatingTagline({ reduceMotion }: RotatingTaglineProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const opacity = useSharedValue(1);

  const taglines = [
    t("splash.tagline1"),
    t("splash.tagline2"),
    t("splash.tagline3"),
    t("splash.tagline4"),
    t("splash.tagline5"),
    t("splash.tagline6"),
  ];

  useEffect(() => {
    if (reduceMotion) return;

    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % TAGLINE_COUNT);
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: FADE_DURATION_MS });
  }, [index, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]} testID="splash-tagline">
      <Text style={styles.text}>{taglines[index]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    minHeight: 44,
    maxWidth: 260,
    justifyContent: "center",
  },
  text: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
