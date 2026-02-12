# Component Inventory

The canonical list of every shared UI component in CityHero, organized
by atomic-design tier. Each row points to the **screen tasks** that
consume it. This is the **single source of truth** for reuse —
implementations and task specs must match.

When a new shared component is needed, add a row here first, then
build it. When a screen-local component is used by 2+ screens, promote
it: move the file to the design system and update this inventory.

See [`design-system.md`](./design-system.md) for the rules.

## Tokens

| Token                       | Defined in                                               | Consumers                |
|-----------------------------|----------------------------------------------------------|--------------------------|
| `colors.brand` (50→900)     | `packages/design_system/src/tokens/colors.ts`            | All UI                   |
| `colors.civic` (purple/mint/sky/amber/rose) | same                                     | All UI                   |
| `colors.slate` (50→900)     | same                                                     | All UI                   |
| `colors.semantic` (success/warning/danger/info) | same                                  | All UI                   |
| `typography` (display/h1/h2/body/caption/micro) | `packages/design_system/src/tokens/typography.ts` | All UI                   |
| `spacing` (4dp grid)        | `packages/design_system/src/tokens/spacing.ts`           | All UI                   |
| `radius` (sm/md/lg/xl/full) | `packages/design_system/src/tokens/radius.ts`            | All UI                   |
| `shadow` (soft/md/lg)       | `packages/design_system/src/tokens/shadows.ts`           | All UI                   |
| `theme` (light/dark)        | `packages/design_system/src/tokens/theme.ts`             | All UI                   |

Foundation task: `00-foundation/02-design-tokens.md`.

## Atoms

| Atom                | Variants / props                                        | Used by                                                  |
|---------------------|---------------------------------------------------------|----------------------------------------------------------|
| `Button`            | primary, secondary, ghost, destructive · sm/md/lg       | Every screen with a primary action                       |
| `IconButton`        | filled, ghost · sizes                                   | Headers, overflow menus, hero overlays                   |
| `Badge`             | **see Badge section below**                             | Every label-shaped surface (status, category, AI %, anonymization, XP/medal, kickers, filter chips, anonymous indicator) |
| `Switch`            | on/off, locked (e.g., critical alerts)                  | 06 filters, 28 settings                                  |
| `Avatar`            | initial / 🥷 anonymous / image · sizes                  | Feed card, profile, leaderboard, comments               |
| `AvatarStack`       | 1-5 visible avatars + "+N" overflow                     | 13/14 comments tag rows, leaderboard previews            |
| `TextInput`         | default, search, multi-line, with counter               | Search overlays, NPS comment, irregularity form         |
| `OptionalTextInput` | Multi-line + char counter + profanity hint              | 10 description, 15 NPS comment                          |
| `Skeleton`          | row, card, list, grid                                   | Every screen during loading                              |
| `Spinner`           | small, medium, overlay                                  | In-flight states everywhere                              |
| `Toast`             | success, info, warning, error                           | Most actions across the app                              |
| `Banner`            | info, warning, gradient (alert)                         | 06 offline, 18 connectivity, 09 IA uncertainty           |
| `ProgressBar`       | brand color, with optional label                        | Photo upload, NPS submit, XP, work progress             |
| `Divider`           | thin, section                                           | Section separation                                       |
| `Text`              | variant=display/h1/h2/body/caption/micro                | All UI                                                   |
| `Pressable`         | scale animation, haptic                                 | Cards and rows across screens                            |
| `Box` / `Stack`     | layout primitives                                       | All UI                                                   |

### `Badge` (canonical container)

`Badge` is the **single atom** that every "label-shaped surface"
reuses (status pills, category chips, confidence scores, anonymization
indicators, XP/medal celebration pills, "ANONIMIZAÇÃO ATIVA" pulsing
pills, anonymous indicators, kickers, filter chips, etc.). The pattern
follows libraries like Ant Design and React Bootstrap: simple visual
props, with **children** carrying the actual content (text, icons,
dots, links).

**Props (simple):**

- `color`: `brand` · `success` · `warning` · `danger` · `info` · `neutral` · `gradient-*` · any token color name
- `size`: `xs` · `sm` · `md` · `lg`
- `variant`: `filled` · `outline` · `ghost`
- `radius`: `sm` · `md` · `full` (default — pill)
- `pulse?`: boolean — subtle pulsing animation (respects `prefers-reduced-motion`)
- `onPress?`: when set, the badge becomes pressable with haptics (interactive chips inside `FilterChipRow`)
- `selected?`: visual selected state for interactive chips

**Children-first composition:**

The badge renders whatever you put inside: text, emoji + text, dot +
text, link, avatar + text. There is **no `kind` prop** — the API stays
tiny and composition does the rest. Reference patterns:
[Ant Design Badge](https://ant.design/components/badge) and
[React Bootstrap Badge](https://react-bootstrap.netlify.app/docs/components/badge).

**Concepts that were standalone components and now compose `Badge`:**

| Concept                          | Composition                                                                            | Used by         |
|----------------------------------|----------------------------------------------------------------------------------------|-----------------|
| Status pill (EM ANDAMENTO etc.)  | `<Badge color="warning"><PulsingDot /> EM ANDAMENTO</Badge>`                            | 06, 13, 14, 26  |
| Category chip                    | `<Badge color={category.color}>{emoji} {label}</Badge>`                                | Feed, hero      |
| Confidence (AI %)                | `<Badge color="semantic" size="sm">85% Buraco</Badge>`                                  | 08, 10, 13      |
| Anonymization active             | `<Badge color="brand" pulse><Dot /> ANONIMIZAÇÃO ATIVA</Badge>`                          | 08 camera       |
| Anonymization result             | `<Badge color="info" size="sm">2 placas · 0 rostos</Badge>`                             | 10, 13, 14      |
| XP / medal pill                  | `<Badge color="gradient-violet"><Icon name="bolt" /> +50 XP · Vigia Noturno</Badge>`     | 10, 11, 12, 28  |
| Filter chip                      | `<Badge size="md" selected={isActive} onPress={pick}>{label}</Badge>` inside `FilterChipRow` | 06, 07, 16, 19, 21, 22, 26, 29 |
| Kicker label ("FEED", "REPORTE") | `<Badge size="xs" variant="ghost" color="neutral">FEED</Badge>`                          | Headers          |
| Anonymous indicator              | `<Badge color="brand" size="sm">🥷 Anônimo</Badge>`                                      | Feed cards, rows |

**Rule (binding):** if you find yourself defining `XYZBadge` or
`XYZPill` in a screen folder, **stop** and compose `Badge` with the
right children instead. Promote to a named higher-tier component
*only* when 3+ identical compositions repeat verbatim — and even then,
the new component is a thin convenience wrapper that still uses
`Badge` internally. This is a direct application of the reuse
principle: one container, infinite compositions.

## Molecules

| Molecule                  | Purpose                                                            | Used by (screens)                                |
|---------------------------|--------------------------------------------------------------------|--------------------------------------------------|
| `FilterChipRow`           | Horizontal row of `Badge`s with sticky behavior, active state, and tap callback | 06, 07, 16, 19, 21, 22, 26, 29       |
| `RadiusPickerSheet`       | Bottom sheet picker for radius (1/2/5/10 km)                      | 07                                               |
| `StatsRow`                | 3-4 cell stat group                                                | 13, 14, 28                                       |
| `KpiCard` / `KpiStrip`    | Single KPI card + horizontal strip                                 | 16, 20, 22                                       |
| `EmptyState`              | Illustration + headline + body + optional CTA · variants           | 16, 19, 21, 22, 25, 26                          |
| `XpProgressBar`           | Animated XP bar + counter                                          | 10 preview, 12 hero, 28 hero                    |
| `LaiExplainerSheet`       | LAI/Lei 12.527 explainer bottom sheet                              | 10, 11, 24                                       |
| `PaginationDots`          | Onboarding step dots                                               | 03, 04, 05                                       |
| `StepIndicator`           | "Passo N de M" indicator (used in onboarding + irregularity flow)  | 02, 03, 04, 05, 24                              |
| `ShareButton`             | Standard share icon + tap handler that invokes the share service   | All detail screens, profile, achievements       |
| `Toggle` (Identification) | Anônima vs Identificada tile pair                                  | 10, 24                                           |
| `MapPinIcon`              | Drop-shape pin with category emoji + status overlay                | 06, 26                                           |
| `RecenterButton`          | Floating button → recenter map                                     | 06, 26                                          |
| `StickyBottomCta`         | Sticky bar template + slot for one or two buttons                  | 09, 10, 11, 12, 13, 14, 15, 17, 18, 23, 24, 27 |

> **Consolidated into `Badge` (atom):** `StatusBadge`, `CategoryChip`,
> `ConfidenceBadge`, `AnonymizationBadge`, `XpMedalPill`, plus the old
> `Pill` and `Chip` atoms, are no longer standalone components. Every
> one of them is a `<Badge>` composition with children. See the Badge
> section in the Atoms table above.

## Organisms

| Organism                  | Purpose                                                            | Used by (screens)                                |
|---------------------------|--------------------------------------------------------------------|--------------------------------------------------|
| `BottomNav`               | 4 tabs + center FAB + More sheet                                   | All root screens (06, 07, 16, 28)                |
| `FeedCard`                | Compact report card (identified + anonymous variants)              | 07, 11 (preview), 16 (variant)                  |
| `OverflowMenu`            | ⋯ button → bottom sheet with actions per role                      | 13, 14, 17, 27                                  |
| `DetailHero`              | Photo hero + status chips + age pill + back/⋯ overlays             | 13, 14, 27                                       |
| `BeforeAfterSlider`       | Interactive antes/depois with drag handle                          | 14 detail, 15 NPS hero                          |
| `TimelineCard`            | Vertical timeline with state-colored dots + entries                | 13, 14, 27 (work milestones)                    |
| `TimelineEntry`           | Single timeline row with optional SLA pill + detail sheet           | Used inside TimelineCard                         |
| `CommentsSection`         | Tag-based moderated comments with avatar stack + XP pill           | 13, 14, 17                                       |
| `CategoryGrid`            | 3×3 grid of category tiles with "Outro" secondary                  | 09, 10                                           |
| `OtherCategorySheet`      | Bottom sheet for secondary categories                              | 09, 10                                           |
| `PhotoPreview`            | Photo viewer with anonymization state overlay                       | 10 confirm, 13/14 hero                          |
| `ShareSheet` (custom)     | App-styled share invocation with channel chips (when needed)        | 12 league (channels row)                        |
| `MoreTagsSheet`           | Bottom sheet with full tag catalog (for comments + NPS reasons)    | 13, 14, 15, 17                                  |
| `ReasonChip`              | Tag chip with selected state + check badge                          | 13/14 comments, 15 NPS reasons                  |
| `CelebrationHero`         | Gradient hero with XP/medal celebration + confetti                  | 11 (violet variant), 12 (emerald variant), 15  |
| `ConfettiBackground`      | Decorative SVG confetti respecting reduced-motion                   | Used by CelebrationHero                          |
| `BadgeIllustration`       | Animated medal/badge illustration                                  | 04 onboarding, 29 detail                        |
| `MedalCard`               | Medal card (locked/in-progress/unlocked variants)                  | 28 carousel, 29 grid                            |
| `LeaderboardRow`          | Position + avatar + name + level + XP + delta                      | 30 (leaderboard, podium and pelotão)            |
| `SearchOverlay`           | Standard full-screen search modal (input + results + recent)       | 07 feed, 25 services                            |
| `PendingOfflineCard`      | Highlighted card showing offline queue items + CTA                 | 06 home, 16 my reports                          |

## Templates

| Template            | Purpose                                                              | Used by (screens)                                                |
|---------------------|----------------------------------------------------------------------|------------------------------------------------------------------|
| `DetailShell`       | Header + scroll container + sticky bottom CTA + sticky-on-scroll header + slot system | 13, 14, 17, 23, 27                                   |
| `ScreenContainer`   | Standard screen frame: status bar variant + safe areas + optional bottom nav | Every screen that's not a modal                                |
| `WizardShell`       | Multi-step shell with step indicator + step CTA bar + step routing  | 24 (5 steps), the onboarding triplet                            |
| `ModalShell`        | Full-screen modal presentation with back gesture + status bar handling | 08 camera, 09 manual report, 24 wizard                         |

## Hooks (logic-only, in `packages/design_system/src/hooks/` or per-screen)

| Hook                       | Purpose                                                            | Used by (screens)                                |
|----------------------------|--------------------------------------------------------------------|--------------------------------------------------|
| `useTheme`                 | Read tokens / theme                                                 | All UI                                           |
| `useReducedMotion`         | Respect `prefers-reduced-motion`                                    | All animated components                         |
| `useStatusBarVariant`      | Apply status bar style on focus                                     | All screens                                      |
| `useSafeAreaInsets`        | Safe area for layout                                                | All screens                                      |
| `useSwipeable`             | Swipe-to-dismiss gestures                                           | Cards, sheets                                    |
| `usePopover`               | Popover positioning                                                  | Tooltips                                         |
| `useFocusTrap`             | Focus management in modals                                          | Modals, sheets                                   |
| `useShare`                 | Share orchestration via shared service                              | 07, 11, 12, 13, 14, 20, 22, 27, 28              |
| `useSupportToggle`         | Apoiar action with optimistic + offline                              | 06, 07, 13, 14                                   |
| `useTagToggle`             | Mark/unmark tag on a report                                          | 13, 14                                           |
| `useToggleAnonymity`       | Flip a report's anonymous flag                                       | 11, 13, 14, 16                                   |
| `useAnonymizationStatus`   | Poll anonymization status of a photo                                 | 08, 10, 11, 14                                   |

## Cross-cutting components

Not strictly UI but used everywhere:

| Component / Service        | Lives in                                                            | Used by                                          |
|----------------------------|---------------------------------------------------------------------|--------------------------------------------------|
| `ErrorBoundary`            | `packages/design_system/src/components/ErrorBoundary/`               | App root + per-route subtrees                   |
| `Sentry` integration       | `packages/observability/`                                            | All apps                                          |
| API client                 | `packages/api_client/`                                               | All screens with backend calls                  |
| i18n helpers               | `packages/i18n/`                                                     | All UI                                            |
| Map wrapper                | `packages/design_system/src/organisms/Map/` (foundation 10)         | 06, 09, 20, 26                                   |
| Analytics tracker          | `packages/analytics/`                                                | All UI                                            |

## How to update this document

When you add or promote a component:

1. Add a row to the appropriate table here.
2. Reference this doc in the component's task's `Standards & References`.
3. Reference the affected screens that now consume it.

When a component becomes obsolete:

1. Remove the row.
2. Search the repo for the import and replace with the new equivalent.
3. Delete the component file.

This document is **load-bearing** for the codebase's coherence — keep
it accurate.
