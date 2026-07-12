"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { darkTheme, lightTheme, type Theme } from "../tokens/theme";

export type SchemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  preference: SchemePreference;
  setPreference: (preference: SchemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: React.ReactNode;
  /**
   * Defaults to "system". Pass a persisted value to restore a user override.
   * Only read once, as the initial state — changing this prop on a later
   * render does *not* update an already-mounted provider. To force a new
   * preference onto a mounted tree, remount with a different `key` (see
   * `.storybook/preview.tsx`'s `key={globals.theme}`) or call the `setPreference`
   * function from `useThemeContext()` instead.
   */
  initialPreference?: SchemePreference;
  /**
   * Called whenever the resolved preference changes (system or manual).
   * The host app owns persistence (AsyncStorage on native, localStorage on
   * web) — this package stays storage-agnostic so it works on both.
   */
  onPreferenceChange?: (preference: SchemePreference) => void;
};

export function ThemeProvider({
  children,
  initialPreference = "system",
  onPreferenceChange,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<SchemePreference>(initialPreference);

  // apps/city-hero renders web statically (no window/matchMedia at prerender
  // time), so the first client render must match the server's "light"
  // fallback exactly. Only start trusting the real system scheme after
  // mount, once hydration is safely past — the same pattern next-themes
  // uses for SSR-safe theme switching.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    // Deliberate one-time post-hydration render, same as next-themes/Chakra's
    // SSR-safe theme switching — not the "derive state from a prop" anti-
    // pattern the set-state-in-effect rule is meant to catch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  const setPreference = useCallback(
    (next: SchemePreference) => {
      setPreferenceState(next);
      onPreferenceChange?.(next);
    },
    [onPreferenceChange],
  );

  const resolvedScheme =
    preference === "system" ? (hasMounted ? (systemScheme ?? "light") : "light") : preference;
  const theme = resolvedScheme === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, preference, setPreference }),
    [theme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme() must be called within a <ThemeProvider>.");
  }
  return ctx;
}
