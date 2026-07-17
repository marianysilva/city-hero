// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../../__test-utils__/server";

import { POST } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => mockCookies.mockResolvedValue({ get: () => ({ value: "valid-token" }) }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/users/:id/restore", () => {
  it("restores the user and returns it", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users/u1/restore`, () =>
        HttpResponse.json({
          id: "u1",
          email: "citizen@example.com",
          name: "Citizen One",
          role: "citizen",
          authProvider: "password",
          isActive: true,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        }),
      ),
    );

    const response = await POST(
      new NextRequest("http://localhost/api/users/u1/restore", { method: "POST" }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.deletedAt).toBeNull();
  });

  it("returns 403 with detail when the caller lacks permission", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users/u1/restore`, () =>
        HttpResponse.json({ detail: "Not enough permissions" }, { status: 403 }),
      ),
    );

    const response = await POST(
      new NextRequest("http://localhost/api/users/u1/restore", { method: "POST" }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.detail).toBe("Not enough permissions");
  });
});
