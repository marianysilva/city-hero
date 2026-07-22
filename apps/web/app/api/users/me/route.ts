import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function GET() {
  const store = await cookies();
  const token = store.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const me = await createServerApiClient().users.me();
    return NextResponse.json(me);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
