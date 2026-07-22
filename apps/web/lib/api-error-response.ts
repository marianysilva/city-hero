import { ApiClientError } from "@city-hero/api-client";
import { NextResponse } from "next/server";

const GENERIC_SERVER_ERROR_MESSAGE = "Erro interno do servidor. Tente novamente em instantes.";

// errors.ts's own contract: `message` is a debugging string, not something
// meant for direct display. For most codes the backend's real HTTPException
// `detail` happens to also be display-safe (e.g. "User not found"), but
// `server_error`/`unknown_error` are errorNormalize.ts's catch-all for a
// response it couldn't parse (e.g. an unhandled 500 with no JSON body) — its
// `message` is an internal placeholder like `unknown_error_500`, never meant
// to reach a screen.
export function safeErrorMessage(error: ApiClientError): string {
  return error.code === "server_error" || error.code === "unknown_error"
    ? GENERIC_SERVER_ERROR_MESSAGE
    : error.message;
}

// Shared by every BFF route whose frontend contract reads `body.detail` as
// the error string (apps/web/app/(dashboard)/users/_api.ts's apiFetch).
// apps/web/app/api/auth/login/route.ts is the one exception — its frontend
// reads `body.error` instead, so it builds its own response inline (reusing
// safeErrorMessage for the same leak-prevention).
export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiClientError && error.status > 0) {
    const detail = error.code === "validation_error" ? error.details : safeErrorMessage(error);
    return NextResponse.json({ detail }, { status: error.status });
  }
  return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
}
