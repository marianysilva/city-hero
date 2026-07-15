import { useTheme } from "@city-hero/design-system";

// Delegates to the design system's ThemeProvider so every consumer of scheme
// (nav chrome via NavigationThemeBridge, tab bar, Themed.tsx) agrees — a
// single component previously reading this directly from `react-native`
// and another reading `useTheme().scheme` could permanently disagree (e.g.
// the old web override always returned "light").
export const useColorScheme = () => useTheme().scheme;
