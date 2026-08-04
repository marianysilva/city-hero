import { useTranslation } from "@city-hero/i18n";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Screens 01a-login (email) and the Gov.br/privacy-policy integrations don't
// exist yet — these are stub hand-offs so the buttons are tappable and
// visibly wired, per the prototype (design/src/screens/01-splash.js).
function notImplemented(action: string) {
  console.log(`[Splash] Not implemented yet: ${action}`);
}

export function WelcomeActions() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Pressable
        testID="splash-cta-email"
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={() => notImplemented("email login")}
      >
        <Text style={styles.primaryButtonText}>{t("splash.ctaEmail")}</Text>
      </Pressable>

      <Pressable
        testID="splash-cta-govbr"
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={() => notImplemented("Gov.br login")}
      >
        <LinearGradient
          colors={["#FDE047", "#4ADE80"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.govBrIcon}
        />
        <Text style={styles.secondaryButtonText}>{t("splash.ctaGovBr")}</Text>
      </Pressable>

      <Text style={styles.privacyText}>
        {t("splash.privacyBeforeLink")}
        <Text
          testID="splash-privacy-link"
          accessibilityRole="link"
          style={styles.privacyLink}
          onPress={() => notImplemented("privacy policy")}
        >
          {t("splash.privacyLinkText")}
        </Text>
        {t("splash.privacyAfterLink")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#C2410C",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 10,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  govBrIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  privacyText: {
    marginTop: 12,
    textAlign: "center",
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    lineHeight: 14,
    paddingHorizontal: 12,
  },
  privacyLink: {
    textDecorationLine: "underline",
  },
});
