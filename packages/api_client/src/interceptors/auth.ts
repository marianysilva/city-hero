import type { ApiClientError } from "../errors";
import type { ApiClientConfig } from "../types";

import { errorNormalize } from "./errorNormalize";

// There is no /auth/refresh endpoint yet (see docs/tasks/00-foundation/05-api-client.md),
// so every 401 is treated as an immediate forced logout instead of a refresh-and-retry.
// Once 06-auth-system.md ships refresh tokens, this is the seam to add single-flight
// refresh instead of calling onAuthFailure directly.
export async function handleUnauthorized(
  config: ApiClientConfig,
  response: Response,
): Promise<ApiClientError> {
  const error = await errorNormalize(response);
  await config.onAuthFailure();
  return error;
}
