import { ApiClientError } from "@city-hero/api-client";
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { safeErrorMessage } from "@/lib/api-error-response";
import { translateValidationErrors } from "@/lib/validation-messages";

// login/page.tsx renders `data.error` directly as text — a 422's
// `error.details` is an array of Pydantic validation-error objects, not a
// string, and reached the client verbatim once (email format validation
// failure), crashing the page with "Objects are not valid as a React
// child". Always resolve to a string before it leaves this route, and
// translate known validation codes to pt-BR the same way the dashboard's
// apiFetch does (see apps/web/lib/validation-messages.ts). safeErrorMessage
// additionally guards against errorNormalize.ts's internal placeholder
// message (e.g. `unknown_error_500`) reaching the login screen verbatim.
function errorMessage(error: ApiClientError): string {
  if (error.code === "validation_error") {
    const translated = translateValidationErrors(error.details);
    if (translated) return translated;
  }
  return safeErrorMessage(error);
}

export async function POST(request: NextRequest) {
  let email: unknown, password: unknown;
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await createServerApiClient().auth.login({
      email: email as string,
      password: password as string,
    });

    if (typeof result.accessToken !== "string") {
      return NextResponse.json({ error: "Invalid auth response from backend" }, { status: 502 });
    }

    const response = NextResponse.json({ user: result.user });
    response.cookies.set("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60,
      path: "/",
    });
    return response;
  } catch (error) {
    if (error instanceof ApiClientError && error.status > 0) {
      return NextResponse.json({ error: errorMessage(error) }, { status: error.status });
    }
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
