import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await createServerApiClient().users.restore(id);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
