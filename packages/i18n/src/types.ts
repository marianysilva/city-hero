// Imported directly (not via ./locales/index.ts, which would create a
// circular import back into this file) purely for their key shape, so
// `TranslationKey` below is a real literal union instead of `${Namespace}.${string}`
// — the latter let any typo'd key compile silently; a caller only found out
// at runtime (dev console warning) or via the parity test. en-US is treated
// as the canonical key set, matching parity.test.ts and FALLBACK_LOCALE.
import authEnUS from "./locales/en-US/auth.json";
import cameraEnUS from "./locales/en-US/camera.json";
import commonEnUS from "./locales/en-US/common.json";
import dashboardEnUS from "./locales/en-US/dashboard.json";
import errorsEnUS from "./locales/en-US/errors.json";
import homeEnUS from "./locales/en-US/home.json";
import reportEnUS from "./locales/en-US/report.json";
import usersEnUS from "./locales/en-US/users.json";
import validationEnUS from "./locales/en-US/validation.json";

export type Locale = "pt-BR" | "en-US";

// en-US first, matching FALLBACK_LOCALE below — the only order-dependent
// consumer is apps/web's language <select> (getLanguageOptions in
// app/(dashboard)/users/_types.ts), where this order is also the dropdown's
// display order.
export const SUPPORTED_LOCALES: readonly Locale[] = ["en-US", "pt-BR"];

// English is the app-wide default per product decision (2026-07-22, see
// docs/tasks/00-foundation/13-i18n.md Status) — device/system locale is still
// detected, but any non-pt/non-en system locale now falls back to en-US
// instead of pt-BR.
export const FALLBACK_LOCALE: Locale = "en-US";

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

// All CLDR plural categories, per Intl.PluralRules' `select()` return type —
// not just the zero/one/other pt-BR and en-US actually need. Only `other` is
// required (it's the universal category every locale has); the rest are
// optional so today's 2-locale dictionaries don't need to supply categories
// they'll never hit. A future locale needing `few`/`many`/`two` (e.g. Polish,
// Arabic) is then a data change (add the JSON keys), not a type/resolver
// rewrite — see resolvePluralForm in translate.ts for how each is consulted.
export type PluralForms = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

export type TranslationValue = string | PluralForms;

export type NamespaceDict = Record<string, TranslationValue>;

export type Namespace =
  | "common"
  | "home"
  | "camera"
  | "report"
  | "auth"
  | "errors"
  | "dashboard"
  | "users"
  | "validation";

export type LocaleDict = Record<Namespace, NamespaceDict>;

type NamespaceKeys = {
  common: keyof typeof commonEnUS;
  home: keyof typeof homeEnUS;
  camera: keyof typeof cameraEnUS;
  report: keyof typeof reportEnUS;
  auth: keyof typeof authEnUS;
  errors: keyof typeof errorsEnUS;
  dashboard: keyof typeof dashboardEnUS;
  users: keyof typeof usersEnUS;
  validation: keyof typeof validationEnUS;
};

/**
 * `namespace.key` — a literal union derived from the actual en-US dictionaries,
 * so `t("common.thisDoesNotExist")` is a compile-time error rather than
 * something only caught at runtime or by the parity test.
 */
export type TranslationKey = {
  [N in Namespace]: `${N}.${NamespaceKeys[N] & string}`;
}[Namespace];

export type MissingKeyInfo = {
  key: TranslationKey;
  locale: Locale;
};

/**
 * The shape of `useTranslation()`'s `t` — exported standalone so a `t`
 * received from a hook can be threaded as a plain parameter into
 * non-component helpers (e.g. building a translated options list, or a
 * fetch-layer error formatter) without those modules importing React.
 */
export type TFunction = (key: TranslationKey, values?: TranslationValuesInput) => string;

// Kept structurally identical to translate.ts's InterpolationValues without
// importing it here, to avoid a circular import (translate.ts imports from
// this file).
export type TranslationValuesInput = Record<string, string | number> & { count?: number };
