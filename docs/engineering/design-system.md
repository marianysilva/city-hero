# Design System

The single source of truth for **how the UI is composed**. Every shared
component lives in `packages/design_system`, has a Storybook story, and
is consumed by screens through composition. This document defines the
tiers, location rules, naming conventions, and React patterns that
keep the codebase consistent.

When a task spec contradicts this document, the document wins.

## Atomic design tiers

We use a five-tier mental model:

| Tier      | Examples                                        | Lives in                                      |
|-----------|-------------------------------------------------|------------------------------------------------|
| Tokens    | Colors, typography, spacing, radii, shadows     | `packages/design_system/src/tokens/`           |
| Atoms     | Button, IconButton, Pill, Chip, Skeleton, Toast, Switch, Avatar, TextInput, ProgressBar | `packages/design_system/src/atoms/`            |
| Molecules | FilterChipRow, StatsRow, StatusBadge, EmptyState, KpiCard, ConfidenceBadge, XpProgressBar, XpMedalPill, AvatarStack, AnonymizationBadge, LaiExplainerSheet | `packages/design_system/src/molecules/`        |
| Organisms | FeedCard, BottomNav, OverflowMenu, TimelineCard, DetailHero, BeforeAfterSlider, CategoryGrid, ShareSheet | `packages/design_system/src/organisms/`        |
| Templates | DetailShell, EmptyScreen, ScreenContainer (header + scroll + bottom CTA shells) | `packages/design_system/src/templates/`        |
| Screens   | HomeScreen, FeedCivicoScreen, CitizenProfileScreen, etc. — concrete screens compose templates + organisms | `apps/mobile/src/screens/<Screen>/`            |

**The rule:** if a UI piece is used by **two or more screens** (or
could plausibly be), it lives in the design system at the appropriate
tier. Screen folders hold only the screen-specific composition + any
truly one-off subcomponents.

## Hard rules

1. **No UI primitive in screen folders.** Buttons, chips, badges,
   sheets, modals, switches — all live in `packages/design_system/src/atoms/`
   or `/molecules/`. Screen folders may compose them but never define them.

2. **Every shared component has a Storybook story.** No exceptions.
   Stories live next to the component (`Button.stories.tsx`) and cover
   all variants, states (default, hover, focus, disabled, loading,
   error), and edge cases (empty state, long content, RTL where
   applicable). Stories are part of the component's Definition of Done.

3. **Components don't fetch data.** Atoms, molecules, and organisms
   receive everything via props. Data fetching happens in custom
   hooks inside screen folders. This makes components trivially
   reusable across screens with different data sources.

4. **Components don't know about navigation.** They emit events
   (`onPress`, `onShareIntent`, etc.); screens decide what happens.

5. **Components don't know about i18n directly.** They accept already-
   translated strings or `i18n keys` that they hand to the i18n hook.
   For most molecules and atoms, accepting translated strings as props
   is simpler.

6. **Theme via tokens only.** No hex colors, no literal `padding: 12`.
   All styling references tokens.

## React patterns

### Composition over configuration

Prefer many small components composed than one big component with
twenty props. If a `Card` needs a `Card.Header`, `Card.Body`, and
`Card.Footer`, use **compound components** rather than a giant prop
API:

> `<Card>` exposes `Card.Header`, `Card.Body`, `Card.Footer` as
> static properties. Consumers compose them as children. The
> compound passes context internally if needed.

### Headless components for behavior

Behaviors with no inherent UI (focus traps, popover positioning,
gestures) ship as **headless hooks/components** in the design system.
Screens (or higher-tier components) wrap them with the desired visual
styling. Examples to follow: `useSwipeable`, `usePopover`,
`useFocusTrap`.

### Hooks for stateful logic

Logic separable from rendering goes into a hook. UI components
receive plain values/callbacks. This keeps components stateless and
trivially Storybook-able. Naming: `useXxx`.

### Variants via discriminated unions

A `Button` might be `variant: 'primary' | 'secondary' | 'ghost' | 'destructive'`.
Use discriminated unions rather than `boolean` flags
(`isPrimary && isSecondary` is an error state by construction).

### Polymorphic `as` prop for atoms

Atoms like `Box`, `Text`, `Pressable` accept an `as` prop so
consumers can render them as different elements (e.g., `<Box as="section">`).
This avoids creating duplicate atoms for trivial element changes.

### Forwarding refs

All atoms and molecules use `React.forwardRef` so callers can pass
refs through (e.g., for focus management, animation libraries).

### Memoization where it pays

Atoms are typically pure and don't need `React.memo`. Molecules and
organisms that render in long lists should be wrapped with
`React.memo` and stable callbacks. The lint config flags missing
`useCallback` in hot rendering paths.

## Storybook setup

Stories live next to the component. Each story file should include:

- **Default** story showing the most common usage.
- **Variants** for each `variant` prop value.
- **States** (loading, error, empty, disabled, success).
- **Edge cases** (long text, very small viewport, anonymous variant for
  identity-related components).
- **Interactive controls** (Storybook args) so designers and PMs can
  manipulate props in the browser.
- **Accessibility checks** via the `@storybook/addon-a11y` panel.

Visual regression: Chromatic (or equivalent) catches unintended
visual changes on every PR. Snapshots cover all variants.

## Naming conventions

- **Component files**: `PascalCase.tsx` (e.g., `Button.tsx`,
  `FeedCard.tsx`). Story: `PascalCase.stories.tsx`. Test:
  `PascalCase.test.tsx`. Types: `PascalCase.types.ts` (or inline).
- **Hooks**: `useXxx.ts` (e.g., `useReports.ts`,
  `useSwipeable.ts`).
- **Folders**: each component gets its own folder when it has
  siblings (story, test, types). Single-file components are fine
  for very small atoms.

## Folder structure (canonical)

```
packages/design_system/
├── package.json
└── src/
    ├── tokens/                  # colors, typography, spacing, radii, shadows, theme
    ├── atoms/                   # Button, Pill, Chip, Switch, Avatar, TextInput, ...
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   ├── Button.stories.tsx
    │   │   ├── Button.test.tsx
    │   │   └── Button.types.ts
    │   └── ...
    ├── molecules/               # FilterChipRow, StatsRow, StatusBadge, EmptyState, ...
    ├── organisms/               # FeedCard, BottomNav, OverflowMenu, TimelineCard, ...
    ├── templates/               # DetailShell, ScreenContainer, ...
    ├── theme/
    │   ├── ThemeProvider.tsx
    │   └── useTheme.ts
    └── index.ts                 # public re-exports
```

## Imports from screens

```
// good:
import { Button, FeedCard, DetailShell } from '@cityhero/design-system';

// bad — don't reach into internal paths:
import { Button } from '@cityhero/design-system/src/atoms/Button/Button';
```

The package's `index.ts` re-exports everything that's public.

## When to promote a screen-local component to the design system

If a component is **used by 2+ screens or planned to be**, it must
be in the design system. To promote:

1. Move the component file(s) to the appropriate tier.
2. Add a Storybook story.
3. Generalize props (remove screen-specific assumptions).
4. Re-export from `packages/design_system/src/index.ts`.
5. Update consumers to import from the package.
6. Delete the original file from the screen folder.

This should happen as soon as the second screen wants the same
piece — don't wait until duplication accumulates.

## How task specs reference this doc

Every task spec's `Standards & References` section references this
doc when its scope touches UI components. Conflicts between a task's
"Where it lives" section and this doc are resolved in favor of this
doc, and the task should be updated.

See [`component-inventory.md`](./component-inventory.md) for the
canonical list of all shared components by tier and their consumers.

## References

- Atomic Design (Brad Frost): https://atomicdesign.bradfrost.com/
- React composition patterns: https://react.dev/learn/passing-data-deeply-with-context
- Headless UI principles: https://headlessui.com/
- Storybook: https://storybook.js.org/
- Chromatic visual regression: https://www.chromatic.com/
