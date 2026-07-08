import { colors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

/**
 * Brand/civic/semantic hues are constant across themes — only the
 * surface/text/border scale flips between light and dark.
 */
export type Theme = {
  scheme: "light" | "dark";
  colors: typeof colors & {
    background: string;
    surface: string;
    border: string;
    text: { primary: string; secondary: string; inverse: string };
  };
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
};

export const lightTheme: Theme = {
  scheme: "light",
  colors: {
    ...colors,
    background: "#FFFFFF",
    surface: colors.slate[50],
    border: colors.slate[200],
    text: {
      primary: colors.slate[900],
      secondary: colors.slate[500],
      inverse: "#FFFFFF",
    },
  },
  typography,
  spacing,
  radius,
  shadows,
};

export const darkTheme: Theme = {
  scheme: "dark",
  colors: {
    ...colors,
    background: colors.slate[900],
    surface: colors.slate[800],
    border: colors.slate[700],
    text: {
      primary: "#FFFFFF",
      secondary: colors.slate[400],
      inverse: colors.slate[900],
    },
  },
  typography,
  spacing,
  radius,
  shadows,
};
