import { describe, expect, it, vi } from "vitest";

import { buildHeaders } from "../src/interceptors/headers";
import type { ApiClientConfig } from "../src/types";

function makeConfig(overrides: Partial<ApiClientConfig> = {}): ApiClientConfig {
  return {
    baseUrl: "http://localhost:8000",
    getToken: vi.fn().mockResolvedValue(null),
    onAuthFailure: vi.fn(),
    ...overrides,
  };
}

describe("buildHeaders", () => {
  it("injects the Bearer token when one is available", async () => {
    const config = makeConfig({ getToken: vi.fn().mockResolvedValue("abc123") });
    const headers = await buildHeaders(config, {});
    expect(headers["Authorization"]).toBe("Bearer abc123");
  });

  it("omits Authorization when there is no token", async () => {
    const headers = await buildHeaders(makeConfig(), {});
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("omits Authorization when skipAuth is set, even with a token available", async () => {
    const config = makeConfig({ getToken: vi.fn().mockResolvedValue("abc123") });
    const headers = await buildHeaders(config, { skipAuth: true });
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("includes X-City-Id when getCityId resolves a value", async () => {
    const config = makeConfig({ getCityId: vi.fn().mockResolvedValue("city-42") });
    const headers = await buildHeaders(config, {});
    expect(headers["X-City-Id"]).toBe("city-42");
  });

  it("omits X-City-Id when getCityId is not provided", async () => {
    const headers = await buildHeaders(makeConfig(), {});
    expect(headers["X-City-Id"]).toBeUndefined();
  });

  it("includes app version and platform headers when configured", async () => {
    const config = makeConfig({ appVersion: "1.2.3", platform: "ios" });
    const headers = await buildHeaders(config, {});
    expect(headers["X-App-Version"]).toBe("1.2.3");
    expect(headers["X-Platform"]).toBe("ios");
  });

  it("sets Content-Type only when a body is present", async () => {
    const withBody = await buildHeaders(makeConfig(), { body: { foo: "bar" } });
    const withoutBody = await buildHeaders(makeConfig(), {});
    expect(withBody["Content-Type"]).toBe("application/json");
    expect(withoutBody["Content-Type"]).toBeUndefined();
  });
});
