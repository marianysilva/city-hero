import { useTranslation } from "@city-hero/i18n";

import { PlaceholderScreen } from "@/src/components/PlaceholderScreen";

// Placeholder for SCREEN 19 · Notifications (reached from the "More" sheet).
export default function NotificationsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("nav.notifications")} emoji="🔔" />;
}
