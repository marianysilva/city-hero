export { useTheme } from "./useTheme";
export { useReducedMotion } from "./useReducedMotion";

// useStatusBarVariant is deliberately NOT re-exported here. It imports
// expo-router/expo-status-bar (Expo Router / native-only), which are not
// installed in apps/web and whose transitive React Native source Vite
// can't parse for the web build (see apps/web/vitest.config.ts's
// react-native-web alias note) — barrel-exporting it from here would pull
// that import chain into every consumer of "@city-hero/design-system",
// including apps/web, and break it. Import it directly from
// "@city-hero/design-system/hooks/useStatusBarVariant" instead (apps/city-hero only).
