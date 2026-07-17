import type { ApiErrorCode } from "../errors";
import { ApiClientError } from "../errors";

function codeForStatus(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 413:
      return "payload_too_large";
    case 422:
      return "validation_error";
    case 429:
      return "rate_limited";
    default:
      return status >= 500 ? "server_error" : "unknown_error";
  }
}

/**
 * The backend emits three different error shapes today (see
 * docs/tasks/00-foundation/05-api-client.md): FastAPI's default
 * `{"detail": "..."}` for HTTPExceptions, FastAPI's default 422
 * array-of-errors for Pydantic validation, and slowapi's own
 * `{"error": "..."}` for 429s. There's no server-side `code` or trace-ID
 * yet, so both are derived/absent here rather than read from the response.
 */
export async function errorNormalize(response: Response): Promise<ApiClientError> {
  const status = response.status;
  const code = codeForStatus(status);
  const traceId = response.headers.get("X-Trace-Id");

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (status === 429 && isRecord(body) && typeof body.error === "string") {
    return new ApiClientError({
      status,
      code,
      message: body.error,
      details: { retryAfter: response.headers.get("Retry-After") },
      traceId,
    });
  }

  if (status === 422 && isRecord(body) && Array.isArray(body.detail)) {
    return new ApiClientError({
      status,
      code,
      message: "validation_error",
      details: body.detail,
      traceId,
    });
  }

  if (isRecord(body) && typeof body.detail === "string") {
    return new ApiClientError({
      status,
      code,
      message: body.detail,
      details: null,
      traceId,
    });
  }

  return new ApiClientError({
    status,
    code,
    message: `unknown_error_${status}`,
    details: body,
    traceId,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
