// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../__test-utils__/server";

import { GET, POST } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  mockCookies.mockResolvedValue({ get: () => ({ value: "valid-token" }) });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

function listRequest(query: string) {
  return new NextRequest(`http://localhost/api/users${query}`);
}

describe("GET /api/users", () => {
  it("forwards page/page_size/q/status and repeats sort for each value", async () => {
    server.use(
      http.get(`${BACKEND_URL}/users`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("2");
        expect(url.searchParams.get("page_size")).toBe("10");
        expect(url.searchParams.get("q")).toBe("ana");
        expect(url.searchParams.get("status")).toBe("inactive");
        expect(url.searchParams.getAll("sort")).toEqual(["name:asc", "email:desc"]);
        return HttpResponse.json({ users: [], total: 0, page: 2, pageSize: 10 });
      }),
    );

    const response = await GET(
      listRequest("?page=2&page_size=10&q=ana&status=inactive&sort=name:asc&sort=email:desc"),
    );

    expect(response.status).toBe(200);
  });

  it("returns 401 with the backend's detail when the token is rejected", async () => {
    server.use(
      http.get(`${BACKEND_URL}/users`, () =>
        HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 }),
      ),
    );

    const response = await GET(listRequest(""));

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.detail).toBe("Could not validate credentials");
  });
});

describe("POST /api/users", () => {
  function createRequest(body: unknown) {
    return new NextRequest("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("creates a user and returns 201", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users`, async ({ request }) => {
        const body = (await request.json()) as { email: string };
        return HttpResponse.json(
          {
            id: "new-id",
            email: body.email,
            name: "Someone",
            role: "field_team",
            authProvider: "password",
            isActive: true,
            avatarUrl: null,
            createdAt: "2026-01-01T00:00:00Z",
            deletedAt: null,
          },
          { status: 201 },
        );
      }),
    );

    const response = await POST(
      createRequest({
        email: "new@example.com",
        name: "Someone",
        password: "Sup3rSecret!",
        role: "field_team",
      }),
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.email).toBe("new@example.com");
  });

  it("returns the validation array as detail on a 422", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users`, () =>
        HttpResponse.json(
          { detail: [{ loc: ["body", "email"], msg: "field required", type: "missing" }] },
          { status: 422 },
        ),
      ),
    );

    const response = await POST(createRequest({ name: "Someone" }));

    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.detail).toEqual([
      { loc: ["body", "email"], msg: "field required", type: "missing" },
    ]);
  });

  it("returns 400 on invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
