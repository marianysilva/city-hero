import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "../src/client";
import type { ApiClientConfig } from "../src/types";

import { BASE_URL } from "./handlers";
import { server } from "./server";

function makeClient(overrides: Partial<ApiClientConfig> = {}) {
  return createApiClient({
    baseUrl: BASE_URL,
    getToken: vi.fn().mockResolvedValue("token-abc"),
    onAuthFailure: vi.fn(),
    ...overrides,
  });
}

describe("createApiClient — request flow", () => {
  it("sends an authenticated request and parses the JSON response", async () => {
    const me = await makeClient().users.me();
    expect(me.email).toBe("citizen@example.com");
  });

  it("returns undefined for a 204 No Content response", async () => {
    server.use(
      http.post(
        `${BASE_URL}/users/00000000-0000-0000-0000-000000000000/reset-password`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const result = await makeClient().users.resetPassword("00000000-0000-0000-0000-000000000000", {
      newPassword: "Sup3rSecret!",
    });
    expect(result).toBeUndefined();
  });
});

describe("createApiClient — 401 handling", () => {
  it("calls onAuthFailure and throws a normalized 401 instead of attempting a refresh", async () => {
    server.use(
      http.get(`${BASE_URL}/users/me`, () =>
        HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 }),
      ),
    );
    const onAuthFailure = vi.fn();

    await expect(makeClient({ onAuthFailure }).users.me()).rejects.toMatchObject({
      code: "unauthorized",
      status: 401,
    });
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it("dispatches its own logout independently for two parallel 401s when no refreshAccessToken is configured", async () => {
    server.use(
      http.get(`${BASE_URL}/users/me`, () =>
        HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 }),
      ),
    );
    const onAuthFailure = vi.fn();
    const client = makeClient({ onAuthFailure });

    const results = await Promise.allSettled([client.users.me(), client.users.me()]);

    expect(results.every((r) => r.status === "rejected")).toBe(true);
    expect(onAuthFailure).toHaveBeenCalledTimes(2);
  });
});

describe("createApiClient — single-flight refresh", () => {
  function makeClientWithRefresh() {
    let currentToken = "expired-token";
    const refreshAccessToken = vi.fn().mockImplementation(async () => {
      currentToken = "fresh-token";
      return { accessToken: currentToken };
    });
    const onAuthFailure = vi.fn();
    const client = createApiClient({
      baseUrl: BASE_URL,
      getToken: () => currentToken,
      onAuthFailure,
      refreshAccessToken,
    });
    return { client, refreshAccessToken, onAuthFailure };
  }

  function mockMeRespondingByToken() {
    server.use(
      http.get(`${BASE_URL}/users/me`, ({ request }) => {
        const auth = request.headers.get("Authorization");
        if (auth === "Bearer fresh-token") {
          return HttpResponse.json({
            id: "u1",
            email: "citizen@example.com",
            name: "Citizen One",
            role: "citizen",
            authProvider: "password",
            isActive: true,
            avatarUrl: null,
            createdAt: "2026-01-01T00:00:00Z",
            deletedAt: null,
            roleInfo: { name: "citizen", rank: 0, isSuperuser: false },
            capabilities: { permissions: [], assignableRoles: [], manageableRoles: [] },
          });
        }
        return HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
      }),
    );
  }

  it("refreshes once and retries the original request with the new token", async () => {
    mockMeRespondingByToken();
    const { client, refreshAccessToken, onAuthFailure } = makeClientWithRefresh();

    const me = await client.users.me();

    expect(me.email).toBe("citizen@example.com");
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it("shares one in-flight refresh across two parallel 401s, retrying both", async () => {
    mockMeRespondingByToken();
    const { client, refreshAccessToken, onAuthFailure } = makeClientWithRefresh();

    const [a, b] = await Promise.all([client.users.me(), client.users.me()]);

    expect(a.email).toBe("citizen@example.com");
    expect(b.email).toBe("citizen@example.com");
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it("falls back to forced logout when refreshAccessToken fails", async () => {
    server.use(
      http.get(`${BASE_URL}/users/me`, () =>
        HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 }),
      ),
    );
    const onAuthFailure = vi.fn();
    const refreshAccessToken = vi.fn().mockRejectedValue(new Error("refresh endpoint down"));
    const client = createApiClient({
      baseUrl: BASE_URL,
      getToken: () => "expired-token",
      onAuthFailure,
      refreshAccessToken,
    });

    await expect(client.users.me()).rejects.toMatchObject({ code: "unauthorized" });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it("does not attempt a second refresh if the retried request is also 401", async () => {
    server.use(
      http.get(`${BASE_URL}/users/me`, () =>
        HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 }),
      ),
    );
    const { client, refreshAccessToken, onAuthFailure } = makeClientWithRefresh();

    await expect(client.users.me()).rejects.toMatchObject({ code: "unauthorized" });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });
});

describe("createApiClient — network failure", () => {
  it("wraps a fetch-level failure (DNS/connection refused) as a network_error, not a raw exception", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const client = createApiClient({
      baseUrl: BASE_URL,
      getToken: vi.fn().mockResolvedValue(null),
      onAuthFailure: vi.fn(),
      fetchImpl,
    });

    // A non-idempotent method (POST) so retry.ts doesn't retry 3 times first.
    await expect(client.auth.login({ email: "a@b.com", password: "x" })).rejects.toMatchObject({
      code: "network_error",
      status: 0,
    });
  });
});

describe("createApiClient — offline detection", () => {
  it("throws an offline error immediately without attempting a request", async () => {
    const fetchImpl = vi.fn();
    const client = createApiClient({
      baseUrl: BASE_URL,
      getToken: vi.fn().mockResolvedValue(null),
      onAuthFailure: vi.fn(),
      isOnline: () => false,
      fetchImpl,
    });

    await expect(client.users.me()).rejects.toMatchObject({ code: "offline" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("createApiClient — cancellation", () => {
  it("aborts the in-flight request when the caller's signal fires", async () => {
    server.use(
      http.get(`${BASE_URL}/users`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ users: [], total: 0, page: 1, pageSize: 20 });
      }),
    );
    const controller = new AbortController();
    const client = makeClient();

    const promise = client.users.list({}, controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("createApiClient — query serialization", () => {
  it("appends one query entry per array value instead of overwriting", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const client = createApiClient({
      baseUrl: BASE_URL,
      getToken: vi.fn().mockResolvedValue(null),
      onAuthFailure: vi.fn(),
      fetchImpl,
    });

    await client.request("/users", { query: { sort: ["name:asc", "email:desc"], page: 1 } });

    const calledUrl = new URL(fetchImpl.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.getAll("sort")).toEqual(["name:asc", "email:desc"]);
    expect(calledUrl.searchParams.get("page")).toBe("1");
  });
});
