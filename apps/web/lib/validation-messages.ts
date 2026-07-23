import { LOCALE_DICTS, translate } from "@city-hero/i18n";
import type { InterpolationValues, Locale, TranslationKey } from "@city-hero/i18n";

import { getCurrentLocale } from "./locale";

/**
 * Backend validation errors identify themselves with a stable `type` code
 * (see apps/backend/app/schemas/_validators.py's PydanticCustomError usage)
 * instead of hardcoded English prose, precisely so a client can translate
 * them — per Google's and Microsoft's REST API guidelines, the server's
 * `msg` is a developer-facing fallback, not something to show end users
 * as-is. This is the client-side half of that contract: one message per
 * code (packages/i18n's "validation" namespace, both locales), with named
 * placeholders filled from the error's `ctx`.
 *
 * Unmapped codes — Pydantic's own built-in types (e.g. EmailStr format
 * errors), or any backend code not added here yet — fall back to the
 * backend's English `msg` rather than showing nothing.
 */
const MESSAGE_KEYS: Record<string, TranslationKey> = {
  password_too_short: "validation.passwordTooShort",
  password_too_long: "validation.passwordTooLong",
  password_missing_uppercase: "validation.passwordMissingUppercase",
  password_missing_lowercase: "validation.passwordMissingLowercase",
  password_missing_digit: "validation.passwordMissingDigit",
  password_missing_special_char: "validation.passwordMissingSpecialChar",
  name_empty: "validation.nameEmpty",
  role_unknown: "validation.roleUnknown",
};

interface ValidationErrorEntry {
  type?: unknown;
  msg?: unknown;
  ctx?: unknown;
}

/**
 * Translates one FastAPI/Pydantic validation-error object. Returns null if
 * `entry` isn't a validation-error-shaped object at all.
 *
 * `locale` defaults to `getCurrentLocale()` — correct for client call sites
 * (`_api.ts`), which run one-request-at-a-time in the browser. A SERVER
 * call site (e.g. a Route Handler) must resolve its own per-request locale
 * and pass it explicitly instead — see `resolveLocaleFrom` in `./locale`
 * and `app/api/auth/login/route.ts`'s usage — since `getCurrentLocale()`'s
 * module-level ref is shared by every concurrent request in the same
 * Node process.
 */
export function translateValidationError(
  entry: unknown,
  locale: Locale = getCurrentLocale(),
): string | null {
  if (!entry || typeof entry !== "object") return null;
  const { type, msg, ctx } = entry as ValidationErrorEntry;

  const key = typeof type === "string" ? MESSAGE_KEYS[type] : undefined;
  if (key) {
    const values = (ctx && typeof ctx === "object" ? ctx : {}) as InterpolationValues;
    return translate(LOCALE_DICTS, locale, key, values);
  }
  return typeof msg === "string" ? msg : null;
}

/** Translates a FastAPI 422 `detail` array into one joined, human-readable
 * string. Returns null if `details` isn't such an array (e.g. it's a plain
 * string `detail`, or absent). See `translateValidationError`'s `locale` doc
 * for why server call sites must pass it explicitly. */
export function translateValidationErrors(
  details: unknown,
  locale: Locale = getCurrentLocale(),
): string | null {
  if (!Array.isArray(details)) return null;
  const messages = details
    .map((entry) => translateValidationError(entry, locale))
    .filter((msg): msg is string => msg !== null);
  return messages.length > 0 ? messages.join("; ") : null;
}
