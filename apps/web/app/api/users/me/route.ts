import { ApiClientError } from "@city-hero/api-client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";

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
    if (error instanceof ApiClientError && error.status > 0) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
