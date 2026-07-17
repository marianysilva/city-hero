import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "../../src/client";
import { BASE_URL } from "../handlers";

function makeClient() {
  return createApiClient({
    baseUrl: BASE_URL,
    getToken: vi.fn().mockResolvedValue(null),
    onAuthFailure: vi.fn(),
  });
}

describe("auth endpoints", () => {
  it("logs in and returns the access token + user", async () => {
    const res = await makeClient().auth.login({
      email: "citizen@example.com",
      password: "correct-password",
    });
    expect(res.accessToken).toBe("test-access-token");
    expect(res.user.email).toBe("citizen@example.com");
  });

  it("surfaces wrong credentials as a normal 401 error, without forcing a logout", async () => {
    const onAuthFailure = vi.fn();
    const client = createApiClient({
      baseUrl: BASE_URL,
      getToken: vi.fn().mockResolvedValue(null),
      onAuthFailure,
    });

    await expect(
      client.auth.login({ email: "citizen@example.com", password: "wrong-password" }),
    ).rejects.toMatchObject({ status: 401, code: "unauthorized" });
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it("registers a new account", async () => {
    const res = await makeClient().auth.register({
      email: "new@example.com",
      name: "New Citizen",
      password: "Sup3rSecret!",
    });
    expect(res.accessToken).toBe("test-access-token");
  });
});
