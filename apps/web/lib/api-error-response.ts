import { ApiClientError } from "@city-hero/api-client";
import { NextResponse } from "next/server";

// Shared by every BFF route whose frontend contract reads `body.detail` as
// the error string (apps/web/app/(dashboard)/users/_api.ts's apiFetch).
// apps/web/app/api/auth/login/route.ts is the one exception — its frontend
// reads `body.error` instead, so it builds its own response inline.
export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiClientError && error.status > 0) {
    const detail = error.code === "validation_error" ? error.details : error.message;
    return NextResponse.json({ detail }, { status: error.status });
  }
  return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
}
