# Anonymous Send · Render UI base

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 11 · Anonymous Send\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a violet/indigo gradient hero at the top reserved for task 02, a scrollable middle
area that hosts the educational and share panels (tasks 03–06), and a sticky bottom CTA bar (task
07).

The visual identity differs from Liga de Heróis (which uses green success colors) — here, the
dominant feel is "shadow hero", quieter and more private.

## User Story

**As a** Citizen who just submitted anonymously,\
**I want** a calm, private confirmation screen,\
**In order to** feel my privacy choice was respected.

## Acceptance Criteria

### Scenario · Default render

**Given** the user arrived from the report-confirm submit (anonymous path)\
**When** the screen renders\
**Then** the status bar variant is `light` (over the dark gradient hero)\
**And** the hero slot at the top is reserved for task 02\
**And** the scrollable middle area hosts the slots for tasks 03–06\
**And** a sticky bottom CTA bar reserves space for task 07

### Scenario · Slot system

**Given** the screen exposes positional slots\
**When** other tasks plug in\
**Then** the named slots are: `hero` (top), `feed-preview`, `kept`, `who-sees`, `share`,
`reversibility`, `cta-bar` (bottom)\
**And** the order in the scrollable area follows the prototype's flow

### Scenario · Theming

**Given** the screen renders\
**When** the user is in dark mode\
**Then** the page background switches to dark\
**And** the violet/indigo gradient hero remains constant (brand identity)\
**And** panel backgrounds adapt tonally

### Scenario · Safe areas

**Given** any device\
**When** the screen renders\
**Then** the hero respects the top safe area inset\
**And** the bottom CTA bar respects the bottom safe area inset

### Scenario · Back navigation

**Given** the user taps the system back gesture\
**When** the action runs\
**Then** the screen confirms before leaving (since the report was already submitted, the user is
just choosing what to do next)\
**And** alternatively, the back is captured to behave like the CTA: navigate to Detail · Em
andamento

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the screen\
**Then** the slot order is preserved as reading order\
**And** the CTA is clearly labeled

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/AnonymousSend/
├── AnonymousSendScreen.tsx
├── AnonymousSendScreen.styles.ts
├── AnonymousSendScreen.test.tsx
└── components/
    └── AnonymousLayoutSlots.tsx
```

### Component behavior

- `AnonymousSendScreen` composes hero, scrollable content, and bottom CTA.
- `AnonymousLayoutSlots` defines positional anchors used by other tasks.
- The screen receives the new report's metadata via navigation params (report ID, protocol number,
  XP/medal granted).

### Visual identity

The hero uses a violet→indigo gradient. The scrollable area uses neutral white with subtle borders
for cards. The bottom CTA's button uses a violet→indigo gradient that ties back to the hero.

## Backend

Not applicable to this task.

## Database

Not applicable directly.

## Edge Cases

- **Submit succeeded but server-side anonymization still pending**: the screen renders normally;
  task 03 (feed preview) shows an "Anonimizando…" state for the photo.
- **Long content on small screens**: the scroll handles it; the hero and CTA stay fixed.

## Privacy / LGPD

Not applicable to this task.

## Analytics

| Event                         | When                   | Props       |
| ----------------------------- | ---------------------- | ----------- |
| `anonymous_send.viewed`       | Screen mounts          | `report_id` |
| `anonymous_send.back_pressed` | User attempts to leave | —           |

## Tests

- **Unit**: layout slots render correctly; light status bar over hero.
- **Snapshot**: light + dark variants.
- **A11y**: reading order matches the prototype's flow.

## Definition of Done

- [ ] AnonymousSendScreen base layout
- [ ] AnonymousLayoutSlots with named slots
- [ ] Status bar variant set
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing
- [ ] Ready for tasks 02–07 to plug in

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Prototype: `design/index.html` (search `title: 'Envio Anônimo'`)
- Identification toggle (bifurcation source): `10-report-confirm/06-identification-toggle.md`
- `CLAUDE.md`
