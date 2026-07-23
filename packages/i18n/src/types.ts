export type Locale = "pt-BR" | "en-US";

export const SUPPORTED_LOCALES: readonly Locale[] = ["pt-BR", "en-US"];

// English is the app-wide default per product decision (2026-07-22, see
// docs/tasks/00-foundation/13-i18n.md Status) — device/system locale is still
// detected, but any non-pt/non-en system locale now falls back to en-US
// instead of pt-BR.
export const FALLBACK_LOCALE: Locale = "en-US";

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export type PluralForms = {
  zero?: string;
  one: string;
  other: string;
};

export type TranslationValue = string | PluralForms;

export type NamespaceDict = Record<string, TranslationValue>;

export type Namespace = "common" | "home" | "camera" | "report" | "auth" | "errors";

export type LocaleDict = Record<Namespace, NamespaceDict>;

/**
 * `namespace.key` — the only shape `t()` accepts, so a typo can't silently
 * resolve to the wrong namespace.
 */
export type TranslationKey = `${Namespace}.${string}`;

export type MissingKeyInfo = {
  key: TranslationKey;
  locale: Locale;
};
