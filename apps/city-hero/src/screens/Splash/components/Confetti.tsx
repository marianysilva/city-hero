import { useEffect } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const FLOAT_DURATION_MS = 1500;

type Dot = {
  color: string;
  position: Pick<ViewStyle, "top" | "left" | "right">;
  delayMs: number;
};

// Positions/colors/delays ported from the prototype
// (design/src/screens/01-splash.js's four `.confetti` divs). These specific
// hex values are decorative accents, not a design-system token — they don't
// match any `civic`/`brand` swatch closely enough to substitute one without
// changing the look, so they're kept as literals here rather than forced
// onto an unrelated token.

const DOTS: Dot[] = [
  { color: "#FCD34D", position: { top: 80, left: 50 }, delayMs: 200 },
  { color: "#34D399", position: { top: 140, right: 60 }, delayMs: 600 },
  { color: "#F472B6", position: { top: 220, left: 30 }, delayMs: 1000 },
  { color: "#38BDF8", position: { top: 260, right: 30 }, delayMs: 1400 },
];

export type ConfettiProps = {
  reduceMotion: boolean;
};

/** Purely decorative floating dots — see the `.confetti`/`@keyframes float` prototype CSS. */
export function Confetti({ reduceMotion }: ConfettiProps) {
  return (
    <>
      {DOTS.map((dot, index) => (
        <ConfettiDot key={index} dot={dot} reduceMotion={reduceMotion} />
      ))}
    </>
  );
}

function ConfettiDot({ dot, reduceMotion }: { dot: Dot; reduceMotion: boolean }) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      // Snaps back to rest — a plain value assignment (not wrapped in an
      // animation) immediately stops whatever withRepeat loop was already
      // running, so a dot doesn't keep floating after reduce-motion turns
      // on mid-session.
      translateY.value = 0;
      rotate.value = 0;
      return;
    }

    translateY.value = withDelay(
      dot.delayMs,
      withRepeat(withTiming(-10, { duration: FLOAT_DURATION_MS }), -1, true),
    );
    rotate.value = withDelay(
      dot.delayMs,
      withRepeat(withTiming(20, { duration: FLOAT_DURATION_MS }), -1, true),
    );
  }, [dot.delayMs, reduceMotion, rotate, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[styles.dot, dot.position, { backgroundColor: dot.color }, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 2,
    opacity: 0.9,
  },
});
