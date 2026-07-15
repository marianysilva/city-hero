/**
 * `web` values live in ./shared-values.js (shared with tailwind.preset.js).
 * `soft` is ported from the prototype's `shadow-soft` Tailwind extension
 * (design/index.html: `0 10px 30px -10px rgba(15,23,42,.18)`). `md`/`lg`
 * extrapolate from it — not pulled from a design file, refine later.
 *
 * React Native has no CSS `box-shadow`; each variant also ships iOS
 * (shadowColor/Offset/Opacity/Radius) and Android (elevation) equivalents.
 * These are visual approximations of the web value, not an exact conversion.
 */
import sharedValues from "./shared-values.js";

export type ShadowToken = {
  web: string;
  ios: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  android: {
    elevation: number;
  };
};

export const shadows: Record<"soft" | "md" | "lg", ShadowToken> = {
  soft: {
    web: sharedValues.shadows.soft,
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
    },
    android: { elevation: 4 },
  },
  md: {
    web: sharedValues.shadows.md,
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 14,
    },
    android: { elevation: 8 },
  },
  lg: {
    web: sharedValues.shadows.lg,
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.24,
      shadowRadius: 20,
    },
    android: { elevation: 12 },
  },
};
