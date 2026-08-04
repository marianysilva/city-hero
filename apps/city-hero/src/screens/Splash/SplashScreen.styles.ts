import { StyleSheet } from "react-native";

/**
 * Layout mirrors the prototype's flex column
 * (design/src/screens/01-splash.js: `justify-between`, empty top spacer,
 * centered middle block, bottom CTA block). Colors are white/translucent-
 * white throughout — the background is a fixed brand gradient (see
 * SplashScreen.tsx), not theme-dependent.
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 56,
  },
  middleWrap: {
    alignItems: "center",
    marginTop: 16,
  },
  textWrap: {
    alignItems: "center",
  },
  name: {
    marginTop: 16,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#FFFFFF",
  },
});
