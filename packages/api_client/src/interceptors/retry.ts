import type { HttpMethod } from "../types";

const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const IDEMPOTENT_METHODS = new Set<HttpMethod>(["GET", "HEAD", "OPTIONS"]);
const BACKOFF_MS = [500, 1000, 2000];

export function isRetryableMethod(method: HttpMethod): boolean {
  return IDEMPOTENT_METHODS.has(method);
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
    await sleep(BACKOFF_MS[attempt - 1]);
  }

  // Every loop iteration returns or throws once attempt reaches maxAttempts;
  // this satisfies the compiler, not a reachable runtime path.
  throw new Error("unreachable");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
