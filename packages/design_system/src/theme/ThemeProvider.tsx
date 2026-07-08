import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
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
  /** Defaults to "system". Pass a persisted value to restore a user override. */
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

  const setPreference = useCallback(
    (next: SchemePreference) => {
      setPreferenceState(next);
      onPreferenceChange?.(next);
    },
    [onPreferenceChange],
  );

  const resolvedScheme = preference === "system" ? (systemScheme ?? "light") : preference;
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
