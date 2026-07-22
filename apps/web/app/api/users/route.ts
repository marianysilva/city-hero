import type { ListUsersParams } from "@city-hero/api-client";
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page");
  const pageSize = searchParams.get("page_size");
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const sort = searchParams.getAll("sort");

  try {
    const result = await createServerApiClient().users.list({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      q: q ?? undefined,
      status: (status ?? undefined) as ListUsersParams["status"],
      sort: sort.length > 0 ? sort : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  let email: unknown, name: unknown, password: unknown, role: unknown;
  try {
    const body = await request.json();
    ({ email, name, password, role } = body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await createServerApiClient().users.create({
      email: email as string,
      name: name as string,
      password: password as string,
      role: role as string | undefined,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
