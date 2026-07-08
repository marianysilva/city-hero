# NPS Feedback · Optional comment input

> **Type:** Screen feature · UI + content
> **Screen:** SCREEN 15 · NPS Feedback
> **Effort:** S (≤1 day)
> **Dependencies:** `15-nps-feedback/01-render-nps-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`, `moderation`

## Context

A small white card with the label "Comentário (opcional)" and a
multi-line text input with a placeholder ("Ex.: 'Podiam avisar antes
de fechar a rua…'"). The field is optional — submission doesn't
require it — but it's where the user can express specific feedback the
rating + tags don't capture.

Server-side moderation applies (same patterns as `10-report-confirm/05`).

## User Story

**As a** Citizen with specific feedback,
**I want** to add a short comment if I want,
**In order to** give the prefecture useful context beyond stars and tags.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen renders
**When** the comment section appears
**Then** the label "COMENTÁRIO (OPCIONAL)" is shown in small caps
**And** a multi-line input with a placeholder is shown
**And** the input does not auto-focus

### Scenario · User taps to type

**Given** the user taps the input
**When** the keyboard opens
**Then** the screen scrolls so the input stays visible above the keyboard
**And** a small character counter appears (e.g., "0 / 280")

### Scenario · Character cap

**Given** the user is typing
**When** they reach the cap (e.g., 280 chars)
**Then** further input is truncated or blocked
**And** the counter shows the limit reached

### Scenario · Empty comment is allowed

**Given** the user leaves the field empty
**When** they submit
**Then** the NPS is submitted without a comment
**And** no UI gating change happens

### Scenario · Profanity hint

**Given** the user's text matches the client-side denylist
**When** the input updates
**Then** an unobtrusive hint appears ("Mantenha o respeito · seu feedback chega melhor sem ataques")
**And** submission isn't blocked at the client; server-side moderation has final say

### Scenario · Localization

**Given** the user's language is en-US
**When** the input renders
**Then** the placeholder is in English ("e.g., 'They could have warned before closing the street…'")

### Scenario · Anonymous reporter
 
**Given** the user submitted the original report anonymously
**When** the comment is rendered
**Then** the input works identically
**And** the comment is treated as private — only the prefecture and aggregated dashboards see it

### Scenario · Server-side moderation

**Given** the user submits a comment
**When** the backend processes
**Then** the comment passes through the same moderation pipeline as report descriptions (`10-report-confirm/05`)
**And** clearly inappropriate content is rejected with a clear error code
**And** the user can revise and resubmit

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the input
**Then** the label and the "optional" hint are announced
**And** the character counter is a live region

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/NpsFeedback/
└── components/
    └── CommentInput.tsx
```

### Component behavior

- The input is a multi-line text field with the configured cap.
- A character counter renders only when the user has typed.
- An on-blur or debounced check runs the client-side denylist for the profanity hint.
- The component honors the keyboard's safe area; the screen-level KeyboardAvoidingView handles the global layout.

### Reuse from report-confirm description

The patterns from `10-report-confirm/05-description-input.md` apply directly. The component can be a shared `OptionalTextInput` used by both screens with minor styling differences.

## Backend (FastAPI)

The comment travels with the NPS submission payload (task 06). Server-side moderation matches the report description rules.

## Database

The NPS submission table (task 06) stores the comment in a nullable text column.

## Edge Cases

- **Long pastes**: truncated at the cap.
- **Emoji-only**: allowed.
- **Comment moderation rejection on submit**: surfaced inline so the user can revise.

## Privacy / LGPD

The comment may contain personal opinions; stored as-is in the NPS submission. For anonymous reporters, the comment is associated with the user privately (the prefecture sees it via their dashboard, not by neighbors).

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `nps.comment_typed`                | User typed any content                     | `length_bucket`                       |
| `nps.profanity_hint_shown`         | Client denylist matched                    | —                                     |

## Tests

- **Unit**: cap enforcement; profanity hint trigger; localized placeholder.
- **Integration**: keyboard avoidance works; counter updates.
- **A11y**: input labeled with optional hint.

## Definition of Done

- [ ] CommentInput component (potentially a shared OptionalTextInput)
- [ ] Character cap + counter
- [ ] Client-side profanity hint
- [ ] Localized placeholder
- [ ] Keyboard avoidance verified
- [ ] Server-side moderation contract aligned with description input
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Security (moderation): `docs/engineering/security-baseline.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-nps-ui-base.md`
- Sibling description input (shared patterns): `10-report-confirm/05-description-input.md`
- `CLAUDE.md`
