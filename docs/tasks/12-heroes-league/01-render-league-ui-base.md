# Heroes League · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 12 · Heroes League
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: an emerald success hero at the top (filled by task 02),
a scrollable middle area hosting the pivot copy, preview card, share
channels, message template, and achievement teaser (tasks 03–07), and
a sticky bottom bar with two buttons — Skip and "Compartilhar & formar
liga" (task 08).

The visual identity contrasts deliberately with Envio Anônimo (which
uses violet/indigo) — here, green success colors signal celebration,
energy, and momentum.

## User Story

**As a** Citizen who just submitted identified,
**I want** an energetic, share-friendly confirmation screen,
**In order to** feel the action mattered and choose to amplify it.

## Acceptance Criteria

### Scenario · Default render

**Given** the user arrived from the report-confirm submit (identified path)
**When** the screen renders
**Then** the status bar variant is `light` (over the emerald hero)
**And** the hero slot at the top is reserved for task 02
**And** the scrollable middle area hosts the slots for tasks 03–07
**And** a sticky bottom bar reserves space for task 08

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** other tasks plug in
**Then** the named slots are: `hero` (top), `pivot-copy`, `preview-card`, `share-channels`, `message-template`, `achievement`, `bottom-bar`
**And** the order in the scrollable area follows the prototype's flow

### Scenario · Theming

**Given** the user is in dark mode
**When** the screen renders
**Then** the page background adapts tonally
**And** the emerald gradient hero remains constant (brand identity)
**And** card backgrounds use the dark surface tokens

### Scenario · Safe areas

**Given** any device
**When** the screen renders
**Then** the hero respects the top safe area inset
**And** the bottom bar respects the bottom safe area inset

### Scenario · Back navigation

**Given** the user attempts to navigate back
**When** the action runs
**Then** the screen behaves like task 08's Skip — navigates to the detail screen
**And** there's no "are you sure?" prompt (the report is already submitted)

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the screen
**Then** the slot order is preserved as reading order
**And** the bottom bar's buttons are clearly labeled

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/HeroesLeague/
├── HeroesLeagueScreen.tsx
├── HeroesLeagueScreen.styles.ts
├── HeroesLeagueScreen.test.tsx
└── components/
    └── LeagueLayoutSlots.tsx
```

### Component behavior

- `HeroesLeagueScreen` composes the hero, scrollable content, and bottom bar.
- `LeagueLayoutSlots` defines positional anchors for tasks 02–08.
- The screen receives the new report's metadata via navigation params (report ID, protocol, XP/medal granted, slug for the universal link).

### Visual identity

- Hero: emerald → emerald → dark emerald gradient.
- Scrollable area: light slate-50 background.
- Bottom bar: white surface with the violet→orange gradient on the primary button (a visual "league" energy).

## Backend

Not applicable to this task.

## Database

Not applicable directly.

## Edge Cases

- **Submit succeeded but server-side anonymization pending**: task 04's preview card handles the photo state.
- **Skipped in quick succession**: task 08 deduplicates rapid taps.
- **Deep link arrived during navigation transition**: handled by the deep link handler; the screen is dismissed gracefully if needed.

## Privacy / LGPD

Not applicable to this task.

## Analytics

| Event                   | When                  | Props       |
| ----------------------- | --------------------- | ----------- |
| `league.viewed`         | Screen mounts         | `report_id` |
| `league.back_attempted` | User tried to go back | —           |

## Tests

- **Unit**: layout slots render correctly; light status bar over hero.
- **Snapshot**: light + dark variants.
- **A11y**: reading order matches the prototype's flow.

## Definition of Done

- [ ] HeroesLeagueScreen base layout
- [ ] LeagueLayoutSlots with named slots
- [ ] Status bar variant set
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing
- [ ] Ready for tasks 02–08 to plug in

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Prototype: `design/index.html` (search `title: 'Liga de Heróis'`)
- Identification toggle (bifurcation source): `10-report-confirm/06-identification-toggle.md`
- Sibling screen (Envio Anônimo): `docs/tasks/11-anonymous-send/`
- `CLAUDE.md`
