import type { Locale } from "@city-hero/i18n";
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
