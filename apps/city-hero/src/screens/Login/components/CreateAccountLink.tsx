import { useTheme } from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";
import { StyleSheet, Text, View } from "react-native";

export type CreateAccountLinkProps = {
  onCreateAccount: () => void;
};

export function CreateAccountLink({ onCreateAccount }: CreateAccountLinkProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.text.secondary }]}>
        {t("auth.noAccountPrompt")}
        <Text
          testID="login-create-account"
          accessibilityRole="link"
          onPress={onCreateAccount}
          style={[styles.link, { color: colors.brand[600] }]}
        >
          {t("auth.createAccount")}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  text: {
    fontSize: 13,
  },
  link: {
    fontWeight: "700",
  },
});
