import { useTranslation } from "@city-hero/i18n";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export type LoadingIndicatorProps = {
  color: string;
};

/**
 * Discreet "Loading…" hint, only mounted by SplashScreen after the 5s
 * threshold — see 01-render-splash-ui.md's "Maximum time (timeout)" scenario.
 */
export function LoadingIndicator({ color }: LoadingIndicatorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID="splash-loading-indicator">
      <ActivityIndicator size="small" color={color} />
      <Text style={[styles.label, { color }]}>{t("common.loading")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
});
