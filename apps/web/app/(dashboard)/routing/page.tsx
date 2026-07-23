"use client";

import { useTranslation } from "@city-hero/i18n";

export default function RoutingPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("dashboard.routingTitle")}</h1>
      <p className="text-zinc-500 mt-1">{t("dashboard.routingDescription")}</p>
      <div className="mt-8 rounded-2xl bg-white border border-zinc-200 h-[600px] flex items-center justify-center text-zinc-400 text-sm">
        {t("dashboard.smartRoutingComingSoon")}
      </div>
    </div>
  );
}
