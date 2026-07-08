# Detail · In Progress · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 13 · Detail · In Progress
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a tall photo hero with status chips at the bottom
(filled by task 02), a scrollable content area beneath the hero hosting
the summary card, timeline, and comments (tasks 03–05), and a sticky
bottom CTA bar with Apoiar + Compartilhar (task 06). The overflow menu
(task 07) is accessible from the top-right of the hero.

## User Story

**As a** Citizen tracking an open report,
**I want** a focused layout with the photo, the prefecture's progress, and clear actions,
**In order to** see what's happening and decide whether to amplify.

## Acceptance Criteria

### Scenario · Default render

**Given** the user navigates to a detail screen for an open ticket
**When** the screen renders
**Then** the status bar variant is `dark` initially (with a light fallback over the photo hero)
**And** the photo hero slot is reserved at the top
**And** a back button overlays the top-left of the hero
**And** an overflow ⋯ button overlays the top-right
**And** below the hero, a scrollable area hosts the slots for tasks 03–05
**And** a sticky bottom CTA bar reserves space for task 06

### Scenario · Sticky behavior

**Given** the user scrolls
**When** the photo hero scrolls off the top
**Then** a compact sticky header replaces it with the back button, category emoji, status pill, and overflow ⋯
**And** the sticky header has a subtle shadow to separate from the content
**And** the bottom CTA bar remains pinned

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** other tasks plug in
**Then** the named slots are: `hero`, `sticky-header`, `summary`, `timeline`, `comments`, `bottom-cta`, `overflow-menu`
**And** the slots are referenced consistently by tasks 02–07

### Scenario · Theming

**Given** the user is in dark mode
**When** the screen renders
**Then** the page background adapts tonally (slate-900 instead of slate-50)
**And** the cards within use dark surface tokens
**And** the hero photo's overlay gradients remain readable

### Scenario · Safe areas

**Given** any device
**When** the screen renders
**Then** the hero respects the top safe area inset (the back/overflow buttons sit below the inset)
**And** the bottom CTA bar respects the bottom safe area inset

### Scenario · Back navigation

**Given** the user taps the back button
**When** the action runs
**Then** the screen returns to the previous screen (per the navigation stack)
**And** if the entry was a deep link, the stack is reasonable (Home → Detail, not just an isolated detail)

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the screen
**Then** the back button is labeled with the action
**And** the overflow menu is labeled
**And** the sticky header is announced as a navigation context

## Frontend (React Native)

### Component location

The screen lives in `apps/city-hero/src/screens/DetailInProgress/`:

```
apps/city-hero/src/screens/DetailInProgress/
├── DetailInProgressScreen.tsx
├── DetailInProgressScreen.styles.ts
└── DetailInProgressScreen.test.tsx
```

The reusable shell — `DetailScrollContainer`, `StickyHeader`, and the
slot system — is the **`DetailShell` template** in
`packages/design_system/src/templates/DetailShell/`
(see `docs/engineering/component-inventory.md` · Templates). Per
`design-system.md`, the template is the single source of truth and is
consumed identically by SCREENs 13, 14, 17, 23, and 27.

### Component behavior

- `DetailInProgressScreen` composes `DetailShell` (from the design system) with screen-specific slot contents.
- `DetailShell` exposes scroll progress so consumers can animate sticky-header transitions.
- The screen reads the report's metadata via navigation params or a query hook (cache key = `report:<id>`).

### Animation

- Sticky header fades in over ~150ms as the hero scrolls off.
- Hero photo has a subtle parallax (~0.5x) on scroll for richness; respects reduced motion.

## Backend

Not applicable for this task. Data fetching is owned by the per-section tasks.

## Database

Not applicable directly.

## Edge Cases

- **Photo not yet anonymized**: the hero shows the "Anonimizando…" state with a category placeholder.
- **Long load times for the full report**: the screen renders the cached lightweight summary (if available) and reflows when fresh data arrives.
- **Network error during initial load**: an inline error in the content area; the hero still renders.

## Privacy / LGPD

Not applicable directly. Subsequent tasks handle photo and reporter identity.

## Analytics

| Event                             | When           | Props                      |
| --------------------------------- | -------------- | -------------------------- |
| `detail_in_progress.viewed`       | Screen mounts  | `report_id`, `source: feed | push | share | my_reports | league | anon` |
| `detail_in_progress.back_pressed` | User taps back | —                          |

## Tests

- **Unit**: renders all slot placeholders; sticky header appears on scroll past hero; reading order correct.
- **Snapshot**: light + dark.
- **A11y**: navigation elements labeled.

## Definition of Done

- [ ] DetailInProgressScreen base layout
- [ ] DetailScrollContainer with scroll progress
- [ ] StickyHeader with fade-in transition
- [ ] Slots for tasks 02–07
- [ ] Hero parallax (with reduced motion respect)
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (screen composition): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native Reanimated (scroll-driven animations): https://docs.swmansion.com/react-native-reanimated/docs/scroll/

### Project context

- Prototype: `design/index.html` (search `title: 'Detalhe · Em andamento'`)
- Feed card (entry point): `07-civic-feed/03-feed-item-card.md`
- Liga / Envio Anônimo bottom CTAs (entry): `11-anonymous-send/07-bottom-cta.md`, `12-heroes-league/08-bottom-bar.md`
- `CLAUDE.md`
