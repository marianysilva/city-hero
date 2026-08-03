import { getServerT } from "@/app/lib/i18n";

export default async function AnalyticsPage() {
  const { t } = await getServerT();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("dashboard.analyticsTitle")}</h1>
      <p className="text-zinc-500 mt-1">{t("dashboard.analyticsDescription")}</p>
      <div className="mt-8 rounded-2xl bg-white border border-zinc-200 h-[600px] flex items-center justify-center text-zinc-400 text-sm">
        {t("dashboard.supersetComingSoon")}
      </div>
    </div>
  );
}
