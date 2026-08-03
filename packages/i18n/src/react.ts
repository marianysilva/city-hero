// React bindings for @city-hero/i18n — everything here ultimately depends on
// React context/hooks (see LocaleProvider.tsx's "use client" directive).
// Import from here in client components/hooks; use ./core in server-only code.
export { LocaleProvider, useLocale, useLocaleContext, useTranslation } from "./LocaleProvider";
export type { LocaleProviderProps } from "./LocaleProvider";
