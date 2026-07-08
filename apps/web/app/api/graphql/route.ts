import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// Proxy GraphQL requests to the FastAPI backend, injecting the auth token
// from the HttpOnly cookie so client components never touch the raw JWT.
export async function POST(request: NextRequest) {
  const store = await cookies();
  const token = store.get("access_token")?.value;

  const body = await request.text();

  const res = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
