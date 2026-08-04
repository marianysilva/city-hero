import { StyleSheet } from "react-native";

/**
 * Layout-only styles (no color tokens — those are theme-dependent and
 * applied inline in SplashScreen.tsx, same convention as the design
 * system's Button atom).
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoWrap: {
    alignItems: "center",
  },
  name: {
    marginTop: 16,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 260,
  },
  textWrap: {
    alignItems: "center",
  },
});
