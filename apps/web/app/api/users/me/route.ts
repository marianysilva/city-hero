import { LOCALE_DICTS, translate } from "@city-hero/i18n";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { resolveServerLocale } from "@/app/lib/i18n";
import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

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
    return NextResponse.json(me);
  } catch (error) {
    return apiErrorResponse(error, locale);
  }
}
