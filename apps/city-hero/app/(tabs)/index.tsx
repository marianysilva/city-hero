import { Badge } from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";
import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";

export default function TabOneScreen() {
  // i18n usage example — proves the LocaleProvider wired in app/_layout.tsx
  // reaches real screens, ahead of 06-home-map/01-render-home-ui-base.md
  // building the actual Home screen this key belongs to.
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Design-system usage example: shared Badge atom, same component the
          web dashboard renders (apps/web/app/(dashboard)/page.tsx). */}
      <View style={styles.badgeCorner}>
        <Badge color="warning">EM DESENVOLVIMENTO</Badge>
      </View>
      <Text style={styles.title}>{t("home.title")}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCorner: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
