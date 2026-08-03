import { LOCALE_DICTS, translate } from "@city-hero/i18n";
import type { Locale, TranslationKey } from "@city-hero/i18n";
import { cookies, headers } from "next/headers";

import { LOCALE_COOKIE, resolveLocaleFrom } from "@/lib/locale";

/** Persisted cookie > browser's Accept-Language > en-US. Used for both
 * `generateMetadata` and the root layout's `<html lang>`/`LocaleClientProvider`
 * initial value, so the very first server-rendered response already matches. */
export async function resolveServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  return resolveLocaleFrom({
    cookieValue: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguageHeader: headerStore.get("accept-language"),
  });
}

/**
 * `resolveServerLocale()` plus a bound `t` — the shape every server
 * component/Route Handler that needs more than one translated string ends up
 * hand-rolling (`const locale = await resolveServerLocale(); const t = (key)
 * => translate(LOCALE_DICTS, locale, key);`). Use this instead so that shape
 * lives in one place.
 */
export async function getServerT(): Promise<{
  locale: Locale;
  t: (key: TranslationKey) => string;
}> {
  const locale = await resolveServerLocale();
  return { locale, t: (key: TranslationKey) => translate(LOCALE_DICTS, locale, key) };
}
