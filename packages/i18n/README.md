# @city-hero/i18n

Two-locale (pt-BR, en-US) internationalization for CityHero. See
[`docs/tasks/00-foundation/13-i18n.md`](../../docs/tasks/00-foundation/13-i18n.md) for the full spec
and Status.

## Architecture

Per the task's own "Architecture note": at 2-locale scale, `expo-localization` (device detection) +
a small typed key-value dictionary + `Intl` (`PluralRules`, `NumberFormat`, `DateTimeFormat`,
`RelativeTimeFormat`) satisfies every Acceptance Criteria scenario with no i18next backend/namespace
machinery. This package stays framework-agnostic — no `expo-localization` (or any RN/Next-specific)
import here, only plain string params and React — so it's usable from both `apps/city-hero` (React
Native) and `apps/web` (Next.js), and unit-testable with plain Vitest.

Persistence and analytics are the host app's job, not this package's — same pattern as
`@city-hero/design-system`'s `ThemeProvider` (`initialPreference`/`onPreferenceChange`). See:

### Subpath exports (`./core` vs `./react`)

The package root (`@city-hero/i18n`) re-exports everything, but internally it's split into two
subpaths a caller can import directly:

- `@city-hero/i18n/core` — `translate`, `formatDateTime`/`formatRelativeTime`/`formatNumber`,
  `resolveDefaultLocale`, `LOCALE_DICTS`, and the plain types. No React import anywhere in this
  module's graph — safe in a Next.js Server Component or Route Handler.
- `@city-hero/i18n/react` — `LocaleProvider`/`useTranslation`/`useLocale`/`useLocaleContext`. All of
  `LocaleProvider.tsx`'s exports are one `"use client"` module, so Next.js's bundler treats it as a
  client boundary rather than executing it even when pulled in transitively via the root barrel —
  but prefer importing `./core` directly in server-only code so that stays true by construction, not
  by whichever file happens to carry the directive.

`peerDependencies.react` still applies to the whole package (npm/pnpm resolve peer deps per package,
not per subpath) — `./core`'s own modules don't import React, but a consumer that only ever imports
`./core` still needs `react` installed to satisfy the package's peer dependency. Splitting that
fully would mean two separate npm packages, which isn't worth it at this repo's scale.

- `apps/city-hero/lib/i18n.ts` — `expo-sqlite/kv-store` for persistence, `expo-localization` for
  device detection.
- `apps/web/lib/locale.ts` + `apps/web/app/lib/i18n.ts` — a plain cookie for persistence (readable
  both client- and server-side) and the `Accept-Language` header for device detection. Next.js Route
  Handlers serve every user's request in one Node process, so they can't read the client-only
  `getCurrentLocale()` module ref — non-component call sites there (`_api.ts`'s error formatting,
  `lib/validation-messages.ts`, `lib/api-error-response.ts`) take an explicit `locale` param
  instead, resolved per-request via `resolveLocaleFromRequest`/`resolveLocaleFrom`.

## Usage

```tsx
import { LocaleProvider, useTranslation } from "@city-hero/i18n";

function Root() {
  return (
    <LocaleProvider initialLocale="en-US" onLocaleChange={persistLocale}>
      <Screen />
    </LocaleProvider>
  );
}

function Screen() {
  const { t } = useTranslation();
  return <Text>{t("report.supportsCount", { count: 5 })}</Text>;
}
```

- Keys are `"namespace.key"` (`common`, `home`, `camera`, `report`, `auth`, `errors`, `dashboard`,
  `users`, `validation` — one JSON file per namespace under `src/locales/<locale>/`. `dashboard`,
  `users`, and `validation` are `apps/web`-specific; the rest are shared or mobile-specific).
- Plurals: a value can be `{ zero?, one, other }` instead of a string; resolved via
  `Intl.PluralRules`, with an exact-value override for `count === 0` (pt-BR's CLDR "one" category
  covers both 0 and 1, but the product wants distinct copy for zero).
- Missing keys fall back current locale → `en-US` → the key itself, log a dev console warning, and
  call `onMissingKey` (wire this to analytics — `i18n.missing_key`).
- `useLocale()` exposes `{ locale, setLocale }` for a language picker (not built yet — see Status).

## Adding a translation key

Add the same key to every namespace file for **both** `src/locales/pt-BR/<namespace>.json` and
`src/locales/en-US/<namespace>.json`. `src/locales/parity.test.ts` fails the build if a key exists
in one locale but not the other, or if plural-form shapes (`zero`/`one`/`other`) diverge between
locales.
