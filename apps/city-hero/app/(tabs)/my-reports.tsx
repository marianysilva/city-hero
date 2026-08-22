import { useTranslation } from "@city-hero/i18n";

import { PlaceholderScreen } from "@/src/components/PlaceholderScreen";

// Placeholder for SCREEN 16 · My Reports (reached from the "More" sheet).
export default function MyReportsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("nav.myReports")} emoji="📋" />;
}
