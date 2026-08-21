import { useTranslation } from "@city-hero/i18n";

import { PlaceholderScreen } from "@/src/components/PlaceholderScreen";

// Placeholder for SCREEN 07 · Civic Feed (docs/tasks/07-civic-feed).
export default function FeedScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("nav.feed")} emoji="📰" />;
}
