import { LOCALE_DICTS, translate } from "@city-hero/i18n";
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";
import { resolveLocaleFromRequest } from "@/lib/locale";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await createServerApiClient().users.get(id);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, resolveLocaleFromRequest(request));
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = resolveLocaleFromRequest(request);
  let name: unknown, isActive: unknown, role: unknown, language: unknown;
  try {
    const body = await request.json();
    ({ name, isActive, role, language } = body);
  } catch {
    return NextResponse.json(
      { error: translate(LOCALE_DICTS, locale, "errors.invalidRequestBody") },
      { status: 400 },
    );
  }

  try {
    const result = await createServerApiClient().users.update(id, {
      name: name as string | undefined,
      isActive: isActive as boolean | undefined,
      role: role as string | undefined,
      language: language as string | undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, locale);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await createServerApiClient().users.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error, resolveLocaleFromRequest(request));
  }
}
