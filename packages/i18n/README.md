# @city-hero/i18n

Two-locale (pt-BR, en-US) internationalization for CityHero. See
[`docs/tasks/00-foundation/13-i18n.md`](../../docs/tasks/00-foundation/13-i18n.md) for the full spec
and Status.

## Architecture

Per the task's own "Architecture note": at 2-locale scale, `expo-localization` (device detection) +
a small typed key-value dictionary + `Intl` (`PluralRules`, `NumberFormat`, `DateTimeFormat`,
`RelativeTimeFormat`) satisfies every Acceptance Criteria scenario with no i18next backend/namespace
machinery. This package stays framework-agnostic — no `expo-localization` import here, only plain
string params — so it's usable from `apps/city-hero` and unit-testable with plain Vitest.

Persistence and analytics are the host app's job, not this package's — same pattern as
`@city-hero/design-system`'s `ThemeProvider` (`initialPreference`/`onPreferenceChange`). See
`apps/city-hero/lib/i18n.ts` for the host wiring (`expo-sqlite/kv-store` for persistence,
`expo-localization` for device detection).

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

- Keys are `"namespace.key"` (`common`, `home`, `camera`, `report`, `auth`, `errors` — one JSON file
  per namespace under `src/locales/<locale>/`).
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
