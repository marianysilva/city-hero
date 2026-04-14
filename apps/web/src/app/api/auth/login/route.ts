import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function POST(request: Request) {
  let email: unknown;
  let password: unknown;

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ detail: "Invalid input" }, { status: 400 });
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      return NextResponse.json(
        { detail: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { detail: "Invalid credentials" },
      { status: 401 },
    );
  }

  const data = await res.json();

  const cookieStore = await cookies();
  cookieStore.set("token", data.accessToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE !== "false",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return NextResponse.json({ user: data.user });
}
