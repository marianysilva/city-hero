import { describe, expect, it } from "vitest";

import { errorNormalize } from "../src/interceptors/errorNormalize";

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers });
}

describe("errorNormalize", () => {
  it("maps slowapi's 429 {error} shape, preserving Retry-After", async () => {
    const res = jsonResponse(
      429,
      { error: "Rate limit exceeded: 5 per 1 minute" },
      {
        "Retry-After": "42",
      },
    );
    const error = await errorNormalize(res);
    expect(error.status).toBe(429);
    expect(error.code).toBe("rate_limited");
    expect(error.message).toBe("Rate limit exceeded: 5 per 1 minute");
    expect(error.details).toEqual({ retryAfter: "42" });
  });

  it("maps FastAPI's 422 array-of-errors validation shape", async () => {
    const detail = [{ type: "missing", loc: ["body", "email"], msg: "Field required" }];
    const res = jsonResponse(422, { detail });
    const error = await errorNormalize(res);
    expect(error.status).toBe(422);
    expect(error.code).toBe("validation_error");
    expect(error.message).toBe("validation_error");
    expect(error.details).toEqual(detail);
  });

  it("maps FastAPI's default {detail: string} HTTPException shape", async () => {
    const res = jsonResponse(404, { detail: "User not found" });
    const error = await errorNormalize(res);
    expect(error.status).toBe(404);
    expect(error.code).toBe("not_found");
    expect(error.message).toBe("User not found");
  });

  it("falls back to the status-derived code for an unrecognized body shape", async () => {
    const res = jsonResponse(500, { somethingElse: true });
    const error = await errorNormalize(res);
    expect(error.code).toBe("server_error");
    expect(error.status).toBe(500);
  });

  it("falls back to unknown_error only when the status itself is unmapped", async () => {
    const res = jsonResponse(418, { somethingElse: true });
    const error = await errorNormalize(res);
    expect(error.code).toBe("unknown_error");
  });

  it("falls back gracefully when the body isn't valid JSON", async () => {
    const res = new Response("not json", { status: 502 });
    const error = await errorNormalize(res);
    expect(error.status).toBe(502);
    expect(error.code).toBe("server_error");
  });

  it("reads the trace ID header when present", async () => {
    const res = jsonResponse(400, { detail: "Bad request" }, { "X-Trace-Id": "trace-123" });
    const error = await errorNormalize(res);
    expect(error.traceId).toBe("trace-123");
  });

  it("returns a null trace ID when absent (no propagation middleware yet)", async () => {
    const res = jsonResponse(400, { detail: "Bad request" });
    const error = await errorNormalize(res);
    expect(error.traceId).toBeNull();
  });
});
