# Report Confirmation · AI suggestions panel (category + severity)

> **Type:** Screen feature · UI + ML signals
> **Screen:** SCREEN 10 · Report Confirmation
> **Effort:** M (1-2 days)
> **Dependencies:** `10-report-confirm/01-render-confirm-ui-base.md`, `00-foundation/16-yolov8-inference-service.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `ai`

## Context

Two pre-filled fields that the AI determined at capture:

- **Category** — the detected problem type with a confidence badge
  ("Buraco na via · 94%"). A "Trocar" button opens the category grid
  (same component as Manual Report, task 02 of SCREEN 09).
- **Severity** — three-button toggle (Leve / Moderado / Grave) with the
  AI's suggestion pre-selected. Users decide if the severity is right.

Severity drives the manager panel's prioritization later — the AI's
guess is a starting point, the user calibrates.

## User Story

**As a** Citizen confirming a report,
**I want** the category and severity already filled in,
**In order to** just confirm with one tap if the AI was right.

## Acceptance Criteria

### Scenario · Category rendered from AI detection

**Given** the user arrived from the camera with a high-confidence detection
**When** the category section renders
**Then** the category emoji + label appear ("🕳️ Buraco na via")
**And** the confidence percentage badge is shown ("94%") in green
**And** a "Trocar" link is shown to allow change

### Scenario · Category from manual report

**Given** the user arrived from the manual report with a user-picked category
**When** the section renders
**Then** the category appears the same way
**And** instead of a confidence badge, an "Escolhida por você" pill is shown
**And** "Trocar" still works

### Scenario · Tap "Trocar"

**Given** the user wants a different category
**When** they tap "Trocar"
**Then** the category grid bottom sheet opens (reused from `09-manual-report/02-category-grid.md`)
**And** picking a new category updates the section
**And** the confidence badge becomes "Escolhida por você" (the user's pick overrides AI)

### Scenario · Severity AI suggestion

**Given** the AI suggested "Moderado"
**When** the severity row renders
**Then** the three buttons (Leve / Moderado / Grave) show with the suggested one active
**And** a small "IA sugere" hint appears near the row label

### Scenario · Severity manual selection

**Given** the user taps "Grave"
**When** the action runs
**Then** "Grave" becomes active and the others become inactive
**And** the "IA sugere" hint changes to "Escolhida por você"
**And** the screen records the manual override

### Scenario · No AI severity

**Given** the user arrived from manual report (no AI severity)
**When** the row renders
**Then** the default selection is "Moderado" (a sensible middle ground)
**And** the hint is omitted

### Scenario · Severity color cues

**Given** any severity is active
**When** the buttons render
**Then** the active button uses the brand primary color for "Moderado", a calmer slate-tinted color for "Leve", and a danger-color accent for "Grave"
**And** the design encourages thoughtful selection (not pushing the user to overstate severity)

### Scenario · Localized labels

**Given** the user's language is en-US
**When** the section renders
**Then** labels are in English ("Pothole on the road", "Light / Moderate / Severe", "AI suggests", "Picked by you", "Change")

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the panel
**Then** the category and confidence are announced as a group ("Pothole on the road, AI confidence 94 percent")
**And** the severity buttons are announced as a radio group with the active option
**And** "Trocar" is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/ReportConfirm/
├── components/
│   ├── CategoryField.tsx
│   ├── ConfidenceBadge.tsx
│   └── SeveritySelector.tsx
└── hooks/
    └── useAiSuggestions.ts
```

### Behavior

- `useAiSuggestions` holds the current category (key + label + confidence + source) and severity (value + source). It exposes update functions and a `wasAiOverridden` flag for analytics.
- `CategoryField` is presentational and accepts a callback to open the category grid sheet.
- `ConfidenceBadge` renders either a confidence percentage or the "Picked by you" pill based on the source.
- `SeveritySelector` is a three-button row with active/inactive states and the optional hint.

### Reused components

The category grid sheet from `09-manual-report/02` is reused. It expects an `onPick` callback and an optional pre-selected category — both of which are wired here.

## Backend (FastAPI)

This task does not introduce new backend endpoints; the category and severity travel as part of the report-create payload (task 08).

The AI's original detection (when applicable) is preserved alongside the user's final choice — the report record carries both:

- `ai_original_category` — the AI's category guess at capture
- `ai_original_severity` — the AI's severity guess
- `category` — what the user ended up choosing
- `severity` — what the user ended up choosing

This dual tracking feeds the model retraining loop (`09-manual-report/05`) and gives the prefecture insight into how often the AI gets it right.

## Database

The `reports` table has the four columns above (owned by the report-creation flow). No changes here.

## Edge Cases

- **AI detection was very low confidence but the user came here anyway** (rare, but possible if the flow was forced): the badge shows the low confidence honestly; the user is likely to swap.
- **Trocar to "Outro"**: the secondary picker from `09-manual-report/02` applies; the field shows the secondary category.
- **Severity AI output is unusual**: the system displays the closest of the three buckets; AI inference can be more granular but the UI is bucketed for clarity.

## Privacy / LGPD

Not applicable directly. Severity and category are non-sensitive metadata.

## Analytics

| Event                                  | When                                       | Props                                |
|----------------------------------------|--------------------------------------------|---------------------------------------|
| `report_confirm.category_changed`      | User tapped Trocar and picked              | `from`, `to`, `from_source`          |
| `report_confirm.severity_changed`      | User changed severity                      | `from`, `to`, `from_source`          |
| `report_confirm.ai_acceptance`         | User confirmed without changes             | `category`, `severity`                |

## Tests

- **Unit**: hook updates on change; source flags transition correctly.
- **Integration**: category grid reuse; severity selection toggles.
- **A11y**: panel announced as a group; radio behavior on severity.

## Definition of Done

- [ ] CategoryField, ConfidenceBadge, SeveritySelector components
- [ ] `useAiSuggestions` hook
- [ ] Category grid sheet reuse with pre-selection
- [ ] Source flag tracking (AI vs user)
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- Bottom Sheet: https://gorhom.dev/react-native-bottom-sheet

### Project context
- Render UI base: `01-render-confirm-ui-base.md`
- Category grid (reused): `09-manual-report/02-category-grid.md`
- AI inference service: `00-foundation/16-yolov8-inference-service.md`
- AI feedback loop: `09-manual-report/05-ai-feedback-loop.md`
- `CLAUDE.md`
