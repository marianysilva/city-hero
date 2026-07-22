// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../__test-utils__/server";

import { DELETE, GET, PATCH } from "./route";

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

describe("GET /api/users/:id", () => {
  it("returns the user", async () => {
    server.use(
      http.get(`${BACKEND_URL}/users/u1`, () =>
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

    const response = await GET(new NextRequest("http://localhost/api/users/u1"), paramsFor("u1"));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe("u1");
  });

  it("returns 404 with detail when the user doesn't exist", async () => {
    server.use(
      http.get(`${BACKEND_URL}/users/missing`, () =>
        HttpResponse.json({ detail: "User not found" }, { status: 404 }),
      ),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/users/missing"),
      paramsFor("missing"),
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.detail).toBe("User not found");
  });
});

describe("PATCH /api/users/:id", () => {
  function patchRequest(body: unknown) {
    return new NextRequest("http://localhost/api/users/u1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("sends isActive to the backend as camelCase and returns the updated user", async () => {
    server.use(
      http.patch(`${BACKEND_URL}/users/u1`, async ({ request }) => {
        const body = (await request.json()) as { isActive?: boolean };
        expect(body).toEqual({ name: "New Name", isActive: false });
        return HttpResponse.json({
          id: "u1",
          email: "citizen@example.com",
          name: "New Name",
          role: "citizen",
          authProvider: "password",
          isActive: false,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        });
      }),
    );

    const response = await PATCH(
      patchRequest({ name: "New Name", isActive: false }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isActive).toBe(false);
  });

  it("returns 400 on invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/users/u1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await PATCH(request, paramsFor("u1"));

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/users/:id", () => {
  it("returns 204 on success", async () => {
    server.use(
      http.delete(`${BACKEND_URL}/users/u1`, () => new HttpResponse(null, { status: 204 })),
    );

    const response = await DELETE(
      new NextRequest("http://localhost/api/users/u1", { method: "DELETE" }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(204);
  });

  it("returns 403 with detail when the caller lacks permission", async () => {
    server.use(
      http.delete(`${BACKEND_URL}/users/u1`, () =>
        HttpResponse.json({ detail: "Not enough permissions" }, { status: 403 }),
      ),
    );

    const response = await DELETE(
      new NextRequest("http://localhost/api/users/u1", { method: "DELETE" }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.detail).toBe("Not enough permissions");
  });
});
