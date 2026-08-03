import { FALLBACK_LOCALE, isSupportedLocale, type Locale } from "./types";

function mapLanguageTagToLocale(tag: string): Locale | null {
  const lower = tag.toLowerCase();
  if (lower.startsWith("pt")) return "pt-BR";
  if (lower.startsWith("en")) return "en-US";
  return null;
}

export type ResolveDefaultLocaleParams = {
  /**
   * Device-reported language tags, most preferred first (e.g. from
   * `expo-localization`'s `getLocales().map(l => l.languageTag)`). The
   * package takes plain strings so it stays free of any Expo/RN dependency
   * and is trivial to unit test.
   */
  deviceLanguageTags: readonly string[];
  /**
   * A locale to force ahead of device detection, for local testing without
   * changing the OS language. The host app is responsible for only ever
   * passing this in development (e.g. gating on `__DEV__` before reading
   * `EXPO_PUBLIC_DEFAULT_LOCALE`) — this function applies whatever it's
   * given, dev-only or not.
   */
  devLocaleOverride?: string | null;
};

/**
 * Priority: dev override > device locale (pt-* and en-* only) > en-US.
 * Manual, persisted user choice is handled entirely by the host app (see
 * `LocaleProvider`'s `initialLocale`/`onLocaleChange`) and takes priority
 * over all of this — this function only computes the default to fall back
 * to when no persisted user choice exists yet.
 */
export function resolveDefaultLocale({
  deviceLanguageTags,
  devLocaleOverride,
}: ResolveDefaultLocaleParams): Locale {
  if (isSupportedLocale(devLocaleOverride)) {
    return devLocaleOverride;
  }

  for (const tag of deviceLanguageTags) {
    const mapped = mapLanguageTagToLocale(tag);
    if (mapped) return mapped;
  }

  return FALLBACK_LOCALE;
}
