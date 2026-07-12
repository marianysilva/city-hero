"use client";

import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Mirrors the OS "reduce motion" accessibility setting (native) / the
 * `prefers-reduced-motion` media query (react-native-web).
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        // Not implemented on this platform — keep the `false` default.
      });

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      setReduceMotion(enabled);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
