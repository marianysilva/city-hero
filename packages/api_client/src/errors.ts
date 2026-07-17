/**
 * Machine-readable, i18n-lookup-ready keys. `code` is what screens translate;
 * `message` is a human string for logs/debugging, not for direct display —
 * the backend doesn't emit a `code` field today (see errorNormalize.ts), so
 * `message` is whatever raw text the backend happened to send, not a key.
 */
export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "payload_too_large"
  | "validation_error"
  | "rate_limited"
  | "server_error"
  | "network_error"
  | "offline"
  | "unknown_error";

export interface NormalizedErrorShape {
  status: number;
  code: ApiErrorCode;
  message: string;
  details: unknown;
  traceId: string | null;
}

interface ApiClientErrorInit {
  status: number;
  code: ApiErrorCode;
  message: string;
  details?: unknown;
  traceId?: string | null;
}

export class ApiClientError extends Error implements NormalizedErrorShape {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: unknown;
  readonly traceId: string | null;

  constructor({ status, code, message, details = null, traceId = null }: ApiClientErrorInit) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.traceId = traceId;
  }
}

export function offlineError(): ApiClientError {
  return new ApiClientError({
    status: 0,
    code: "offline",
    message: "offline",
  });
}

export function networkError(cause: unknown): ApiClientError {
  return new ApiClientError({
    status: 0,
    code: "network_error",
    message: cause instanceof Error ? cause.message : "network_error",
  });
}
