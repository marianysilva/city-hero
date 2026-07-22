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

  it("aborts promptly during the backoff wait instead of waiting out the full delay", async () => {
    const controller = new AbortController();
    const doFetch = vi.fn(async () => new Response(null, { status: 503 }));

    const resultPromise = fetchWithRetry("GET", doFetch, controller.signal);
    // Let the first doFetch settle and the backoff timer get scheduled,
    // without letting the timer itself fire yet.
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();

    await expect(resultPromise).rejects.toMatchObject({ name: "AbortError" });
    // Only the one attempt before the abort — no retry was attempted.
    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects immediately without waiting when the signal is already aborted before the backoff starts", async () => {
    const controller = new AbortController();
    controller.abort();
    const doFetch = vi.fn(async () => new Response(null, { status: 503 }));

    await expect(fetchWithRetry("GET", doFetch, controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it("retries and eventually succeeds when a signal is provided but never aborted", async () => {
    const controller = new AbortController();
    let calls = 0;
    const doFetch = vi.fn(async () => {
      calls++;
      if (calls < 2) return new Response(null, { status: 503 });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const resultPromise = fetchWithRetry("GET", doFetch, controller.signal);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.status).toBe(200);
    expect(doFetch).toHaveBeenCalledTimes(2);
  });

  it("jitters each backoff delay instead of waiting the exact same duration every time", async () => {
    // Two identical 4-attempt runs (503 every time) must not sleep the exact
    // same [500, 1000, 2000] sequence both times — full jitter varies the
    // wait, which is what actually prevents concurrent clients from
    // retrying in lockstep after a shared transient failure.
    async function recordDelays(): Promise<number[]> {
      const delays: number[] = [];
      const originalSetTimeout = globalThis.setTimeout;
      vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: () => void, ms?: number) => {
        delays.push(ms ?? 0);
        return originalSetTimeout(fn, ms);
      }) as typeof setTimeout);

      const doFetch = vi.fn(async () => new Response(null, { status: 503 }));
      const resultPromise = fetchWithRetry("GET", doFetch);
      await vi.runAllTimersAsync();
      await resultPromise;

      vi.restoreAllMocks();
      return delays;
    }

    const first = await recordDelays();
    const second = await recordDelays();

    expect(first).toHaveLength(3);
    expect(first).not.toEqual(second);
    // Full jitter: each delay is somewhere in [0, base], never negative and
    // never more than the base backoff step it jitters from.
    const bases = [500, 1000, 2000];
    first.forEach((delay, i) => {
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(bases[i]);
    });
  });
});
