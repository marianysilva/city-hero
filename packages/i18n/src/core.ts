// Framework-agnostic half of @city-hero/i18n — no React import anywhere in
// this module's graph, so it's safe to import from a Server Component, a
// Next.js Route Handler, or any other non-React context (this is exactly
// what apps/web's Route Handlers and server-rendered pages need). Prefer
// this subpath over the package root in server-only code; see ./react.ts
// for the React bindings (LocaleProvider/hooks).
export { resolveDefaultLocale } from "./resolveDefaultLocale";
export type { ResolveDefaultLocaleParams } from "./resolveDefaultLocale";

export { formatDateTime, formatRelativeTime } from "./formatDate";
export { formatNumber } from "./formatNumber";
export { translate } from "./translate";
export type { InterpolationValues } from "./translate";

export { LOCALE_DICTS } from "./locales";

export { FALLBACK_LOCALE, isSupportedLocale, SUPPORTED_LOCALES } from "./types";
export type {
  Locale,
  LocaleDict,
  MissingKeyInfo,
  Namespace,
  NamespaceDict,
  PluralForms,
  TFunction,
  TranslationKey,
  TranslationValue,
} from "./types";
