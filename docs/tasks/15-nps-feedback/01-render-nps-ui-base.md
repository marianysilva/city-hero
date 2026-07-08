# NPS Feedback · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 15 · NPS Feedback
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a soft emerald-to-white vertical gradient background,
a top row with a single "Agora não" link on the right (the escape
hatch), a scrollable middle area for the hero, rating, tags, and
comment (tasks 02–05), and a sticky bottom CTA bar with the "Enviar
feedback +15 XP" button plus a small footer message about public-data
usage.

## User Story

**As a** Citizen evaluating a resolution,
**I want** a calm, focused layout,
**In order to** answer without distraction.

## Acceptance Criteria

### Scenario · Default render

**Given** the user arrives via Avaliar from SCREEN 14
**When** the screen renders
**Then** the background uses a soft `emerald.50 → white` vertical gradient
**And** the status bar variant is `dark`
**And** a top row holds a single "Agora não" link on the right (the dismiss action)
**And** below, the scrollable area hosts the slots for tasks 02–05
**And** a sticky bottom CTA bar reserves space for task 06's button + footer message

### Scenario · "Agora não" dismiss

**Given** the user wants to skip the survey
**When** they tap "Agora não"
**Then** the screen closes
**And** returns to the previous screen (SCREEN 14)
**And** the NPS opportunity is preserved (the user can come back later via the Avaliar button)

### Scenario · Sticky CTA

**Given** the user scrolls
**When** scrolling
**Then** the CTA bar remains pinned at the bottom
**And** the footer message ("Seu feedback vira dado público no painel da cidade") stays under the button

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** other tasks plug in
**Then** the named slots are: `hero`, `rating`, `tags`, `comment`, `cta-bar`
**And** the order reflects the prototype

### Scenario · Theming

**Given** the user is in dark mode
**When** the screen renders
**Then** the gradient swaps to a darker tonal equivalent
**And** the emerald primary color is preserved on the CTA

### Scenario · Safe areas

**Given** any device
**When** the screen renders
**Then** the top "Agora não" row respects the top safe area inset
**And** the sticky CTA respects the bottom safe area inset

### Scenario · Accessibility

**Given** screen reader is on
**When** the screen mounts
**Then** the title (per task 03's "Como foi o atendimento") is announced as a heading once visible
**And** the "Agora não" link is clearly labeled
**And** the CTA button is labeled with its action and reward

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/NpsFeedback/
├── NpsFeedbackScreen.tsx
├── NpsFeedbackScreen.styles.ts
├── NpsFeedbackScreen.test.tsx
└── components/
    └── NpsLayoutSlots.tsx
```

### Component behavior

- `NpsFeedbackScreen` composes the gradient background, the "Agora não" row, the scrollable content area, and the sticky CTA bar.
- `NpsLayoutSlots` defines named positional anchors used by other tasks.
- The screen receives the report ID via navigation params and reads the report's lightweight summary (for the hero) via a hook (`useReportSummary`).

### Visual identity

The soft emerald gradient signals positive resolution but stays understated so the rating scale (task 03) and tags (task 04) are the focal point.

## Backend

Not applicable for this task.

## Database

Not applicable directly.

## Edge Cases

- **Report state changed back to open while user is on the screen**: a small banner explains and offers to return; submitting would be invalid.
- **User backgrounded during scroll**: state preserved on return.
- **"Agora não" tapped after scrolling**: doesn't lose form state if the user comes back (state is held in the screen-scoped store; cleared on backgrounding for >X minutes).

## Privacy / LGPD

The screen displays public-safe report data only (anonymized photos, address, protocol). The user's input (rating, tags, comment) is private until submitted.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `nps.viewed`                   | Screen mounts                              | `report_id`, `source: tap_avaliar|push_after_resolution` |
| `nps.dismissed`                | User tapped "Agora não"                    | —                                     |

## Tests

- **Unit**: layout slots render correctly; "Agora não" dismisses; sticky CTA visible.
- **Snapshot**: light + dark.
- **A11y**: navigation labels verified.

## Definition of Done

- [ ] NpsFeedbackScreen base layout
- [ ] NpsLayoutSlots with named slots
- [ ] "Agora não" dismiss
- [ ] Sticky CTA + footer message slot
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Prototype: `design/index.html` (search `title: 'NPS · Feedback'`)
- Entry source: `14-detail-ticket/05-avaliar-cta.md`
- `CLAUDE.md`
