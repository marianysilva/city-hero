"use client";

import { useTranslation } from "@city-hero/i18n";
import {
  MapIcon,
  ViewColumnsIcon,
  MapPinIcon,
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Suspense } from "react";

import SidebarUserFooter from "./_components/SidebarUserFooter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const NAV = [
    { href: "/", label: t("dashboard.navWarRoom"), icon: MapIcon },
    { href: "/kanban", label: t("dashboard.navKanban"), icon: ViewColumnsIcon },
    { href: "/routing", label: t("dashboard.navRouting"), icon: MapPinIcon },
    { href: "/analytics", label: t("dashboard.navAnalytics"), icon: ChartBarIcon },
    { href: "/users", label: t("dashboard.navUsers"), icon: UsersIcon },
  ];

  return (
    <div className="flex h-screen bg-zinc-50">
      <aside className="w-60 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-100">
          <span className="text-lg font-semibold text-zinc-900">CityHero</span>
          <span className="block text-xs text-zinc-400 mt-0.5">{t("dashboard.panelTitle")}</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <SidebarUserFooter />
      </aside>

      <main className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-8 text-zinc-400">{t("common.loading")}</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
