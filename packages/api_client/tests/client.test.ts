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

  it("dispatches its own logout independently for two parallel 401s (no single-flight refresh yet)", async () => {
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
