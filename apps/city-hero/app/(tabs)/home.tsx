import { useTranslation } from "@city-hero/i18n";

import { PlaceholderScreen } from "@/src/components/PlaceholderScreen";

// Placeholder for SCREEN 06 · Home / Map (docs/tasks/06-home-map). Renders the
// bottom nav (from the (tabs) layout) over a not-implemented-yet body.
export default function HomeScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("nav.map")} emoji="🗺️" />;
}
