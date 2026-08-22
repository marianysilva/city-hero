import { useTranslation } from "@city-hero/i18n";

import { PlaceholderScreen } from "@/src/components/PlaceholderScreen";

// Placeholder for SCREEN 28 · Citizen Profile (docs/tasks/28-citizen-profile).
export default function ProfileScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("nav.profile")} emoji="🙂" />;
}
