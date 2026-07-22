import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let newPassword: unknown;
  try {
    const body = await request.json();
    ({ newPassword } = body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await createServerApiClient().users.resetPassword(id, { newPassword: newPassword as string });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
