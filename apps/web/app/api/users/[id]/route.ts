import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await createServerApiClient().users.get(id);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let name: unknown, isActive: unknown, role: unknown;
  try {
    const body = await request.json();
    ({ name, isActive, role } = body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await createServerApiClient().users.update(id, {
      name: name as string | undefined,
      isActive: isActive as boolean | undefined,
      role: role as string | undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await createServerApiClient().users.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
