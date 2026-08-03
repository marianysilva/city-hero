import { ApiClientError } from "@city-hero/api-client";
import { isSupportedLocale, LOCALE_DICTS, translate } from "@city-hero/i18n";
import type { Locale, TranslationKey } from "@city-hero/i18n";
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { safeErrorMessage } from "@/lib/api-error-response";
import { LOCALE_COOKIE, resolveLocaleFromRequest } from "@/lib/locale";
import { translateValidationErrors } from "@/lib/validation-messages";

// login/page.tsx renders `data.error` directly as text — a 422's
// `error.details` is an array of Pydantic validation-error objects, not a
// string, and reached the client verbatim once (email format validation
// failure), crashing the page with "Objects are not valid as a React
// child". Always resolve to a string before it leaves this route, and
// translate known validation codes into the request's own locale the same
// way the dashboard's apiFetch does (see apps/web/lib/validation-messages.ts).
// safeErrorMessage additionally guards against errorNormalize.ts's internal
// placeholder message (e.g. `unknown_error_500`) reaching the login screen
// verbatim.
function errorMessage(error: ApiClientError, locale: Locale): string {
  if (error.code === "validation_error") {
    const translated = translateValidationErrors(error.details, locale);
    if (translated) return translated;
  }
  return safeErrorMessage(error, locale);
}

export async function POST(request: NextRequest) {
  // A Route Handler serves every user's request in the same Node process,
  // so (unlike a client component) it can't read the shared
  // `getCurrentLocale()` ref — it resolves this request's own locale
  // from its own cookie/header instead.
  const locale = resolveLocaleFromRequest(request);
  const t = (key: TranslationKey) => translate(LOCALE_DICTS, locale, key);

  let email: unknown, password: unknown;
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: t("errors.invalidRequestBody") }, { status: 400 });
  }

  try {
    const result = await createServerApiClient().auth.login({
      email: email as string,
      password: password as string,
    });

    if (typeof result.accessToken !== "string") {
      return NextResponse.json({ error: t("errors.invalidAuthResponse") }, { status: 502 });
    }

    const response = NextResponse.json({ user: result.user });
    response.cookies.set("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60,
      path: "/",
    });
    // Sync the logged-in user's stored language preference into the locale
    // cookie so the very next server render (the login page's own
    // `router.refresh()`) resolves via `resolveServerLocale()` to *this*
    // user's language instead of whatever the previous session/browser
    // Accept-Language left behind. Same cookie settings as the client-side
    // `persistLocale` in lib/locale.ts, minus httpOnly since that one also
    // needs to read/write it from the client on manual locale switches.
    if (isSupportedLocale(result.user.language)) {
      response.cookies.set(LOCALE_COOKIE, result.user.language, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    if (error instanceof ApiClientError && error.status > 0) {
      return NextResponse.json({ error: errorMessage(error, locale) }, { status: error.status });
    }
    return NextResponse.json({ error: t("errors.backendUnavailable") }, { status: 503 });
  }
}
