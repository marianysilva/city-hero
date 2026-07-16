# Design System Foundation · Tokens + Storybook + atomic structure

> **Type:** Foundation · Design system\
> **Screen(s):** All UI\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/01-monorepo-setup.md`\
> **Status:** ✅ Done\
> **Labels:** `design-system`, `foundation`, `frontend`, `tokens`, `storybook`

## Context

The **foundation of the entire UI**. Sets up the `packages/design_system` package with: (1) tokens
(colors, typography, spacing, radii, shadows, themes), (2) atomic folder structure (atoms,
molecules, organisms, templates, hooks), (3) Storybook configured for both web and mobile, (4)
Tailwind preset for the Next.js admin, (5) the theme provider for React Native, and (6) the public
API (`index.ts`) that re-exports everything consumed by `apps/city-hero` and `apps/web`.

This is the **prerequisite for every UI task** in the project — every shared component lives here
per [`design-system.md`](../../engineering/design-system.md).

## User Story

**As a** Frontend Developer,\
**I want** a fully-set-up design-system package with tokens, atomic folders, Storybook, and theme
provider,\
**In order to** start building any UI component knowing exactly where it lives, how it's themed, and
how its variants are documented visually.

## Acceptance Criteria

### Scenario · Tokens available

**Given** a developer is building a screen\
**When** they import the design system package\
**Then** they can access brand, civic, slate, semantic color scales; typography variants (display,
h1, h2, body, body-bold, caption, micro); spacing scale (xs..4xl on 4dp grid); radii (sm, md, lg,
xl, full); shadows (soft, md, lg)\
**And** every color in the prototype maps to a token (no hex literals in screen code)

### Scenario · Atomic folder structure

**Given** the package is scaffolded\
**When** a developer adds a new component\
**Then** the location matches its tier per [`design-system.md`](../../engineering/design-system.md):

- `src/tokens/` for design primitives
- `src/atoms/` for primitives (Button, Pill, Chip, Switch, etc.)
- `src/molecules/` for compositions (FilterChipRow, EmptyState, etc.)
- `src/organisms/` for complex composites (FeedCard, BottomNav, etc.)
- `src/templates/` for page-shell shells (DetailShell, ScreenContainer)
- `src/hooks/` for behavior hooks (useTheme, useReducedMotion, useSwipeable)
- `index.ts` re-exports the public API

### Scenario · Storybook for the package

**Given** the package is set up\
**When** the developer runs the Storybook script\
**Then** Storybook starts and displays all components grouped by tier\
**And** controls (args) let interactive props be tweaked\
**And** the `@storybook/addon-a11y` panel runs automatic accessibility checks\
**And** a viewport addon shows components at common screen sizes (375×667, 414×896, tablet)

### Scenario · React Native + Storybook integration

**Given** the design system targets React Native primarily\
**When** Storybook builds the stories\
**Then** components render correctly in `react-native-web` (so Storybook runs in the browser)\
**And** mobile-only APIs (e.g., haptics, gestures) are mocked or graceful no-ops in Storybook

### Scenario · Theme provider

**Given** a screen uses the design system\
**When** the app boots\
**Then** a `ThemeProvider` at the root provides the active theme (light or dark) via context\
**And** components read tokens via the `useTheme()` hook\
**And** changing the system color scheme triggers a re-render

### Scenario · Tailwind preset for web

**Given** the Next.js admin app uses Tailwind\
**When** its `tailwind.config.ts` imports the design-system preset\
**Then** the preset exposes the same tokens as Tailwind classes (e.g., `bg-brand-500`,
`text-slate-900`, `rounded-lg`)\
**And** the tokens are the **single source of truth** — mobile and web stay in sync

### Scenario · Lint rules block ad-hoc styling

**Given** a developer accidentally uses a hex color in a screen file\
**When** ESLint runs\
**Then** the violation is reported (rule: no-color-literals in `*.tsx` outside `tokens/`)\
**And** the same rule blocks spacing literals in JSX `style` props

### Scenario · Public API exports

**Given** a screen imports a component\
**When** the import line is written\
**Then** the path is the package root (`import { Button } from '@city-hero/design-system'`)\
**And** never an internal path
(`import { Button } from '@city-hero/design-system/src/atoms/Button/Button'` is blocked by ESLint)

### Scenario · Playwright visual regression

**Given** the CI pipeline is set up\
**When** a PR touches design-system files\
**Then** a Playwright Test spec takes `expect(page).toHaveScreenshot()` snapshots of all stories via
their built Storybook `iframe.html?id=...` URLs\
**And** unintended visual diffs are flagged for review

### Scenario · Storybook entry on Definition of Done

**Given** any task that adds a shared component\
**When** the DoD is reviewed\
**Then** a Storybook story file is required and verified by CI

## Output structure

```
packages/design_system/
├── package.json
├── tsconfig.json
├── tailwind.preset.js
├── .storybook/
│   ├── main.ts
│   ├── preview.tsx
│   └── theme.ts
└── src/
    ├── tokens/
    │   ├── colors.ts
    │   ├── typography.ts
    │   ├── spacing.ts
    │   ├── radius.ts
    │   ├── shadows.ts
    │   ├── theme.ts
    │   └── index.ts
    ├── atoms/
    │   └── (one folder per atom — see component-inventory.md)
    ├── molecules/
    ├── organisms/
    ├── templates/
    ├── hooks/
    │   ├── useTheme.ts
    │   └── useReducedMotion.ts
    ├── theme/
    │   ├── ThemeProvider.tsx
    │   ├── lightTheme.ts
    │   └── darkTheme.ts
    └── index.ts                # public re-exports
```

## Tokens catalog (conceptual summary)

- **Colors**: `brand.50–900`, `civic.{purple,mint,sky,amber,rose}`, `slate.50–900`,
  `semantic.{success,warning,danger,info}`.
- **Typography**: `display`, `h1`, `h2`, `body`, `bodyBold`, `caption`, `micro` (Plus Jakarta Sans).
- **Spacing**: `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `2xl=32`, `3xl=48`, `4xl=64`.
- **Radius**: `sm=6`, `md=12`, `lg=16`, `xl=24`, `full=9999`.
- **Shadow**: `soft`, `md`, `lg` (with iOS + Android variants).
- **Themes**: `light`, `dark` — brand colors constant across both.

## Frontend

### Tailwind integration

`packages/design_system/tailwind.preset.js` exports a preset that `apps/web/tailwind.config.ts`
extends. Tokens are read from `src/tokens/*` so there's one source of truth across web and mobile.

### React Native integration

`packages/design_system/src/theme/ThemeProvider.tsx` wraps `apps/city-hero` and exposes tokens via
context. Components consume via `useTheme()`.

### Storybook

`.storybook/main.ts` configures:

- Framework: `@storybook/react-native-web` (or `@storybook/react` if the team prefers a web-only
  viewer).
- Addons: `essentials`, `a11y`, `viewport`, `interactions`, `controls`, `docs`.
- Stories pattern: `src/**/*.stories.tsx`.

`.storybook/preview.tsx` wraps every story with the `ThemeProvider` and exposes a toolbar control to
flip between light/dark themes.

### Lint rules

`eslint-plugin-no-color-literals` (named in the original spec) no longer exists on npm. What's
actually wired up, in `packages/design_system/eslint.config.js`:

- **Color literals**: `eslint-plugin-react-native`'s `react-native/no-color-literals` — flags hex
  literal colors assigned inside a `StyleSheet.create()` call or directly inline in a JSX `style={}`
  attribute. It doesn't trace through intermediate lookup objects (e.g. a `VARIANT_COLORS` record
  built in a function body, then referenced by identifier inside `style=`) — that's a real, accepted
  gap given the rule's shallow AST analysis, not a config mistake; it still catches the common
  mistake the AC describes (`style={{ color: '#fff' }}` written directly in a screen file).
- **Spacing literals**: no published plugin covers this, so it's a small local rule —
  `packages/design_system/eslint-rules/no-spacing-literals.js` — flagging numeric literals assigned
  to `padding*`/`margin*`/`gap`/`rowGap`/`columnGap` properties.
- Both rules are scoped to `src/**/*.{ts,tsx}`, excluding `src/tokens/**`, `**/*.stories.tsx`, and
  `**/*.test.{ts,tsx}` (tokens _are_ the literals; stories/tests legitimately need concrete values).

### Deep-import blocking

Lives in the **shared** `eslint.config.base.js` (not the design-system package's own config) since
it has to apply wherever the package is _consumed_ — `apps/city-hero` and `apps/web` both extend
this file. `no-restricted-imports` blocks the `@city-hero/design-system/src/*` pattern; only the
root re-export is allowed.

## Backend

Not applicable — this task only produces a frontend package (tokens, theme provider, Storybook); it
has no server-side surface.

## Database

Not applicable — no persisted data; theme preference (light/dark override) is stored client-side in
`expo-sqlite/kv-store` (the SDK 56-recommended, sync-capable drop-in replacement for
`@react-native-async-storage/async-storage`), not in PostgreSQL.

## Edge Cases

- **System theme changes mid-session**: `useColorScheme()` triggers a re-render of themed
  components.
- **User overrides system theme**: persisted in `expo-sqlite/kv-store`.
- **Plus Jakarta Sans not loaded**: fallback to system sans-serif while loading.
- **Web + mobile token drift**: enforced by `apps/web/__tests__/tailwind-preset.test.ts`, which
  imports both `tailwind.preset.js` and the TS token modules and asserts they resolve to identical
  color values — a real assertion, not just a documented intention.

## Privacy / LGPD

Not applicable — tokens, theming, and Storybook carry no user or citizen data.

## Analytics

| Event                    | When               | Props           |
| ------------------------ | ------------------ | --------------- |
| `theme.changed_to_dark`  | User toggles dark  | `source: system | manual` |
| `theme.changed_to_light` | User toggles light | `source: system | manual` |

## Tests

- **Unit** (`packages/design_system/src/tokens/tokens.test.ts`, Vitest): snapshot tests for colors,
  typography, spacing, radius, shadows, and both resolved themes; an explicit assertion that `brand`
  colors are identical across light/dark (per the "brand identity is constant" rule in
  `design-system.md`).
- **Theme provider** (`packages/design_system/src/theme/ThemeProvider.test.tsx`, Vitest + Testing
  Library, `react-native` aliased to `react-native-web` for jsdom): resolves the correct theme for
  explicit `light`/`dark` preferences, both themes expose the same token shape, and `useTheme()`
  throws a clear error outside a provider.
- **Cross-app consumption** (`apps/web/__tests__/design-system.test.tsx`, Vitest): renders a real
  `Button` from `@city-hero/design-system` inside `ThemeProvider` in the Next.js app — proves the
  package actually works for both consumers, not just `apps/city-hero`.
- **Preset/token parity** (`apps/web/__tests__/tailwind-preset.test.ts`, Vitest): asserts
  `tailwind.preset.js`'s color values equal the TS token modules' — the "Web + mobile token drift"
  edge case above, as a real check instead of a documented intention.
- **Lint**: `react-native/no-color-literals` + the local `no-spacing-literals` rule catch literal
  colors/spacing outside `src/tokens/`; `no-restricted-imports` (shared config) blocks deep imports
  into the package from both consuming apps.
- **Visual regression** (`packages/design_system/tests/visual/stories.visual.spec.ts`, Playwright):
  reads the built Storybook's `storybook-static/index.json`, generates one test per story, navigates
  to each `iframe.html?id=...` URL, and asserts `expect(page).toHaveScreenshot()`. Baseline PNGs are
  committed under `tests/visual/stories.visual.spec.ts-snapshots/`; run `npm run build-storybook`
  before `npm run test:visual` (the Playwright config serves `storybook-static/` via `http-server`
  automatically). New stories are covered automatically — nothing to hand-maintain.

## Definition of Done

- [x] `packages/design_system/` scaffolded with the canonical folder structure
- [x] All token files (colors, typography, spacing, radius, shadows, theme) — colors/shadow/font
      ported from `design/` prototype values, typography/shadow md+lg are first-pass (not yet
      validated against real screen designs)
- [x] `ThemeProvider` + `useTheme` hook (+ `useReducedMotion`)
- [x] Tailwind preset exposed and consumed by `apps/web` — via a shared `tailwind.preset.js` loaded
      through Tailwind v4's `@config` compatibility directive. The installed `nativewind` is
      `^5.0.0-preview.4` (see `apps/city-hero/package.json`), and v5 itself supports both the
      CSS-first `@theme` block and a backward-compatible classic JS preset (loaded via
      `presets: [require("nativewind/preset"), ...]` in `apps/city-hero/tailwind.config.js`, with
      `apps/city-hero/global.css` pointing at it via `@config "./tailwind.config.js"`) — the
      JS-preset path was kept, not because v5 lacks `@theme` support, but so the token values live
      in one plain CommonJS module (`src/tokens/shared-values.js`) consumed as-is by both
      `apps/web`'s Tailwind v4 config and `apps/city-hero`'s NativeWind config, instead of
      duplicating them into two config languages
- [x] Storybook running with addons (a11y, docs; essentials/viewport/interactions/controls are core
      in Storybook v9+, no separate install needed)
- [x] `.storybook/preview.tsx` wraps stories with `ThemeProvider` + theme toggle
- [x] Lint rules enforced (no color literals, no spacing literals, no deep imports) — the originally
      named `eslint-plugin-no-color-literals` doesn't exist on npm; replaced with
      `eslint-plugin-react-native`'s `react-native/no-color-literals` plus a small local rule for
      spacing literals (see Frontend § Lint rules) and `no-restricted-imports` for deep imports
- [x] `index.ts` re-exports the public API
- [x] Light + dark themes complete
- [x] CI step: token snapshot + visual regression on every PR — Vitest for token/theme-provider unit
      tests, Playwright Test (`expect(page).toHaveScreenshot()`) for visual regression with 18
      committed baseline snapshots (see Tests)
- [x] Documentation in Storybook (Docs page) explaining how to add a new component — see the
      `Tokens/Overview` story's docs description
- [x] All existing references in task specs match the structure here

**Also done, not originally listed:**

- NativeWind wired into `apps/city-hero` (babel/metro/tailwind config, root layout wrapped in
  `ThemeProvider`) so RN screens style via the same `className` API as the web app — added after
  scoping discussion, since the original spec assumed StyleSheet-only theming for native.
- **Cross-app consistency** (both consuming apps, not just `apps/city-hero`):
  - `apps/web` got its own Vitest setup (`vitest.config.mts`, following Next.js's own current
    guide), plus two real tests — one rendering an actual `@city-hero/design-system` component
    inside `ThemeProvider`, one asserting the Tailwind preset and TS tokens stay numerically
    identical. `apps/web` previously had no unit-test runner at all (only `test:e2e` via
    Playwright).
  - `apps/city-hero` was missing two files its own `tsconfig.json` already listed in `include` —
    `nativewind-env.d.ts` and `expo-env.d.ts` — which meant `npx tsc --noEmit` failed on the
    `import "../global.css"` side-effect import (`TS2882`) before this task. Both are standard,
    framework-generated files (per NativeWind's and Expo's own docs) and are now committed; the app
    typechecks, lints, and tests (`jest`) cleanly.
  - Jest stays the test runner for `apps/city-hero` (RN-native, via `jest-expo` — no mature Vitest
    equivalent exists for native RN); Vitest is used for `packages/design_system` and `apps/web`
    since both render through `react-native-web` / plain web, which Vitest supports natively. This
    is a deliberate two-runner split by _platform_, not accidental tooling sprawl.

## Standards & References

### Cross-cutting standards

- **Design system rules**: `docs/engineering/design-system.md`
- **Component inventory**: `docs/engineering/component-inventory.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Atomic Design: https://atomicdesign.bradfrost.com/
- Tailwind presets: https://tailwindcss.com/docs/presets
- Storybook: https://storybook.js.org/
- Storybook + React Native Web: https://storybook.js.org/blog/storybook-for-react-native-web/
- Playwright Test visual comparisons (the chosen approach):
  https://playwright.dev/docs/test-snapshots
- `eslint-plugin-react-native` (`no-color-literals`):
  https://github.com/intellicode/eslint-plugin-react-native
- Vitest (unit tests in `packages/design_system` and `apps/web`): https://vitest.dev/
- Next.js + Vitest setup (the guide `apps/web/vitest.config.mts` follows):
  https://nextjs.org/docs/app/guides/testing/vitest
- NativeWind TypeScript setup (`nativewind-env.d.ts`):
  https://nativewind.dev/v5/getting-started/typescript
- Expo TypeScript setup (`expo-env.d.ts`): https://docs.expo.dev/guides/typescript/
- Local key-value cache — `expo-sqlite/kv-store`:
  https://docs.expo.dev/develop/user-interface/store-data/

### Project context

- Prototype: `design/index.html` (Tailwind config and CSS variables)
- `CLAUDE.md`
