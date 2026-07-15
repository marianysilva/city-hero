# Report Confirmation · Description input (optional comment)

> **Type:** Screen feature · UI + content\
> **Screen:** SCREEN 10 · Report Confirmation\
> **Effort:** S (≤1 day)\
> **Dependencies:** `10-report-confirm/01-render-confirm-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`, `moderation`

## Context

An **optional** free-text input where the user can add context the AI can't see ("Já furou pneu de 2
motos hoje"). It's labeled "Comentário (opcional)" — explicitly not a required field. A character
cap, simple client-side moderation hints (profanity warning), and on-screen keyboard handling round
it out.

The field is intentionally **optional** to reduce friction. Most reports will be submitted without
one.

## User Story

**As a** Citizen with extra context,\
**I want** an optional text field to add detail,\
**In order to** make the report more useful when needed.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen renders\
**When** the description section appears\
**Then** the label "Comentário (opcional)" is shown in uppercase small text\
**And** a multi-line input with a placeholder ("Ex.: 'Já furou pneu de 2 motos hoje…'") is shown\
**And** focus is **not** auto-grabbed (the user opts in by tapping)

### Scenario · User taps to add a comment

**Given** the input is empty\
**When** the user taps and starts typing\
**Then** the keyboard opens\
**And** the screen scrolls so the input stays visible above the keyboard\
**And** a small character counter appears (e.g., "0 / 280")

### Scenario · Character cap

**Given** the user is typing\
**When** they reach the cap (e.g., 280 chars)\
**Then** further input is silently truncated (or blocked depending on platform behavior)\
**And** the counter shows the limit reached

### Scenario · Empty comment is allowed

**Given** the user leaves the input empty\
**When** they continue / submit\
**Then** the report is created without a description (the field is optional)\
**And** no CTA gating change occurs based on description presence

### Scenario · Profanity hint

**Given** the user's text matches a simple denylist\
**When** the input is updated\
**Then** an unobtrusive hint appears ("Mantenha o respeito · seu reporte vai longe quando é
construtivo")\
**And** submission isn't blocked — the warning is informational only

### Scenario · Localized placeholder

**Given** the user's language is en-US\
**When** the input renders\
**Then** the placeholder is in English ("e.g., 'Two motorcycles already got flats today…'")

### Scenario · Anonymous reports show no different behavior here

**Given** the user is going to submit anonymously\
**When** the description input renders\
**Then** it works identically to the identified path\
**And** the description text is associated with the report regardless of identity

### Scenario · Description is moderated server-side too

**Given** the user submits a description\
**When** the backend processes\
**Then** the description is moderated (per the moderation policy in
`docs/engineering/security-baseline.md`)\
**And** clearly inappropriate content is rejected with a clear error code\
**And** the user can revise and resubmit

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user focuses the input\
**Then** it's announced with its label and the "optional" hint\
**And** the character counter is read as a live region as it changes

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ReportConfirm/
└── components/
    └── DescriptionInput.tsx
```

### Component behavior

- The input is a multi-line text field with the configured character cap.
- A small character counter is shown when the user starts typing (hidden when empty).
- An on-blur or debounced check runs the client-side denylist for the profanity hint.
- The component honors the keyboard's safe area; the screen-level KeyboardAvoidingView handles the
  global layout.

### Denylist source

The client-side denylist is intentionally small (slurs, common harmful patterns). The bulk of
moderation is server-side. The client signal is just to nudge respectful content.

## Backend (FastAPI)

The description travels with the report-create payload. Server-side moderation:

- A configurable denylist (more comprehensive than the client's).
- A length cap matching the client's (defense in depth).
- Optional ML moderation (e.g., a toxicity classifier) for future iterations.

Rejected descriptions return a clear error code; the client surfaces it inline near the input.

## Database

The `reports.description` column (text, nullable) holds the user's comment. Schema is owned by the
report-creation flow.

## Edge Cases

- **Long pastes**: the input truncates at the cap; the user is notified.
- **Multilingual users**: the denylist supports multiple languages (pt-BR + en-US for MVP).
- **Emoji-only descriptions**: allowed; emojis don't hurt.
- **Encoding issues** (rare): the backend normalizes Unicode safely.

## Privacy / LGPD

- The description may contain personal opinions; it's stored as-is.
- For anonymous reports, the description is not associated with the user publicly — same as the
  photo.
- Moderator access to descriptions is logged for audit.

## Analytics

| Event                                 | When                    | Props           |
| ------------------------------------- | ----------------------- | --------------- |
| `report_confirm.description_added`    | User typed any content  | `length_bucket` |
| `report_confirm.profanity_hint_shown` | Client denylist matched | —               |

## Tests

- **Unit**: cap enforcement; profanity hint trigger; localized placeholder.
- **Integration**: keyboard avoidance works; counter updates correctly.
- **A11y**: input labeled with optional hint; counter live region.

## Definition of Done

- [ ] DescriptionInput component
- [ ] Character cap + counter
- [ ] Client-side profanity hint
- [ ] Localized placeholder
- [ ] Keyboard avoidance verified
- [ ] Server-side moderation contract documented
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Security (moderation): `docs/engineering/security-baseline.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native TextInput: https://reactnative.dev/docs/textinput
- KeyboardAvoidingView: https://reactnative.dev/docs/keyboardavoidingview

### Project context

- Render UI base: `01-render-confirm-ui-base.md`
- `CLAUDE.md`
