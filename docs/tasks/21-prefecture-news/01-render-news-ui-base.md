# Prefecture News · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 21 · Prefecture News
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a slate-50 background, a white official header card at
the top (back button, prefecture brand icon + "Canal oficial ·
verificado" + city's "Informa" name + a bell icon for preferences),
sticky filter chips, then a scrollable content area for the pinned
alert (task 03) and the news list (task 04). The bottom nav is present.

## User Story

**As a** Citizen,
**I want** an official-feeling layout that signals authority and trust,
**In order to** distinguish prefecture content from peer content.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens Prefecture News
**When** the screen renders
**Then** the status bar variant is `dark`
**And** the official header card includes: back button, 🏛️ gradient icon, "Canal oficial · verificado" kicker, city's "{City} Informa" main title, bell icon
**And** below: sticky filter chips row
**And** below that: scrollable area with the pinned alert (when present) and the news list
**And** the bottom nav is visible

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** other tasks plug in
**Then** the named slots are: `header`, `filter-chips`, `pinned-alert`, `news-list`
**And** the order reflects the prototype

### Scenario · Bell icon shows badge

**Given** the user has muted some categories
**When** the bell renders
**Then** a small dot indicator may appear (or not, per design)
**And** tapping opens the preferences sheet (task 06)

### Scenario · Verified badge

**Given** the official header renders
**When** the user looks
**Then** "Canal oficial · verificado" is clearly visible with a small dot separator
**And** the styling reinforces credibility (no decorative emojis beyond the brand 🏛️)

### Scenario · Back navigation

**Given** the user taps back
**When** the action runs
**Then** returns to the previous screen

### Scenario · Theming

**Given** dark mode
**When** the screen renders
**Then** the background and cards adapt tonally
**And** the prefecture brand colors remain constant

### Scenario · Accessibility

**Given** screen reader is on
**When** the screen mounts
**Then** the title is announced as a heading
**And** "Canal oficial · verificado" is announced as part of the header

## Frontend (React Native)

### Component location

```
apps/mobile/src/screens/PrefectureNews/
├── PrefectureNewsScreen.tsx
├── PrefectureNewsScreen.styles.ts
├── PrefectureNewsScreen.test.tsx
└── components/
    ├── OfficialHeader.tsx
    └── PrefectureNewsLayoutSlots.tsx
```

### Component behavior

- `PrefectureNewsScreen` composes header, slots, and bottom nav.
- `OfficialHeader` is presentational with back, bell, and brand identity.
- The bell tap opens task 06's preferences sheet.

## Backend

Not applicable for this task.

## Database

Not applicable directly.

## Edge Cases

- **Long city name in "Informa" title**: truncates with ellipsis.
- **Brand icon load fails**: falls back to a default 🏛️ emoji.

## Privacy / LGPD

Not applicable to this task.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `prefecture_news.viewed`       | Screen mounts                              | `city_id`                             |
| `prefecture_news.bell_pressed` | User opened preferences                    | —                                     |

## Tests

- **Unit**: header renders; bell callback fires.
- **Snapshot**: light + dark.
- **A11y**: title labeled; verified badge announced.

## Definition of Done

- [ ] PrefectureNewsScreen base layout
- [ ] OfficialHeader + LayoutSlots
- [ ] Bell tap wiring
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Prototype: `design/index.html` (search `title: 'Avisos da Prefeitura'`)
- `CLAUDE.md`
