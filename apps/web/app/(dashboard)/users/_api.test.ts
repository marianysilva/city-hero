import { afterEach, describe, expect, it, vi } from "vitest";

import { apiFetch, ApiError, buildSortParams } from "./_api";

function mockFetchResponse(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch — error message extraction", () => {
  it("uses a plain string detail as-is", async () => {
    mockFetchResponse(401, { detail: "Could not validate credentials" });

    await expect(apiFetch("/api/users/me")).rejects.toMatchObject({
      status: 401,
      message: "Could not validate credentials",
    });
  });

  it("joins the msg fields of a validation-error array, not the raw input", async () => {
    mockFetchResponse(422, {
      detail: [
        {
          type: "value_error",
          loc: ["body", "newPassword"],
          msg: "Value error, Password must contain at least one uppercase letter",
          input: "123qweasd",
        },
      ],
    });

    const error = await apiFetch("/api/users/x/reset-password").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe(
      "Value error, Password must contain at least one uppercase letter",
    );
    expect((error as ApiError).message).not.toContain("123qweasd");
  });

  it("translates a known backend `type` code to pt-BR instead of showing the English msg", async () => {
    mockFetchResponse(422, {
      detail: [
        {
          type: "password_missing_uppercase",
          loc: ["body", "newPassword"],
          msg: "Password must contain at least one uppercase letter",
        },
      ],
    });

    await expect(apiFetch("/api/users/x/reset-password")).rejects.toMatchObject({
      message: "A senha deve conter pelo menos uma letra maiúscula",
    });
  });

  it("interpolates ctx params into the translated pt-BR message", async () => {
    mockFetchResponse(422, {
      detail: [
        {
          type: "password_too_short",
          loc: ["body", "newPassword"],
          msg: "Password must be at least 8 characters",
          ctx: { min_length: 8 },
        },
      ],
    });

    await expect(apiFetch("/api/users/x/reset-password")).rejects.toMatchObject({
      message: "A senha deve ter pelo menos 8 caracteres",
    });
  });

  it("joins multiple validation errors with a separator", async () => {
    mockFetchResponse(422, {
      detail: [
        { msg: "Value error, Password must contain at least one uppercase letter" },
        { msg: "Value error, Password must contain at least one digit" },
      ],
    });

    await expect(apiFetch("/api/users/x/reset-password")).rejects.toMatchObject({
      message:
        "Value error, Password must contain at least one uppercase letter; Value error, Password must contain at least one digit",
    });
  });

  it("falls back to a generic message when detail is missing or malformed", async () => {
    mockFetchResponse(500, {});

    await expect(apiFetch("/api/users")).rejects.toMatchObject({
      status: 500,
      message: "Erro 500",
    });
  });
});

describe("buildSortParams", () => {
  it("formats sort entries as field:dir pairs", () => {
    expect(buildSortParams([{ field: "name", dir: "asc" }])).toBe("sort=name:asc");
  });
});
