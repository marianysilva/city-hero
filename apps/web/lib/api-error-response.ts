import { ApiClientError } from "@city-hero/api-client";
import { LOCALE_DICTS, translate } from "@city-hero/i18n";
import type { Locale } from "@city-hero/i18n";
import { NextResponse } from "next/server";

// errors.ts's own contract: `message` is a debugging string, not something
// meant for direct display. For most codes the backend's real HTTPException
// `detail` happens to also be display-safe (e.g. "User not found"), but
// `server_error`/`unknown_error` are errorNormalize.ts's catch-all for a
// response it couldn't parse (e.g. an unhandled 500 with no JSON body) — its
// `message` is an internal placeholder like `unknown_error_500`, never meant
// to reach a screen.
export function safeErrorMessage(error: ApiClientError, locale: Locale): string {
  return error.code === "server_error" || error.code === "unknown_error"
    ? translate(LOCALE_DICTS, locale, "errors.generic")
    : error.message;
}

// Shared by every BFF route whose frontend contract reads `body.detail` as
// the error string (apps/web/app/(dashboard)/users/_api.ts's apiFetch).
// apps/web/app/api/auth/login/route.ts is the one exception — its frontend
// reads `body.error` instead, so it builds its own response inline (reusing
// safeErrorMessage for the same leak-prevention).
//
// `locale` is required, not defaulted to `getCurrentLocale()`: every caller
// is a Route Handler, which (unlike a client component) can't read that
// shared, client-only ref — see `lib/locale.ts`'s `resolveLocaleFromRequest`.
export function apiErrorResponse(error: unknown, locale: Locale): NextResponse {
  if (error instanceof ApiClientError && error.status > 0) {
    const detail =
      error.code === "validation_error" ? error.details : safeErrorMessage(error, locale);
    return NextResponse.json({ detail }, { status: error.status });
  }
  return NextResponse.json(
    { error: translate(LOCALE_DICTS, locale, "errors.backendUnavailable") },
    { status: 503 },
  );
}
