"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { formatDateTime, formatRelativeTime } from "./formatDate";
import { formatNumber } from "./formatNumber";
import { LOCALE_DICTS } from "./locales";
import type { InterpolationValues } from "./translate";
import { translate } from "./translate";
import type { Locale, MissingKeyInfo, TranslationKey } from "./types";
import { FALLBACK_LOCALE } from "./types";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: InterpolationValues) => string;
  formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date, now?: Date) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export type LocaleProviderProps = {
  children: React.ReactNode;
  /**
   * Defaults to `FALLBACK_LOCALE` ("en-US"). The host app computes the real
   * starting value — persisted user choice, else `resolveDefaultLocale()` —
   * and passes it in. Only read once, as the initial state, same as
   * `ThemeProvider`'s `initialPreference`: changing this prop on a later
   * render does *not* update an already-mounted provider. Call `setLocale`
   * from `useLocaleContext()` to change it after mount.
   */
  initialLocale?: Locale;
  /**
   * Called whenever the user picks a language. The host app owns
   * persistence (`expo-sqlite/kv-store` on native, `localStorage` on web)
   * — this package stays storage-agnostic so it works on both, same
   * reasoning as `ThemeProvider`'s `onPreferenceChange`.
   */
  onLocaleChange?: (locale: Locale) => void;
  /**
   * Called whenever `t()` resolves a key through the fallback chain (or not
   * at all). The host app owns analytics — this package only logs a dev
   * console warning on its own (see `translate.ts`).
   */
  onMissingKey?: (info: MissingKeyInfo) => void;
};

export function LocaleProvider({
  children,
  initialLocale = FALLBACK_LOCALE,
  onLocaleChange,
  onMissingKey,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      onLocaleChange?.(next);
    },
    [onLocaleChange],
  );

  const t = useCallback(
    (key: TranslationKey, values?: InterpolationValues) =>
      translate(LOCALE_DICTS, locale, key, values, onMissingKey),
    [locale, onMissingKey],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      formatDateTime: (date, options) => formatDateTime(date, locale, options),
      formatRelativeTime: (date, now) => formatRelativeTime(date, locale, now),
      formatNumber: (num, options) => formatNumber(num, locale, options),
    }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslation()/useLocale() must be called within a <LocaleProvider>.");
  }
  return ctx;
}

/** `const { t, locale } = useTranslation();` — the hook screens call to render translated strings. */
export function useTranslation() {
  const { t, locale } = useLocaleContext();
  return { t, locale };
}

/** `const { locale, setLocale } = useLocale();` — for a language picker (e.g. Settings). */
export function useLocale() {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
}
