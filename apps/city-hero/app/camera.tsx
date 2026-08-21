import { useTranslation } from "@city-hero/i18n";
import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/src/components/PlaceholderScreen";

// Placeholder for SCREEN 08 · Camera with AI (docs/tasks/08-camera-live).
// Presented as a full-screen modal (see the root Stack), so it has no bottom
// nav — it provides its own close affordance instead.
export default function CameraModal() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  return <PlaceholderScreen title={t("nav.camera")} emoji="📸" onClose={handleClose} />;
}
