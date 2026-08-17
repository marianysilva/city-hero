import { LogoMark, useTheme } from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";
import { StyleSheet, Text, View } from "react-native";

/**
 * Logo + heading + subtitle. Grouped under a single `accessible` node so a
 * screen reader announces them together — scoped to this non-interactive
 * block only, never wrapping the form's inputs/buttons (that exact mistake
 * shipped once in Splash and made its CTAs unreachable; see
 * apps/city-hero/src/screens/Splash/SplashScreen.tsx's history).
 */
export function LoginHeader() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const accessibilityLabel = `${t("auth.loginHeading")}. ${t("auth.loginSubtitle")}`;

  return (
    <View style={styles.container} accessible accessibilityLabel={accessibilityLabel}>
      <LogoMark variant="on-light" size="md" testID="login-logo" />
      <Text style={[styles.heading, { color: colors.text.primary }]}>{t("auth.loginHeading")}</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        {t("auth.loginSubtitle")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  heading: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
});
