export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type Platform = "ios" | "android" | "web" | "server";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  /** Skip Authorization header injection (register/login calls). */
  skipAuth?: boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
  /** Reads the current access token from wherever the host app stores it (SecureStore, an httpOnly cookie read server-side, etc). */
  getToken: () => string | null | undefined | Promise<string | null | undefined>;
  /** Reads the active city scope. Sent as a header even though the backend doesn't enforce it yet (see docs/tasks/00-foundation/05-api-client.md). */
  getCityId?: () => string | null | undefined | Promise<string | null | undefined>;
  /** Called on a 401 response — today this always means "log the user out", never "refresh" (no /auth/refresh endpoint exists yet). */
  onAuthFailure: () => void | Promise<void>;
  appVersion?: string;
  platform?: Platform;
  /** Defaults to `navigator.onLine` when available; host apps without it (React Native) should inject a real check once NetInfo is a dependency. */
  isOnline?: () => boolean | Promise<boolean>;
  fetchImpl?: typeof fetch;
}

export interface ApiClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}
