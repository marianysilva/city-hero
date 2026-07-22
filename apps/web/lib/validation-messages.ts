/**
 * Backend validation errors identify themselves with a stable `type` code
 * (see apps/backend/app/schemas/_validators.py's PydanticCustomError usage)
 * instead of hardcoded English prose, precisely so a client can translate
 * them — per Google's and Microsoft's REST API guidelines, the server's
 * `msg` is a developer-facing fallback, not something to show end users
 * as-is. This is the client-side half of that contract: one pt-BR message
 * per code, with named placeholders filled from the error's `ctx`.
 *
 * Unmapped codes — Pydantic's own built-in types (e.g. EmailStr format
 * errors), or any backend code not added here yet — fall back to the
 * backend's English `msg` rather than showing nothing.
 */
const PT_BR_MESSAGES: Record<string, string> = {
  password_too_short: "A senha deve ter pelo menos {min_length} caracteres",
  password_too_long: "A senha deve ter no máximo {max_length} caracteres",
  password_missing_uppercase: "A senha deve conter pelo menos uma letra maiúscula",
  password_missing_lowercase: "A senha deve conter pelo menos uma letra minúscula",
  password_missing_digit: "A senha deve conter pelo menos um número",
  password_missing_special_char: "A senha deve conter pelo menos um caractere especial",
  name_empty: "O nome não pode estar vazio",
  role_unknown: "Função desconhecida: {role}",
};

interface ValidationErrorEntry {
  type?: unknown;
  msg?: unknown;
  ctx?: unknown;
}

function interpolate(template: string, ctx: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, key) =>
    key in ctx ? String(ctx[key]) : placeholder,
  );
}

/** Translates one FastAPI/Pydantic validation-error object. Returns null if
 * `entry` isn't a validation-error-shaped object at all. */
export function translateValidationError(entry: unknown): string | null {
  if (!entry || typeof entry !== "object") return null;
  const { type, msg, ctx } = entry as ValidationErrorEntry;

  const template = typeof type === "string" ? PT_BR_MESSAGES[type] : undefined;
  if (template) {
    return interpolate(
      template,
      ctx && typeof ctx === "object" ? (ctx as Record<string, unknown>) : {},
    );
  }
  return typeof msg === "string" ? msg : null;
}

/** Translates a FastAPI 422 `detail` array into one joined, human-readable
 * string. Returns null if `details` isn't such an array (e.g. it's a plain
 * string `detail`, or absent). */
export function translateValidationErrors(details: unknown): string | null {
  if (!Array.isArray(details)) return null;
  const messages = details
    .map((entry) => translateValidationError(entry))
    .filter((msg): msg is string => msg !== null);
  return messages.length > 0 ? messages.join("; ") : null;
}
