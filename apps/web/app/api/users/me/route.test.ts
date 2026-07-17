// @vitest-environment node
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { server } from "../../__test-utils__/server";

import { GET } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockToken(token: string | undefined) {
  mockCookies.mockResolvedValue({
    get: (name: string) => (name === "access_token" && token ? { value: token } : undefined),
  });
}

describe("GET /api/users/me", () => {
  it("returns 401 without calling the backend when there is no access_token cookie", async () => {
    mockToken(undefined);

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.detail).toBe("Unauthorized");
  });

  it("returns the current user on success", async () => {
    mockToken("valid-token");
    server.use(
      http.get(`${BACKEND_URL}/users/me`, () =>
        HttpResponse.json({
          id: "u1",
          email: "admin@cityhero.app",
          name: "Admin",
          role: "admin",
          authProvider: "password",
          isActive: true,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
          roleInfo: { name: "admin", rank: 10, isSuperuser: true },
          capabilities: { permissions: [], assignableRoles: [], manageableRoles: [] },
        }),
      ),
    );

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.email).toBe("admin@cityhero.app");
  });

  it("returns 401 with the normalized detail when the backend rejects the token", async () => {
    mockToken("expired-token");
    server.use(
      http.get(`${BACKEND_URL}/users/me`, () =>
        HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 }),
      ),
    );

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.detail).toBe("Could not validate credentials");
  });

  it("returns 503 when the backend is unreachable", async () => {
    mockToken("valid-token");
    server.use(http.get(`${BACKEND_URL}/users/me`, () => HttpResponse.error()));

    const response = await GET();

    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toBe("Backend unavailable");
  });
});
