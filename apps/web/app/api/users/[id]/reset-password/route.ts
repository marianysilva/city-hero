import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL, getAuthHeaders, backendFetch } from "@/lib/api-proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let new_password: unknown;
  try {
    const body = await request.json();
    ({ new_password } = body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const res = await backendFetch(`${BACKEND_URL}/users/${id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify({ new_password }),
  });
  if (!res) return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });

  if (res.status === 204) return new NextResponse(null, { status: 204 });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
