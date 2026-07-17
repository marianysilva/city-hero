import type { SortEntry } from "@/components/organisms/DataTable";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// `detail` is either a plain string (FastAPI's default {"detail": "..."})
// or, on a 422, an array of Pydantic validation-error objects
// ({loc, msg, type}). Only `msg` is ever read — never the array's `input`
// field, which the backend already strips (see apps/backend/main.py's
// RequestValidationError handler), but this is also the display layer's
// own line of defense against echoing back whatever a caller submitted.
function errorMessage(detail: unknown, status: number): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry) =>
        entry && typeof entry === "object" && typeof (entry as { msg?: unknown }).msg === "string"
          ? (entry as { msg: string }).msg
          : null,
      )
      .filter((msg): msg is string => msg !== null);
    if (messages.length > 0) return messages.join("; ");
  }
  return `Erro ${status}`;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | undefined> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errorMessage(body.detail, res.status));
  }
  if (res.status === 204) return undefined;
  return res.json();
}

export function buildSortParams(sort: SortEntry[]): string {
  return sort.map((s) => `sort=${s.field}:${s.dir}`).join("&");
}
