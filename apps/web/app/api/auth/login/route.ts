import { ApiClientError } from "@city-hero/api-client";
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";

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
      const message = error.code === "validation_error" ? error.details : error.message;
      return NextResponse.json({ error: message }, { status: error.status });
    }
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
