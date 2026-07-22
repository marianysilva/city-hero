import { ApiClientError } from "@city-hero/api-client";
import { describe, expect, it } from "vitest";

import { apiErrorResponse } from "./api-error-response";

describe("apiErrorResponse", () => {
  it("passes through a real HTTPException detail message", async () => {
    const error = new ApiClientError({ status: 404, code: "not_found", message: "User not found" });

    const response = apiErrorResponse(error);

    expect(response.status).toBe(404);
    expect((await response.json()).detail).toBe("User not found");
  });

  it("passes through the validation-error details array as-is", async () => {
    const details = [{ type: "missing", loc: ["body", "email"], msg: "Field required" }];
    const error = new ApiClientError({
      status: 422,
      code: "validation_error",
      message: "validation_error",
      details,
    });

    const response = apiErrorResponse(error);

    expect((await response.json()).detail).toEqual(details);
  });

  it("does not leak the internal fallback code for an unmapped 500", async () => {
    const error = new ApiClientError({
      status: 500,
      code: "server_error",
      message: "unknown_error_500",
    });

    const response = apiErrorResponse(error);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.detail).not.toContain("unknown_error");
    expect(typeof body.detail).toBe("string");
  });

  it("does not leak the internal fallback code for a genuinely unmapped status", async () => {
    const error = new ApiClientError({
      status: 418,
      code: "unknown_error",
      message: "unknown_error_418",
    });

    const response = apiErrorResponse(error);

    const body = await response.json();
    expect(body.detail).not.toContain("unknown_error");
  });

  it("returns 503 when the error isn't an ApiClientError (backend unreachable)", async () => {
    const response = apiErrorResponse(new Error("fetch failed"));

    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe("Backend unavailable");
  });
});
