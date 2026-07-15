# Manual Report · Submit & continue to Confirmação

> **Type:** Screen feature · Submit flow\
> **Screen:** SCREEN 09 · Manual Report\
> **Effort:** S (≤1 day)\
> **Dependencies:** `09-manual-report/02-category-grid.md`,
> `09-manual-report/03-photo-thumbnail.md`, `09-manual-report/04-mini-map-location.md`,
> `09-manual-report/05-ai-feedback-loop.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The CTA at the bottom of the manual report screen. When the user taps "Continuar →", it gathers the
screen state (category, photo, location, AI feedback flag) and navigates to the standard Confirmação
do Reporte screen (SCREEN 10), where the user reviews and submits to the backend.

This task does not create the report itself — that's owned by SCREEN 10 and the report-create
endpoint. Here we hand off the validated payload.

## User Story

**As a** Citizen finishing the manual flow,\
**I want** one clear continue button,\
**In order to** move to the final review without surprises.

## Acceptance Criteria

### Scenario · CTA enabled

**Given** the user has selected a category and the location is set (with or without a photo)\
**When** the CTA renders\
**Then** "Continuar →" is enabled with the brand-gradient style\
**And** light haptic feedback is queued for activation

### Scenario · CTA disabled

**Given** the user has not selected a category, or the location is missing\
**When** the CTA renders\
**Then** "Continuar →" is disabled (lower opacity, non-tappable)\
**And** an inline hint near the missing required field encourages completion

### Scenario · Tap to continue

**Given** the CTA is enabled\
**When** the user taps it\
**Then** the screen gathers the state: category (primary + optional secondary), photo (URI + flags),
location (lat, lng, address), AI-feedback flag, original AI detection (if any), entry context
(low_confidence / no_photo / user_opted_out)\
**And** navigates to the Confirmação do Reporte screen with the payload\
**And** light haptic feedback fires

### Scenario · Resume after going back

**Given** the user goes back from Confirmação to the manual report screen\
**When** the screen rehydrates\
**Then** the state (category, photo, location, AI flag) is preserved\
**And** the user can adjust any field and continue again

### Scenario · No photo path

**Given** the user has no photo (declined or unavailable)\
**When** they continue\
**Then** the payload includes `photo: null`\
**And** Confirmação handles the no-photo case (allowed when AI couldn't be used; still a valid
report with category + location + description)

### Scenario · Validation issues at continue time

**Given** the user has stale data (e.g., location no longer fresh enough)\
**When** they tap continue\
**Then** a small refresh runs (e.g., re-fetch GPS) before continuing\
**And** if the data can't be refreshed, an inline error explains and prevents the continue

### Scenario · Multi-tenant scoping reminder

**Given** the user's location is outside the active city (warning shown by task 04)\
**When** they continue anyway\
**Then** Confirmação receives the payload with a `city_warning: true` flag\
**And** Confirmação's submit logic respects the warning (server-side enforcement is the last line)

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates to the CTA\
**Then** it's announced with its enabled/disabled state and the action ("Continue to confirmation,
disabled because category is missing")

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ManualReport/
└── hooks/
    └── useContinueManualReport.ts
```

### Behavior

- `useContinueManualReport` aggregates state from the four hooks (`useReportCategory`,
  `usePhotoState`, `useReportLocation`, `useAiFeedbackConsent`).
- It exposes `canContinue` (boolean) for the CTA gating and `continue()` (function) that gathers and
  navigates.
- The navigation passes the payload as route params (or via a small in-memory store if the payload
  is too large for params).
- A back-navigation handler preserves the state in the manual report screen (so re-entering doesn't
  reset).

### Payload shape

The payload includes (conceptually):

- `category` — primary key + optional secondary
- `photo` — URI + metadata (source, flags) or null
- `location` — lat, lng, accuracy, source (live/cached), reverse-geocoded address, optional
  city_warning flag
- `ai_label_candidate` — boolean
- `ai_original_detection` — the AI's guess (null if none)
- `ai_model_version` — the model used at capture (null if none)
- `entry_context` — how the user arrived at the manual flow

## Backend

This task doesn't call the backend directly. The Confirmação screen (SCREEN 10) submits the report
and triggers the upload pipeline, anonymization, and AI feedback storage.

## Database

Not applicable directly — all the schema lives with the report-creation tasks.

## Edge Cases

- **Payload too large for nav params**: use an in-memory bridge store keyed by a UUID; Confirmação
  reads from it.
- **User navigates away mid-flow**: state is preserved in the screen for the session; cleared on app
  cold start.
- **Backend submission later fails**: handled by Confirmação's flow (retry / queue offline) — not
  this task's concern.

## Privacy / LGPD

The payload itself is not transmitted yet — only handed to the next screen. The user can still
abandon before any data leaves the device.

## Analytics

| Event                            | When                                  | Props                                               |
| -------------------------------- | ------------------------------------- | --------------------------------------------------- |
| `manual_report.continue_pressed` | User taps continue                    | `had_photo: bool`, `category`, `city_warning: bool` |
| `manual_report.continue_blocked` | CTA disabled and user taps the screen | `missing: ['category'                               | 'location' | ...]` |

## Tests

- **Unit**: CTA gating logic; payload assembly; back-navigation preservation.
- **Integration**: with all fields populated, continue navigates correctly; with missing fields, CTA
  disabled.
- **E2E**: complete the manual flow → land on Confirmação with the payload visible.

## Definition of Done

- [ ] `useContinueManualReport` hook
- [ ] CTA gating
- [ ] Payload assembly
- [ ] Navigation to Confirmação with payload
- [ ] State preservation on back-navigation
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Navigation params: https://reactnavigation.org/docs/params/

### Project context

- All other manual report sub-tasks (01-05)
- Confirmação do Reporte: `docs/tasks/10-report-confirm/`
- `CLAUDE.md`
