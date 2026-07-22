import type { SortEntry } from "@/components/organisms/DataTable";
import { translateValidationErrors } from "@/lib/validation-messages";

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
// ({loc, msg, type, ctx}) — translateValidationErrors reads `type` to look
// up a pt-BR message and falls back to `msg` for codes it doesn't know.
// Never reads the array's `input` field, which the backend already strips
// (see apps/backend/main.py's RequestValidationError handler), but this is
// also the display layer's own line of defense against echoing back
// whatever a caller submitted.
function errorMessage(detail: unknown, status: number): string {
  if (typeof detail === "string") return detail;
  return translateValidationErrors(detail) ?? `Erro ${status}`;
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
