# Design System Foundation · Tokens + Storybook + atomic structure

> **Type:** Foundation · Design system
> **Screen(s):** All UI
> **Effort:** M (1-2 days)
> **Dependencies:** `00-foundation/01-monorepo-setup.md`
> **Status:** 🟡 Mostly done — lint rules (color/spacing literals) and visual regression (Chromatic dropped, Playwright TBD) still open
> **Labels:** `design-system`, `foundation`, `frontend`, `tokens`, `storybook`

## Context

The **foundation of the entire UI**. Sets up the `packages/design_system`
package with: (1) tokens (colors, typography, spacing, radii, shadows,
themes), (2) atomic folder structure (atoms, molecules, organisms,
templates, hooks), (3) Storybook configured for both web and mobile, (4)
Tailwind preset for the Next.js admin, (5) the theme provider for
React Native, and (6) the public API (`index.ts`) that re-exports
everything consumed by `apps/city-hero` and `apps/web`.

This is the **prerequisite for every UI task** in the project — every
shared component lives here per [`design-system.md`](../../engineering/design-system.md).

## User Story

**As a** Frontend Developer,
**I want** a fully-set-up design-system package with tokens, atomic
folders, Storybook, and theme provider,
**In order to** start building any UI component knowing exactly where it
lives, how it's themed, and how its variants are documented visually.

## Acceptance Criteria

### Scenario · Tokens available

**Given** a developer is building a screen
**When** they import the design system package
**Then** they can access brand, civic, slate, semantic color scales; typography variants (display, h1, h2, body, body-bold, caption, micro); spacing scale (xs..4xl on 4dp grid); radii (sm, md, lg, xl, full); shadows (soft, md, lg)
**And** every color in the prototype maps to a token (no hex literals in screen code)

### Scenario · Atomic folder structure

**Given** the package is scaffolded
**When** a developer adds a new component
**Then** the location matches its tier per [`design-system.md`](../../engineering/design-system.md):

- `src/tokens/` for design primitives
- `src/atoms/` for primitives (Button, Pill, Chip, Switch, etc.)
- `src/molecules/` for compositions (FilterChipRow, EmptyState, etc.)
- `src/organisms/` for complex composites (FeedCard, BottomNav, etc.)
- `src/templates/` for page-shell shells (DetailShell, ScreenContainer)
- `src/hooks/` for behavior hooks (useTheme, useReducedMotion, useSwipeable)
- `index.ts` re-exports the public API

### Scenario · Storybook for the package

**Given** the package is set up
**When** the developer runs the Storybook script
**Then** Storybook starts and displays all components grouped by tier
**And** controls (args) let interactive props be tweaked
**And** the `@storybook/addon-a11y` panel runs automatic accessibility checks
**And** a viewport addon shows components at common screen sizes (375×667, 414×896, tablet)

### Scenario · React Native + Storybook integration

**Given** the design system targets React Native primarily
**When** Storybook builds the stories
**Then** components render correctly in `react-native-web` (so Storybook runs in the browser)
**And** mobile-only APIs (e.g., haptics, gestures) are mocked or graceful no-ops in Storybook

### Scenario · Theme provider

**Given** a screen uses the design system
**When** the app boots
**Then** a `ThemeProvider` at the root provides the active theme (light or dark) via context
**And** components read tokens via the `useTheme()` hook
**And** changing the system color scheme triggers a re-render

### Scenario · Tailwind preset for web

**Given** the Next.js admin app uses Tailwind
**When** its `tailwind.config.ts` imports the design-system preset
**Then** the preset exposes the same tokens as Tailwind classes (e.g., `bg-brand-500`, `text-slate-900`, `rounded-lg`)
**And** the tokens are the **single source of truth** — mobile and web stay in sync

### Scenario · Lint rules block ad-hoc styling

**Given** a developer accidentally uses a hex color in a screen file
**When** ESLint runs
**Then** the violation is reported (rule: no-color-literals in `*.tsx` outside `tokens/`)
**And** the same rule blocks spacing literals in JSX `style` props

### Scenario · Public API exports

**Given** a screen imports a component
**When** the import line is written
**Then** the path is the package root (`import { Button } from '@cityhero/design-system'`)
**And** never an internal path (`import { Button } from '@cityhero/design-system/src/atoms/Button/Button'` is blocked by ESLint)

### Scenario · Chromatic visual regression

**Given** the CI pipeline is set up
**When** a PR touches design-system files
**Then** Chromatic (or equivalent) takes snapshots of all stories
**And** unintended visual diffs are flagged for review

### Scenario · Storybook entry on Definition of Done

**Given** any task that adds a shared component
**When** the DoD is reviewed
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

- **Colors**: `brand.50–900`, `civic.{purple,mint,sky,amber,rose}`, `slate.50–900`, `semantic.{success,warning,danger,info}`.
- **Typography**: `display`, `h1`, `h2`, `body`, `bodyBold`, `caption`, `micro` (Plus Jakarta Sans).
- **Spacing**: `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `2xl=32`, `3xl=48`, `4xl=64`.
- **Radius**: `sm=6`, `md=12`, `lg=16`, `xl=24`, `full=9999`.
- **Shadow**: `soft`, `md`, `lg` (with iOS + Android variants).
- **Themes**: `light`, `dark` — brand colors constant across both.

## Frontend

### Tailwind integration

`packages/design_system/tailwind.preset.js` exports a preset that
`apps/web/tailwind.config.ts` extends. Tokens are read from
`src/tokens/*` so there's one source of truth across web and mobile.

### React Native integration

`packages/design_system/src/theme/ThemeProvider.tsx` wraps `apps/city-hero`
and exposes tokens via context. Components consume via `useTheme()`.

### Storybook

`.storybook/main.ts` configures:

- Framework: `@storybook/react-native-web` (or `@storybook/react` if the team prefers a web-only viewer).
- Addons: `essentials`, `a11y`, `viewport`, `interactions`, `controls`, `docs`.
- Stories pattern: `src/**/*.stories.tsx`.

`.storybook/preview.tsx` wraps every story with the `ThemeProvider` and
exposes a toolbar control to flip between light/dark themes.

### Lint rules

ESLint plugin `eslint-plugin-no-color-literals` plus a custom rule for
spacing literals. The rule allowlist exempts `src/tokens/`.

A separate rule blocks deep imports into the package (
`@cityhero/design-system/src/...` is disallowed; only the root re-export
is allowed).

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **System theme changes mid-session**: `useColorScheme()` triggers a re-render of themed components.
- **User overrides system theme**: persisted in `AsyncStorage`.
- **Plus Jakarta Sans not loaded**: fallback to system sans-serif while loading.
- **Web + mobile token drift**: a CI step ensures both consume the same token version.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                    | When               | Props           |
| ------------------------ | ------------------ | --------------- |
| `theme.changed_to_dark`  | User toggles dark  | `source: system | manual` |
| `theme.changed_to_light` | User toggles light | `source: system | manual` |

## Tests

- **Unit**: token snapshots for stability (any token change → visible diff).
- **Lint**: ESLint catches color and spacing literals; lint blocks deep imports.
- **Visual regression**: Storybook + Chromatic for token preview page and a sample of every atom.
- **Theme provider**: components render correctly under both light and dark.

## Definition of Done

- [x] `packages/design_system/` scaffolded with the canonical folder structure
- [x] All token files (colors, typography, spacing, radius, shadows, theme) — colors/shadow/font ported from `design/` prototype values, typography/shadow md+lg are first-pass (not yet validated against real screen designs)
- [x] `ThemeProvider` + `useTheme` hook (+ `useReducedMotion`)
- [x] Tailwind preset exposed and consumed by `apps/web` — via a shared `tailwind.preset.js` loaded through Tailwind v4's `@config` compatibility directive (not a CSS-only `@theme` block: NativeWind's stable 4.x line still needs a JS preset, so one file serves both platforms)
- [x] Storybook running with addons (a11y, docs; essentials/viewport/interactions/controls are core in Storybook v9+, no separate install needed)
- [x] `.storybook/preview.tsx` wraps stories with `ThemeProvider` + theme toggle
- [ ] Lint rules enforced (no color literals, no spacing literals, no deep imports) — deferred: `eslint-plugin-no-color-literals` named in this spec no longer exists on npm; needs either a different plugin or a custom rule, out of scope for this pass
- [x] `index.ts` re-exports the public API
- [x] Light + dark themes complete
- [ ] CI step: token snapshot, Chromatic on every PR — **Chromatic explicitly dropped** (solo project, no second reviewer to approve visual diffs in an external SaaS); Playwright screenshot testing was chosen as the local alternative but not yet implemented — follow-up
- [x] Documentation in Storybook (Docs page) explaining how to add a new component — see the `Tokens/Overview` story's docs description
- [x] All existing references in task specs match the structure here

**Also done, not originally listed:** NativeWind wired into `apps/city-hero` (babel/metro/tailwind config, root layout wrapped in `ThemeProvider`) so RN screens style via the same `className` API as the web app — added after scoping discussion, since the original spec assumed StyleSheet-only theming for native.

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
- Chromatic: https://www.chromatic.com/

### Project context

- Prototype: `design/index.html` (Tailwind config and CSS variables)
- `CLAUDE.md`
