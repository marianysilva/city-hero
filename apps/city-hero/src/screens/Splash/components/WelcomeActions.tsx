import { Button } from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

// The Gov.br and privacy-policy integrations don't exist yet — these stay
// stub hand-offs so the buttons are tappable and visibly wired, per the
// prototype (design/src/screens/01-splash.js). Email login now has a real
// screen (01a-login) to hand off to.
function notImplemented(action: string) {
  console.log(`[Splash] Not implemented yet: ${action}`);
}

export type WelcomeActionsProps = {
  /** Defaults to the same "not implemented" stub the other two actions use,
   * for standalone rendering (e.g. Storybook, tests) without a router. */
  onEmailLogin?: () => void;
};

export function WelcomeActions({
  onEmailLogin = () => notImplemented("email login"),
}: WelcomeActionsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Button testID="splash-cta-email" variant="inverse" size="lg" onPress={onEmailLogin}>
        {t("splash.ctaEmail")}
      </Button>

      <View style={styles.secondaryButtonSpacing}>
        <Button
          testID="splash-cta-govbr"
          variant="glass"
          size="lg"
          icon={
            <LinearGradient
              colors={["#FDE047", "#4ADE80"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.govBrIcon}
            />
          }
          onPress={() => notImplemented("Gov.br login")}
        >
          {t("splash.ctaGovBr")}
        </Button>
      </View>

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
  // No `alignItems` override — Button (a Pressable) stretches to fill this
  // 100%-width container via Flexbox's default `alignItems: "stretch"`,
  // matching the prototype's `w-full` buttons without Button needing to
  // expose a `style`/`className` prop (deliberately omitted — see Button.tsx).
  container: {
    width: "100%",
  },
  secondaryButtonSpacing: {
    marginTop: 10,
  },
  govBrIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
