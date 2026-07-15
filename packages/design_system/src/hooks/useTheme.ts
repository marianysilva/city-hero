"use client";

import { useThemeContext } from "../theme/ThemeProvider";
import type { Theme } from "../tokens/theme";

/** Read the active theme (tokens resolved for the current light/dark scheme). */
export function useTheme(): Theme {
  return useThemeContext().theme;
}
