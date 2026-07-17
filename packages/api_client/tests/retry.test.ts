import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchWithRetry } from "../src/interceptors/retry";

describe("fetchWithRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries a GET on 503 with exponential backoff and returns the eventual success", async () => {
    let calls = 0;
    const doFetch = vi.fn(async () => {
      calls++;
      if (calls < 3) return new Response(null, { status: 503 });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const resultPromise = fetchWithRetry("GET", doFetch);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.status).toBe(200);
    expect(doFetch).toHaveBeenCalledTimes(3);
  });

  it("gives up after 3 retries (4 total attempts) and returns the last failing response", async () => {
    const doFetch = vi.fn(async () => new Response(null, { status: 502 }));

    const resultPromise = fetchWithRetry("GET", doFetch);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.status).toBe(502);
    expect(doFetch).toHaveBeenCalledTimes(4);
  });

  it("does not retry a POST — mutating requests aren't safe to replay", async () => {
    const doFetch = vi.fn(async () => new Response(null, { status: 503 }));

    const result = await fetchWithRetry("POST", doFetch);

    expect(result.status).toBe(503);
    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it("does not retry a non-retryable status like 404", async () => {
    const doFetch = vi.fn(async () => new Response(null, { status: 404 }));

    const result = await fetchWithRetry("GET", doFetch);

    expect(result.status).toBe(404);
    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it("retries a GET on a network error (TypeError) and recovers", async () => {
    let calls = 0;
    const doFetch = vi.fn(async () => {
      calls++;
      if (calls < 2) throw new TypeError("Failed to fetch");
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const resultPromise = fetchWithRetry("GET", doFetch);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.status).toBe(200);
    expect(doFetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry an aborted request", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    const doFetch = vi.fn(async () => {
      throw abortError;
    });

    await expect(fetchWithRetry("GET", doFetch)).rejects.toBe(abortError);
    expect(doFetch).toHaveBeenCalledTimes(1);
  });
});
