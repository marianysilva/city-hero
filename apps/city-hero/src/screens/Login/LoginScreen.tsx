import { useTheme } from "@city-hero/design-system";
import { useStatusBarVariant } from "@city-hero/design-system/hooks/useStatusBarVariant";
import { useTranslation } from "@city-hero/i18n";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { logTelemetryEvent } from "@/lib/telemetry";

import { CreateAccountLink } from "./components/CreateAccountLink";
import { LoginForm } from "./components/LoginForm";
import { LoginHeader } from "./components/LoginHeader";
import { styles } from "./LoginScreen.styles";

export type LoginSource = "splash" | "deep_link";

export type LoginScreenProps = {
  /** How the user reached this screen — analytics only. Defaults to "splash", the only entry
   * point wired up so far (deep-link handling isn't built yet, see 00-foundation/12). */
  source?: LoginSource;
  /** Called when the back button is pressed. Defaults to a no-op — the caller (a route file)
   * owns actual navigation. */
  onBack?: () => void;
  /** No authentication logic in this task — wired up in 01a-login/02-email-password-auth.md. */
  onSubmit?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
};

export function LoginScreen({
  source = "splash",
  onBack = () => {},
  onSubmit = () => {},
  onForgotPassword = () => {},
  onCreateAccount = () => {},
}: LoginScreenProps) {
  const { t } = useTranslation();
  const { colors, scheme } = useTheme();
  useStatusBarVariant("auto");

  const accessibilityLabel = `${t("auth.loginHeading")}. ${t("auth.loginSubtitle")}`;

  useEffect(() => {
    logTelemetryEvent("login.screen_viewed", { source });
    // accessibilityLiveRegion has no effect on iOS (Android-only); this is
    // the cross-platform equivalent so VoiceOver also announces on mount
    // instead of only if the header happens to receive focus — same fix
    // applied to Splash after its own a11y review.
    AccessibilityInfo.announceForAccessibility(accessibilityLabel);
    // Runs once on mount; `source` and the composed label are static for
    // the lifetime of this screen instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleForgotPassword = () => {
    logTelemetryEvent("login.forgot_tapped");
    onForgotPassword();
  };

  const handleCreateAccount = () => {
    logTelemetryEvent("login.create_tapped");
    onCreateAccount();
  };

  // Per the task's "System dark mode" AC: background follows the theme
  // (subtle brand-tinted gradient in light, deep slate in dark) while the
  // logo mark's own gradient (LogoMark) stays constant — brand identity
  // doesn't change. Mirrors Splash's same dark-mode background approach.
  const backgroundColors =
    scheme === "dark"
      ? ([colors.slate[900], colors.slate[800]] as const)
      : (["#FFFFFF", colors.brand[50]] as const);

  return (
    <View style={styles.container}>
      <LinearGradient colors={backgroundColors} style={styles.container} testID="login-background">
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t("common.back")}
              hitSlop={8}
              style={[styles.backButton, { backgroundColor: colors.surface }]}
              testID="login-back-button"
            >
              <Text style={{ color: colors.text.secondary, fontSize: 16 }}>←</Text>
            </Pressable>

            <View style={styles.content}>
              <LoginHeader />

              <View style={styles.formWrap}>
                <LoginForm onSubmit={onSubmit} onForgotPassword={handleForgotPassword} />
              </View>

              <View style={styles.bottomLink}>
                <CreateAccountLink onCreateAccount={handleCreateAccount} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
