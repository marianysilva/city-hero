import { LOCALE_DICTS, translate } from "@city-hero/i18n";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { resolveServerLocale } from "@/app/lib/i18n";
import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";
import { syncLocaleCookie } from "@/lib/locale";

export async function GET() {
  const store = await cookies();
  const token = store.get("access_token")?.value;
  const locale = await resolveServerLocale();

  if (!token) {
    return NextResponse.json(
      { detail: translate(LOCALE_DICTS, locale, "errors.unauthorized") },
      { status: 401 },
    );
  }

  try {
    const me = await createServerApiClient().users.me();
    const response = NextResponse.json(me);
    // Same sync as the login route: keeps the session's rendered locale
    // pinned to the user's stored `language` even when it was changed via a
    // self-edit (UserFormModal) rather than a fresh login — this is the only
    // request every authenticated page already makes on load/refetch, so it
    // doesn't need its own poll.
    syncLocaleCookie(response, me.language);
    return response;
  } catch (error) {
    return apiErrorResponse(error, locale);
  }
}
