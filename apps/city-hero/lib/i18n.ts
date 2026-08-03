import { isSupportedLocale, resolveDefaultLocale } from "@city-hero/i18n";
import type { Locale } from "@city-hero/i18n";
import { getLocales } from "expo-localization";
import Storage from "expo-sqlite/kv-store";

const STORAGE_KEY = "cityhero.language";

// Guards against a wedged native module: a rejected read is already handled
// (see loadPersistedLocale's try/catch below), but a promise that never
// settles at all — e.g. a stuck SQLite handle — would otherwise hang
// `resolveInitialLocale()`, and with it the splash screen, forever. Racing
// against a timeout can't cancel the underlying read, but it stops it from
// blocking startup; the read result (if it ever arrives) is simply ignored.
const STORAGE_READ_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Only ever read in development builds — lets a developer preview pt-BR (or
// force en-US) without changing the OS language. See
// docs/tasks/00-foundation/13-i18n.md Status for why this is dev-only.
const DEV_LOCALE_OVERRIDE: string | null = __DEV__
  ? (process.env.EXPO_PUBLIC_DEFAULT_LOCALE ?? null)
  : null;

/** System-locale-derived default, used when no persisted user choice exists yet. */
export function getDeviceDefaultLocale(): Locale {
  return resolveDefaultLocale({
    deviceLanguageTags: getLocales().map((locale) => locale.languageTag),
    devLocaleOverride: DEV_LOCALE_OVERRIDE,
  });
}

/**
 * The user's previously chosen language, if any — takes priority over device
 * detection. Resolves to `null` (never rejects) on a storage read failure so
 * callers always fall back to the device default instead of hanging forever
 * waiting on a promise that never settles.
 */
export async function loadPersistedLocale(): Promise<Locale | null> {
  try {
    const stored = await withTimeout(Storage.getItem(STORAGE_KEY), STORAGE_READ_TIMEOUT_MS, null);
    return isSupportedLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Called from `LocaleProvider`'s `onLocaleChange` to persist a manual language change. */
export async function persistLocale(locale: Locale): Promise<void> {
  await Storage.setItem(STORAGE_KEY, locale);
}

/**
 * The locale to render on first paint: the user's persisted choice if one
 * exists, otherwise the device/dev-override default. Never rejects — a
 * failed storage read (see `loadPersistedLocale`) falls through to the
 * device default rather than leaving the caller stuck.
 */
export async function resolveInitialLocale(): Promise<Locale> {
  const persisted = await loadPersistedLocale();
  return persisted ?? getDeviceDefaultLocale();
}
