# Detail · Merged · Comparison cards

> **Type:** Screen feature · UI + content\
> **Screen:** SCREEN 17 · Detail · Merged Report\
> **Effort:** M (1-2 days)\
> **Dependencies:** `17-detail-merged/01-render-merged-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

Two side-by-side comparison cards in the scroll area:

- **"Seu reporte" card**: shows the user's anonymized photo thumbnail, title, timestamp, GPS
  accuracy, and the category chip — read-only.
- **"Ticket principal" card**: shows the parent ticket's anonymized photo thumbnail, protocol +
  title, age + reporter (or 🥷 if anonymous), support count, and a pulsing dot + status pill ("EM
  ANDAMENTO · Equipe Pavimentação"). It's a tappable navigation surface (acts as a deep link to the
  parent).

The visual proximity of the two cards makes the merge decision concrete: the user can see for
themselves that the parent ticket is the same problem.

## User Story

**As a** Citizen,\
**I want** to see my report and the parent ticket side by side,\
**In order to** verify the merge was correct.

## Acceptance Criteria

### Scenario · "Seu reporte" card render

**Given** the screen renders\
**When** the user's report card appears\
**Then** the small label "SEU REPORTE" is above\
**And** the card has a photo thumbnail on the left, title + date + GPS info on the right\
**And** the category chip appears below the title\
**And** the card is non-tappable (read-only)

### Scenario · "Ticket principal" card render

**Given** the parent ticket data is loaded\
**When** the card renders\
**Then** the small label "TICKET PRINCIPAL" is above\
**And** the card has a photo thumbnail on the left, protocol + title + age + reporter on the right\
**And** the support count is shown ("34 apoios")\
**And** a pulsing dot + status pill shows the parent's current state ("EM ANDAMENTO · Equipe
Pavimentação")\
**And** a small "›" arrow indicates the card is tappable

### Scenario · Tap "Ticket principal"

**Given** the user taps the parent card\
**When** the action runs\
**Then** the app navigates to the parent's detail screen (SCREEN 13 if open, SCREEN 14 if resolved)\
**And** light haptic feedback fires

### Scenario · Parent ticket is anonymous

**Given** the parent ticket's reporter is anonymous\
**When** the card renders\
**Then** the reporter is shown as "🥷 Herói Anônimo" (matching the feed card convention)\
**And** the rest of the card behaves identically

### Scenario · Parent ticket resolved

**Given** the parent ticket was already resolved\
**When** the card renders\
**Then** the status pill is emerald "RESOLVIDO"\
**And** the tap routes to SCREEN 14 (Detail · Ticket)\
**And** the merge banner (task 02) reflects "ticket fechado" if applicable

### Scenario · Photo still anonymizing

**Given** either photo is still anonymizing\
**When** the cards render\
**Then** the affected thumbnail shows the "Anonimizando…" state\
**And** the card otherwise behaves identically

### Scenario · Distance hint

**Given** the user's report and the parent are at slightly different coordinates\
**When** the cards render\
**Then** an optional small distance hint between the cards (or in the parent card's subtext) shows
"80m daqui" referencing the user's report location

### Scenario · Localization

**Given** the user's language is en-US\
**When** the cards render\
**Then** labels are in English ("YOUR REPORT", "MAIN TICKET", "In progress · Paving team")

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the cards\
**Then** each card is announced as a group with its label, title, and key details\
**And** the parent card is announced as a button with its destination\
**And** the user's report card is announced as a region (not interactive)

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/DetailMerged/
└── components/
    ├── YourReportCard.tsx
    └── ParentTicketCard.tsx
```

### Component behavior

- `YourReportCard` is presentational; reads from the merged report's record.
- `ParentTicketCard` is presentational + tappable; fetches the parent's lightweight summary on mount
  (via the existing summary endpoint from `08-camera-live/09`).
- Both reuse styling tokens from the design system; photos use `expo-image` with lazy loading.

## Backend

This task doesn't introduce new endpoints. Both cards read from existing endpoints (the merged
report's record and the parent's summary).

## Database

No new schema. The `reports.merged_into_id` field links a merged report to its parent.

## Edge Cases

- **Both cards show same photo** (the AI's bounding box analysis matched): expected; this is the
  proof the user can examine.
- **Both photos visually different** (false-positive merge): the merge banner (task 02) explains the
  AI's reasoning; the user can flag via the overflow menu in a follow-up screen.
- **Network slow fetching parent summary**: a skeleton replaces the parent card while loading.

## Privacy / LGPD

- Both photos shown are anonymized.
- The parent ticket's reporter identity respects their anonymity choice.

## Analytics

| Event                                | When                        | Props                                        |
| ------------------------------------ | --------------------------- | -------------------------------------------- |
| `detail_merged.your_report_rendered` | Your report card mounted    | —                                            |
| `detail_merged.parent_card_rendered` | Parent card mounted         | `parent_status`, `parent_is_anonymous: bool` |
| `detail_merged.parent_card_pressed`  | User tapped the parent card | `parent_report_id`                           |

## Tests

- **Unit**: both cards render correctly across states (resolved parent, anonymous parent, deleted
  parent, anonymizing photo).
- **Snapshot**: each variant.
- **A11y**: card groups announced; parent as button with destination.

## Definition of Done

- [ ] YourReportCard component
- [ ] ParentTicketCard component
- [ ] Lightweight parent summary integration
- [ ] Photo states handled
- [ ] Distance hint
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- expo-image: https://docs.expo.dev/versions/latest/sdk/image/

### Project context

- Render UI base: `01-render-merged-ui-base.md`
- Parent summary endpoint: `08-camera-live/09-enrich-mode.md`
- Detail Em andamento (parent destination): `docs/tasks/13-detail-in-progress/`
- Detail Ticket (parent destination): `docs/tasks/14-detail-ticket/`
- `CLAUDE.md`
