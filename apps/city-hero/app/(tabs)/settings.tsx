import { useTranslation } from "@city-hero/i18n";

import { PlaceholderScreen } from "@/src/components/PlaceholderScreen";

// Placeholder for Settings (reached from the "More" sheet).
export default function SettingsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("nav.settings")} emoji="⚙️" />;
}
