import { isSupportedLocale, resolveDefaultLocale } from "@city-hero/i18n";
import type { Locale } from "@city-hero/i18n";
import { getLocales } from "expo-localization";
import Storage from "expo-sqlite/kv-store";

const STORAGE_KEY = "cityhero.language";

// Only ever read in development builds — lets a developer preview pt-BR (or
// force en-US) without changing the OS language. See
// docs/tasks/00-foundation/13-i18n.md Status for why this is dev-only.
const DEV_LOCALE_OVERRIDE: string | null = __DEV__
  ? (process.env.EXPO_PUBLIC_DEFAULT_LOCALE ?? null)
  : null;

/** System-locale-derived default, used when no persisted user choice exists yet. */
export function getDeviceDefaultLocale(): Locale {
  return resolveDefaultLocale({
    deviceLanguageTags: getLocales().map((locale) => locale.languageTag),
    devLocaleOverride: DEV_LOCALE_OVERRIDE,
  });
}

/** The user's previously chosen language, if any — takes priority over device detection. */
export async function loadPersistedLocale(): Promise<Locale | null> {
  const stored = await Storage.getItem(STORAGE_KEY);
  return isSupportedLocale(stored) ? stored : null;
}

/** Called from `LocaleProvider`'s `onLocaleChange` to persist a manual language change. */
export async function persistLocale(locale: Locale): Promise<void> {
  await Storage.setItem(STORAGE_KEY, locale);
}
