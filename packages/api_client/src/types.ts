export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type Platform = "ios" | "android" | "web" | "server";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | (string | number | boolean)[]>;
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
  /** Called on a 401 response when no refresh recovers it (or none is configured) — the host app should log the user out. */
  onAuthFailure: () => void | Promise<void>;
  /**
   * Exchanges the expired session for a new access token and persists it
   * (SecureStore, a Set-Cookie response, etc — this client owns no token
   * storage). Concurrent 401s share a single in-flight call to this
   * (see interceptors/auth.ts's single-flight coordinator); a null/rejected
   * result falls back to onAuthFailure. Omit this until the host app has a
   * real refresh endpoint to call — neither apps/web nor apps/city-hero
   * configure it today because apps/backend has no `/auth/refresh` yet (see
   * docs/tasks/00-foundation/05-api-client.md); every 401 is an immediate
   * forced logout until then.
   */
  refreshAccessToken?: () => Promise<{ accessToken: string } | null>;
  appVersion?: string;
  platform?: Platform;
  /** Defaults to `navigator.onLine` when available; host apps without it (React Native) should inject a real check once NetInfo is a dependency. */
  isOnline?: () => boolean | Promise<boolean>;
  fetchImpl?: typeof fetch;
}

export interface ApiClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}
