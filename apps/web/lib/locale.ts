import { FALLBACK_LOCALE, isSupportedLocale, resolveDefaultLocale } from "@city-hero/i18n";
import type { Locale } from "@city-hero/i18n";
import type { NextRequest, NextResponse } from "next/server";

// Plain (non-httpOnly) cookie — a language preference isn't sensitive, so a
// client component can write it directly with `document.cookie` and the
// server can still read it for SSR locale resolution (see app/lib/i18n.ts's
// `resolveServerLocale`). Sharing this constant is safe for a server module
// to import: referencing it doesn't touch `document`, only calling
// `persistLocale` below does, and the server never calls that.
export const LOCALE_COOKIE = "cityhero_language";
const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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

/** Client-side persistence, passed as `LocaleProvider`'s `onLocaleChange`.
 * `secure` is conditional on the page's own protocol (mirrors
 * `syncLocaleCookie`'s `NODE_ENV === "production"` check below: a site
 * served over HTTPS is exactly what "production" means here) — some
 * browsers silently drop a `Secure` cookie set from a `http:` page, and an
 * unconditional `; secure` would break local HTTP development. */
export function persistLocale(locale: Locale): void {
  setCurrentLocale(locale);
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; samesite=lax${secure ? "; secure" : ""}`;
}

/**
 * Server-side counterpart of `persistLocale` — writes (or clears) the
 * `cityhero_language` cookie on a Route Handler's response from a user's
 * stored `language` value. Shared by every Route Handler that returns a
 * user object carrying a fresh `language` (login, `/users/me`) so the two
 * write paths can't drift apart the way client/server settings once did
 * here. Explicitly clears any existing cookie when `language` is missing or
 * unsupported, rather than leaving a stale value in place — otherwise the
 * only way to ever correct a bad cookie would be a future call that
 * happens to carry a valid language.
 */
export function syncLocaleCookie(
  response: NextResponse,
  language: string | null | undefined,
): void {
  if (isSupportedLocale(language)) {
    response.cookies.set(LOCALE_COOKIE, language, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
  } else {
    response.cookies.delete(LOCALE_COOKIE);
  }
}

/** Splits an `Accept-Language` header into tags ordered by descending `q`
 * weight (defaulting to `q=1` when absent) — a client is allowed to send
 * weights out of header order (e.g. `en;q=0.3,pt-BR;q=0.9`), so tag order
 * alone isn't a reliable preference signal. */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.split(";").map((segment) => segment.trim());
      const qParam = params.find((param) => param.startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return { tag, q: Number.isNaN(q) ? 1 : q };
    })
    .filter((entry): entry is { tag: string; q: number } => !!entry.tag)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag);
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
