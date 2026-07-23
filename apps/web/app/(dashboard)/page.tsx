"use client";

import { Badge } from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";

export default function WarRoomPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8 relative">
      {/* Design-system usage example: shared Badge atom, same component the
          mobile app renders (apps/city-hero/app/(tabs)/index.tsx). */}
      <div className="absolute top-8 right-8">
        <Badge color="warning">{t("common.inDevelopment")}</Badge>
      </div>
      <h1 className="text-2xl font-semibold text-zinc-900">{t("dashboard.warRoomTitle")}</h1>
      <p className="text-zinc-500 mt-1">{t("dashboard.warRoomDescription")}</p>
      <div className="mt-8 rounded-2xl bg-white border border-zinc-200 h-[600px] flex items-center justify-center text-zinc-400 text-sm">
        {t("dashboard.mapComingSoon")}
      </div>
    </div>
  );
}
