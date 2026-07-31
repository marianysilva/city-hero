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
  // `lib/validation-messages.ts`) read via `getCurrentLocale()`. Set
  // synchronously during render (not only in the effect below) so the ref is
  // already correct before ANY descendant's mount effect can run — React
  // fires effects bottom-up (children before parents), so relying solely on
  // this component's own `useEffect` could still lose that race to a deeper
  // component's effect (e.g. an immediate fetch whose error path reads
  // `getCurrentLocale()`). Guarded on `window` so this never runs during
  // SSR, where writing the shared module ref would reintroduce the
  // cross-request race the ref's own doc comment warns against.
  if (typeof window !== "undefined") {
    setCurrentLocale(initialLocale);
  }

  // Re-sync on prop changes after the initial mount (e.g. a fresh
  // server-rendered navigation resolving a different locale).
  useEffect(() => {
    setCurrentLocale(initialLocale);
  }, [initialLocale]);

  return (
    <LocaleProvider initialLocale={initialLocale} onLocaleChange={persistLocale}>
      {children}
    </LocaleProvider>
  );
}
