import { createAuthEndpoints } from "./endpoints/auth";
import type { AuthEndpoints } from "./endpoints/auth";
import { createUsersEndpoints } from "./endpoints/users";
import type { UsersEndpoints } from "./endpoints/users";
import { networkError, offlineError } from "./errors";
import { createRefreshCoordinator, handleUnauthorized } from "./interceptors/auth";
import { errorNormalize } from "./interceptors/errorNormalize";
import { buildHeaders } from "./interceptors/headers";
import { fetchWithRetry } from "./interceptors/retry";
import type { ApiClient, ApiClientConfig, HttpMethod, RequestOptions } from "./types";

// reports/comments/notifications wrappers were removed: apps/backend/app/routers/
// only has auth.py and users.py today, and this client must never call a route
// the backend doesn't implement. Add them back once their backend routers ship.
export interface FullApiClient extends ApiClient {
  auth: AuthEndpoints;
  users: UsersEndpoints;
}

// Accessed via globalThis, not the `navigator` global, because this package
// has no DOM lib (it also runs under React Native and Node, neither of which
// ships one) — RN doesn't reliably expose navigator.onLine either, so this
// only really activates in browser/Next.js hosts; RN hosts should inject a
// real check via config.isOnline once NetInfo is a dependency.
function defaultIsOnline(): boolean {
  const nav = (globalThis as { navigator?: { onLine?: boolean } }).navigator;
  return nav?.onLine ?? true;
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" && err !== null && (err as { name?: unknown }).name === "AbortError"
  );
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export function createApiClient(config: ApiClientConfig): FullApiClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const isOnline = config.isOnline ?? defaultIsOnline;
  const refreshOnce = createRefreshCoordinator(config);

  async function request<T>(
    path: string,
    options: RequestOptions = {},
    isRetryAfterRefresh = false,
  ): Promise<T> {
    const method: HttpMethod = options.method ?? "GET";

    if (!(await isOnline())) {
      throw offlineError();
    }

    const headers = await buildHeaders(config, options);
    const url = buildUrl(config.baseUrl, path, options.query);

    let response: Response;
    try {
      response = await fetchWithRetry(
        method,
        () =>
          fetchImpl(url, {
            method,
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
            signal: options.signal,
          }),
        options.signal,
      );
    } catch (err) {
      if (isAbortError(err)) throw err;
      throw networkError(err);
    }

    // A 401 on a skipAuth request (login/register) just means "wrong
    // credentials" — there's no session to force-logout yet. Only an
    // authenticated request's 401 means "this token is no longer valid."
    if (response.status === 401 && !options.skipAuth) {
      // Try a refresh-and-retry-once before giving up — refreshOnce()
      // resolves null immediately when no refreshAccessToken is configured
      // (today, in both real apps), so this is a no-op fallthrough to
      // handleUnauthorized in that case, same as before this existed.
      if (!isRetryAfterRefresh) {
        const newToken = await refreshOnce();
        if (newToken) return request<T>(path, options, true);
      }
      throw await handleUnauthorized(config, response);
    }

    if (!response.ok) {
      throw await errorNormalize(response);
    }

    if (response.status === 204) return undefined as T;

    return (await response.json()) as T;
  }

  const client: ApiClient = { request };

  return {
    request,
    auth: createAuthEndpoints(client),
    users: createUsersEndpoints(client),
  };
}
