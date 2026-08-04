import { useReducedMotion, useTheme } from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { AnimatedLogo } from "./components/AnimatedLogo";
import { Confetti } from "./components/Confetti";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { RotatingTagline } from "./components/RotatingTagline";
import { WelcomeActions } from "./components/WelcomeActions";
import { styles } from "./SplashScreen.styles";

const MIN_SPLASH_DURATION_MS = 800;
const SHOW_LOADING_AFTER_MS = 5000;
const HARD_TIMEOUT_MS = 10000;
const TEXT_ENTRANCE_DELAY_MS = 150;
const TEXT_ENTRANCE_DURATION_MS = 400;

export type SplashReadyReason = "ready" | "timeout";

export type SplashScreenProps = {
  /**
   * True once the parent's init sequence (auth/version/deep-link checks,
   * see 02-app-initialization.md) has finished. Defaults to `true` since
   * that task doesn't exist yet — until it lands, the splash only waits on
   * its own minimum-display timer.
   */
  isReady?: boolean;
  /**
   * Called once it's safe to hand off to routing (03-routing-decision.md,
   * not built yet): either `isReady` became true and the minimum display
   * time elapsed, or the 10s hard timeout was reached. Defaults to a no-op.
   */
  onReady?: (reason: SplashReadyReason) => void;
};

// Placeholder until the shared observability package
// (00-foundation/20-observability-package.md) ships — see
// docs/engineering/observability.md.
function logTelemetryEvent(event: string, props?: Record<string, unknown>) {
  if (__DEV__) {
    console.info(`[telemetry] ${event}`, props);
  }
}

export function SplashScreen({ isReady = true, onReady = () => {} }: SplashScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [showLoading, setShowLoading] = useState(false);

  const mountedAtRef = useRef<number | null>(null);
  const navigatedRef = useRef(false);

  const textOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const textTranslateY = useSharedValue(reduceMotion ? 0 : 8);

  useEffect(() => {
    mountedAtRef.current = Date.now();
    logTelemetryEvent("splash.mounted");

    if (reduceMotion) {
      textOpacity.value = 1;
      textTranslateY.value = 0;
    } else {
      textOpacity.value = withDelay(
        TEXT_ENTRANCE_DELAY_MS,
        withTiming(1, { duration: TEXT_ENTRANCE_DURATION_MS }),
      );
      textTranslateY.value = withDelay(
        TEXT_ENTRANCE_DELAY_MS,
        withTiming(0, { duration: TEXT_ENTRANCE_DURATION_MS }),
      );
    }

    const loadingTimer = setTimeout(() => {
      if (navigatedRef.current) return;
      setShowLoading(true);
    }, SHOW_LOADING_AFTER_MS);
    const hardTimeoutTimer = setTimeout(() => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      logTelemetryEvent("splash.timeout", { init_state: "partial" });
      onReady("timeout");
    }, HARD_TIMEOUT_MS);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(hardTimeoutTimer);
    };
    // Timers and the entrance animation only ever run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isReady || navigatedRef.current) return;

    const elapsed = Date.now() - (mountedAtRef.current ?? Date.now());
    const remaining = Math.max(0, MIN_SPLASH_DURATION_MS - elapsed);

    const timer = setTimeout(() => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      logTelemetryEvent("splash.navigated", {
        duration_ms: Date.now() - (mountedAtRef.current ?? Date.now()),
      });
      onReady("ready");
    }, remaining);

    return () => clearTimeout(timer);
  }, [isReady, onReady]);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const accessibilityLabel = `${t("common.appName")}. ${t("common.appTagline")}. ${t("common.loading")}`;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.brand[500], colors.brand[600], colors.civic.purple]}
        locations={[0, 0.35, 1]}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={styles.container}
      >
        <Confetti reduceMotion={reduceMotion} />

        <View
          style={styles.content}
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={accessibilityLabel}
        >
          <View />

          <View style={styles.middleWrap}>
            <AnimatedLogo reduceMotion={reduceMotion} />

            <Animated.View style={[styles.textWrap, textAnimatedStyle]}>
              <Text style={styles.name}>{t("common.appName")}</Text>
            </Animated.View>

            <RotatingTagline reduceMotion={reduceMotion} />

            {showLoading && <LoadingIndicator color="rgba(255,255,255,0.85)" />}
          </View>

          <WelcomeActions />
        </View>
      </LinearGradient>
    </View>
  );
}
