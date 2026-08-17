import { Button, TextInput, useTheme } from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput as RNTextInput, View } from "react-native";

export type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  onForgotPassword: () => void;
};

/**
 * Email + password fields, forgot-password link, and the "Entrar" submit
 * button. No authentication logic — `onSubmit`/`onForgotPassword` are
 * no-ops until 01a-login/02-email-password-auth.md wires them up.
 */
export function LoginForm({ onSubmit, onForgotPassword }: LoginFormProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordRef = useRef<RNTextInput>(null);

  const handleSubmit = () => onSubmit(email, password);

  return (
    <View style={{ gap: spacing.md }}>
      <TextInput
        label={t("auth.emailLabel")}
        placeholder={t("auth.emailPlaceholder")}
        value={email}
        onChangeText={setEmail}
        icon={
          <Text
            style={[styles.fieldIcon, { color: colors.slate[400] }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            ✉
          </Text>
        }
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        // textContentType is iOS-only; autoComplete covers Android's
        // equivalent password-manager/autofill integration.
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
        testID="login-email-input"
      />

      <TextInput
        ref={passwordRef}
        label={t("auth.passwordLabel")}
        placeholder={t("auth.passwordPlaceholder")}
        value={password}
        onChangeText={setPassword}
        icon={
          <Text
            style={[styles.fieldIcon, { color: colors.slate[400] }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            🔒
          </Text>
        }
        secureTextEntry={!passwordVisible}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        testID="login-password-input"
        rightElement={
          <Pressable
            onPress={() => setPasswordVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? t("auth.hidePasswordA11y") : t("auth.showPasswordA11y")
            }
            hitSlop={8}
            testID="login-password-toggle"
          >
            <Text style={[styles.toggleText, { color: colors.brand[500] }]}>
              {passwordVisible ? t("auth.hidePassword") : t("auth.showPassword")}
            </Text>
          </Pressable>
        }
      />

      <View style={styles.forgotRow}>
        <Pressable onPress={onForgotPassword} hitSlop={8} testID="login-forgot-password">
          <Text style={[styles.forgotText, { color: colors.brand[600] }]}>
            {t("auth.forgotPassword")}
          </Text>
        </Pressable>
      </View>

      <Button variant="primary" size="lg" onPress={handleSubmit} testID="login-submit">
        {t("auth.signIn")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldIcon: {
    fontSize: 15,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "700",
  },
  forgotRow: {
    alignItems: "flex-end",
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
