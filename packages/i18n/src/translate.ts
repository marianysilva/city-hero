import { FALLBACK_LOCALE } from "./types";
import type {
  Locale,
  LocaleDict,
  MissingKeyInfo,
  Namespace,
  PluralForms,
  TranslationKey,
  TranslationValue,
} from "./types";

export type InterpolationValues = Record<string, string | number> & { count?: number };

const isDev = () => process.env.NODE_ENV !== "production";

function isPluralForms(value: TranslationValue): value is PluralForms {
  return typeof value === "object" && value !== null;
}

function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, token: string) => {
    const value = values[token];
    return value === undefined ? match : String(value);
  });
}

function resolvePluralForm(forms: PluralForms, count: number, locale: Locale): string {
  // Exact-value override: CLDR's "one" category covers both 0 and 1 for
  // pt-BR (Intl.PluralRules("pt-BR").select(0) === "one"), but the product
  // wants distinct copy for zero ("sem apoios" vs "1 apoio"). Check the
  // literal value before consulting the CLDR category.
  if (count === 0 && forms.zero !== undefined) return forms.zero;

  // Generic over every CLDR category (zero/one/two/few/many/other), not just
  // the ones pt-BR/en-US happen to use — a locale that supplies `few`/`many`
  // (e.g. Polish, Arabic) is picked up automatically; one that doesn't falls
  // through to `other`, same as today.
  const rule = new Intl.PluralRules(locale).select(count);
  return forms[rule] ?? forms.other;
}

function lookup(
  dicts: Record<Locale, LocaleDict>,
  locale: Locale,
  namespace: Namespace,
  shortKey: string,
) {
  return dicts[locale]?.[namespace]?.[shortKey];
}

/**
 * Fallback chain per the "Missing translation key" scenario: current locale,
 * then `FALLBACK_LOCALE`, then the key itself as visible text. Logs a dev
 * console warning and, regardless of environment, calls `onMissingKey` so the
 * host app can forward it to analytics in prod (`i18n.missing_key`).
 */
export function translate(
  dicts: Record<Locale, LocaleDict>,
  locale: Locale,
  key: TranslationKey,
  values?: InterpolationValues,
  onMissingKey?: (info: MissingKeyInfo) => void,
): string {
  const dotIndex = key.indexOf(".");
  const namespace = key.slice(0, dotIndex) as Namespace;
  const shortKey = key.slice(dotIndex + 1);

  let raw = lookup(dicts, locale, namespace, shortKey);
  if (raw === undefined && locale !== FALLBACK_LOCALE) {
    raw = lookup(dicts, FALLBACK_LOCALE, namespace, shortKey);
  }

  if (raw === undefined) {
    if (isDev()) {
      console.warn(`[i18n] Missing translation key: "${key}" (locale: ${locale})`);
    }
    onMissingKey?.({ key, locale });
    return key;
  }

  let resolved: string;
  if (isPluralForms(raw)) {
    if (values?.count === undefined && isDev()) {
      console.warn(`[i18n] Plural key "${key}" used without a "count" value (locale: ${locale})`);
    }
    resolved = resolvePluralForm(raw, values?.count ?? 0, locale);
  } else {
    resolved = raw;
  }
  return interpolate(resolved, values);
}
