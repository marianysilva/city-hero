import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL } from "@/lib/api-proxy";

export async function POST(request: NextRequest) {
  let email: unknown, password: unknown;
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "";

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": clientIp,
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }

  const data = (await res.json()) as { accessToken?: string; user?: unknown };

  if (!res.ok) {
    return NextResponse.json(
      { error: (data as { detail?: string }).detail ?? "Login failed" },
      { status: res.status },
    );
  }

  if (typeof data.accessToken !== "string") {
    return NextResponse.json({ error: "Invalid auth response from backend" }, { status: 502 });
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  return response;
}
