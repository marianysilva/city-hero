import type { ApiClientError } from "../errors";
import type { ApiClientConfig } from "../types";

import { errorNormalize } from "./errorNormalize";

// Neither app configures `refreshAccessToken` today — apps/backend has no
// /auth/refresh endpoint yet (see docs/tasks/00-foundation/05-api-client.md)
// — so this always resolves null and every 401 falls through to
// handleUnauthorized below. Once 06-auth-system.md ships one, a host app
// sets `refreshAccessToken` and this coordinator activates.
export function createRefreshCoordinator(config: ApiClientConfig) {
  let inFlight: Promise<string | null> | null = null;

  // Concurrent 401s all call this; only the first actually invokes
  // refreshAccessToken(), the rest await the same in-flight promise —
  // that's the single-flight part.
  return function refreshOnce(): Promise<string | null> {
    if (!config.refreshAccessToken) return Promise.resolve(null);

    if (!inFlight) {
      inFlight = config
        .refreshAccessToken()
        .then((result) => result?.accessToken ?? null)
        .catch(() => null)
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };
}

// The final fallback for a 401 that no refresh recovered (or none is
// configured): dispatch a logout and surface the normalized error.
export async function handleUnauthorized(
  config: ApiClientConfig,
  response: Response,
): Promise<ApiClientError> {
  const error = await errorNormalize(response);
  await config.onAuthFailure();
  return error;
}
