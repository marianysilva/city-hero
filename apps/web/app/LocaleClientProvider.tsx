"use client";

import { LocaleProvider } from "@city-hero/i18n";
import type { Locale } from "@city-hero/i18n";
import { useEffect } from "react";

import { persistLocale, setCurrentLocale } from "@/lib/locale";

export function LocaleClientProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  // Syncs the module-level ref that non-component modules (`_api.ts`,
  // `lib/validation-messages.ts`) read via `getCurrentLocale()`.
  useEffect(() => {
    setCurrentLocale(initialLocale);
  }, [initialLocale]);

  return (
    <LocaleProvider initialLocale={initialLocale} onLocaleChange={persistLocale}>
      {children}
    </LocaleProvider>
  );
}
