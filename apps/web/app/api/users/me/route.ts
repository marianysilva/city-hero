import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BACKEND_URL, backendFetch } from "@/lib/api-proxy";

export async function GET() {
  const store = await cookies();
  const token = store.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const res = await backendFetch(`${BACKEND_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res) return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
