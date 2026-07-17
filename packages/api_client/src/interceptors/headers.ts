import type { ApiClientConfig, RequestOptions } from "../types";

export async function buildHeaders(
  config: ApiClientConfig,
  options: RequestOptions,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (!options.skipAuth) {
    const token = await config.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // No-op server-side today — no city_id column or middleware exists yet
  // (see docs/tasks/00-foundation/05-api-client.md). Sent anyway so screens
  // and the backend can turn multi-tenancy on later without a client change.
  const cityId = await config.getCityId?.();
  if (cityId) headers["X-City-Id"] = cityId;

  if (config.appVersion) headers["X-App-Version"] = config.appVersion;
  if (config.platform) headers["X-Platform"] = config.platform;

  return headers;
}
