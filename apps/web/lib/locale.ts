import { FALLBACK_LOCALE, isSupportedLocale, resolveDefaultLocale } from "@city-hero/i18n";
import type { Locale } from "@city-hero/i18n";
import type { NextRequest } from "next/server";

// Plain (non-httpOnly) cookie — a language preference isn't sensitive, so a
// client component can write it directly with `document.cookie` and the
// server can still read it for SSR locale resolution (see app/lib/i18n.ts's
// `resolveServerLocale`). Sharing this constant is safe for a server module
// to import: referencing it doesn't touch `document`, only calling
// `persistLocale` below does, and the server never calls that.
export const LOCALE_COOKIE = "cityhero_language";

let current: Locale = FALLBACK_LOCALE;

/** Synced from `LocaleClientProvider` on mount/change — lets non-component,
 * CLIENT-ONLY modules (`_api.ts`, `lib/validation-messages.ts`'s default
 * param) read the active locale without threading it through every function
 * call. Do NOT use this on the server: it's one mutable variable shared by
 * every concurrent request in the same Node process, so one user's locale
 * could leak into another's response. Server code (Route Handlers, Server
 * Components) must resolve its own per-request locale — see
 * `resolveLocaleFrom` below and `app/lib/i18n.ts`. */
export function setCurrentLocale(locale: Locale): void {
  current = locale;
}

export function getCurrentLocale(): Locale {
  return current;
}

/** Client-side persistence, passed as `LocaleProvider`'s `onLocaleChange`. */
export function persistLocale(locale: Locale): void {
  setCurrentLocale(locale);
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter((tag): tag is string => !!tag);
}

/**
 * Pure, per-request locale resolution: persisted cookie > Accept-Language
 * header > en-US. Shared by every server context that has its own
 * request-scoped cookie/header values — `app/lib/i18n.ts` (Server
 * Components, via `next/headers`) and `app/api/auth/login/route.ts` (a
 * Route Handler, via `NextRequest.cookies`/`.headers`) both call this
 * instead of duplicating the precedence logic.
 */
export function resolveLocaleFrom(params: {
  cookieValue: string | undefined;
  acceptLanguageHeader: string | null;
}): Locale {
  if (isSupportedLocale(params.cookieValue)) return params.cookieValue;
  return resolveDefaultLocale({
    deviceLanguageTags: parseAcceptLanguage(params.acceptLanguageHeader ?? ""),
  });
}

/** Convenience wrapper of `resolveLocaleFrom` for Route Handlers, which get
 * cookies/headers straight off the `NextRequest` instead of `next/headers`. */
export function resolveLocaleFromRequest(request: NextRequest): Locale {
  return resolveLocaleFrom({
    cookieValue: request.cookies.get(LOCALE_COOKIE)?.value,
    acceptLanguageHeader: request.headers.get("accept-language"),
  });
}
