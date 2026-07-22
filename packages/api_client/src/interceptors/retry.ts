import type { HttpMethod } from "../types";

const RETRYABLE_STATUSES = new Set([502, 503, 504]);
// PUT/DELETE are also idempotent per RFC 7231 §4.2.2, but are deliberately
// left out here: this set gates automatic retries, and being conservative
// about which methods get replayed without the caller asking for it is a
// safer default than the RFC's full idempotent set.
const SAFE_TO_RETRY_METHODS = new Set<HttpMethod>(["GET", "HEAD", "OPTIONS"]);
const BACKOFF_MS = [500, 1000, 2000];

export function isRetryableMethod(method: HttpMethod): boolean {
  return SAFE_TO_RETRY_METHODS.has(method);
}

export function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUSES.has(status);
}

// fetch rejects with a TypeError for network failures (per the Fetch spec);
// an aborted request rejects with a DOMException named "AbortError", which
// isn't a TypeError — that distinction is what keeps cancellation from
// being retried here.
function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError;
}

export async function fetchWithRetry(
  method: HttpMethod,
  doFetch: () => Promise<Response>,
  signal?: AbortSignal,
): Promise<Response> {
  const maxAttempts = isRetryableMethod(method) ? BACKOFF_MS.length + 1 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isLastAttempt = attempt === maxAttempts;
    try {
      const response = await doFetch();
      if (isLastAttempt || !isRetryableStatus(response.status)) return response;
    } catch (err) {
      if (isLastAttempt || !isNetworkError(err)) throw err;
    }
    await sleep(jitter(BACKOFF_MS[attempt - 1]), signal);
  }

  // Every loop iteration returns or throws once attempt reaches maxAttempts;
  // this satisfies the compiler, not a reachable runtime path.
  throw new Error("unreachable");
}

// Full jitter (AWS Builders' Library, "Exponential Backoff And Jitter", Brooker
// 2015): a random delay in [0, base] instead of the exact base every time.
// Without this, every client hitting the same transient backend blip retries
// in lockstep, turning one blip into a synchronized thundering herd.
function jitter(baseMs: number): number {
  return Math.random() * baseMs;
}

// A plain setTimeout would leave an abort during the backoff wait unnoticed
// until the next doFetch() call — up to ~2s late. Racing against the signal
// makes cancellation immediate, matching the AbortController contract screens
// already rely on for the fetch call itself.
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (!signal) return new Promise((resolve) => setTimeout(resolve, ms));
  const activeSignal = signal;

  return new Promise((resolve, reject) => {
    if (activeSignal.aborted) {
      reject(activeSignal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      activeSignal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(activeSignal.reason ?? new DOMException("Aborted", "AbortError"));
    }
    activeSignal.addEventListener("abort", onAbort, { once: true });
  });
}
