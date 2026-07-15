# CityHero — Mobile

React Native (Expo) citizen app — reporting, camera AI, gamification. Talks to the FastAPI
[`backend`](../backend/README.md).

> **Status:** this app is still on the default Expo Router tabs template (`app/(tabs)/`,
> `components/Themed.tsx`, etc.) — CityHero-specific screens (AI camera, civic feed, login,
> gamification) haven't been built out yet. Structure below reflects what's actually here today, not
> the target feature set (see [`../README.md`](../README.md) and
> [`/docs/features.md`](../../docs/features.md) for the product scope).

---

## Structure

**`app/`** — file-based routes via Expo Router. `_layout.tsx` is the root Stack navigator (registers
the `(tabs)` group and a modal screen); `(tabs)/` is the tab navigator, currently the two
placeholder screens from the Expo template (`index.tsx`, `two.tsx`) plus its own `_layout.tsx` for
the tab bar. `modal.tsx` and `+not-found.tsx` are template screens (example modal, 404 fallback).

**`components/`** — shared UI primitives from the Expo template: `Themed.tsx` (`Text`/`View` that
adapt to light/dark mode via `constants/Colors.ts`), `ExternalLink.tsx`, `StyledText.tsx`, plus the
`useColorScheme`/`useClientOnlyValue` hooks used by the tab layout.

**`constants/`** — `Colors.ts`, the light/dark color palette consumed by `Themed.tsx` and the tab
bar.

**`assets/`** — app icons, splash screen image, and the `SpaceMono` font loaded in
`app/_layout.tsx`.

## Running locally

The default, tested way to run this app is through the repo-root Makefile — see the
[root README](../../README.md#getting-started) (`make start` or `make setup`). It launches this app
in Expo's web preview mode alongside `db`/`backend`.

To run it standalone:

```bash
cd apps/city-hero
npm install
npx expo start --web    # browser preview, matches what `make mobile` runs
# or
npx expo start          # QR code for Expo Go on a physical device/simulator
```

Web preview: [http://localhost:8081](http://localhost:8081).

## Environment Variables

None required yet — this app doesn't call the backend at this stage. Once API integration is added,
follow the same pattern as [`apps/web`](../web/README.md) (`.env.sample` → copy → fill in).

## Scripts

```bash
npm run start      # expo start
npm run android      # expo start --android
npm run ios            # expo start --ios
npm run web              # expo start --web
```
