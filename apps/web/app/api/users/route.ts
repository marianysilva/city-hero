import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL, getAuthHeaders, backendFetch } from "@/lib/api-proxy";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const allowed = ["page", "page_size", "q", "status", "sort"];
  const safe = new URLSearchParams();
  for (const key of allowed) {
    for (const v of searchParams.getAll(key)) safe.append(key, v);
  }
  const url = `${BACKEND_URL}/users${safe.toString() ? `?${safe.toString()}` : ""}`;

  const res = await backendFetch(url, {
    headers: { ...(await getAuthHeaders()) },
    cache: "no-store",
  });
  if (!res) return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  let email: unknown, name: unknown, password: unknown, role: unknown;
  try {
    const body = await request.json();
    ({ email, name, password, role } = body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const res = await backendFetch(`${BACKEND_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify({ email, name, password, role }),
  });
  if (!res) return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
