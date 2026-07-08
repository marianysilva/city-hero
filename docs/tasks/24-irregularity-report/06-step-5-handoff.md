# Irregularity Report · Step 5 · Handoff + confirmation

> **Type:** Screen feature · UI + integrations
> **Screen:** SCREEN 24 · Irregularity Report
> **Effort:** M (1-2 days)
> **Dependencies:** `24-irregularity-report/01-render-irregularity-ui-base.md`, all previous steps
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `accountability`

## Context

The final step: the user reviews a summary, then taps "Enviar para {authority}". The screen generates the pre-formatted message in the authority's expected format and hands off via:

- **mailto** (email channel) — opens the default email composer with subject/body pre-filled.
- **Web form deep link** (if the authority has one) — opens the OS browser.
- **In-app helper** (only if the authority's API is integrated; rare).

After handoff, a confirmation screen shows the action ("✓ Encaminhado para {authority}") and a small explainer that the authority will respond via its channel.

CityHero **never stores** the complaint content; only telemetry records that a handoff happened (no content).

## Acceptance Criteria

### Scenario · Default render

**Given** the user reaches step 5
**When** the screen renders
**Then** a summary card lists: chosen program, authority, identification mode, form preview (truncated)
**And** the primary CTA "Enviar para {authority}" is prominent
**And** a small "Editar" link goes back to step 3

### Scenario · Tap Enviar (email path)

**Given** the chosen authority's primary channel is email
**When** the user taps Enviar
**Then** a mailto: link opens the default email composer
**And** the subject + body are pre-filled with the formatted complaint
**And** attachments (if any) are attached via the email's standard handler

### Scenario · Tap Enviar (web form path)

**Given** the channel is a web form
**When** the user taps Enviar
**Then** the browser opens the form URL
**And** if the URL supports query-string pre-fill, the relevant fields are populated

### Scenario · Confirmation screen

**Given** the handoff occurred
**When** the confirmation screen appears
**Then** it shows "✓ Encaminhado para {authority}"
**And** the channel + next-steps info ("A {authority} vai responder pelo email cadastrado / via Portal")
**And** a "Concluir" button that closes the screen

### Scenario · External channel error

**Given** the mailto / browser fails to launch (rare)
**When** the error is detected
**Then** the user gets a soft fallback: "Não conseguimos abrir o email. Copie o texto e envie pra {address}."
**And** a "Copiar texto" button copies the message

### Scenario · CityHero stores no content

**Given** the handoff occurred
**When** the analytics fire
**Then** events include only: authority, program, identified (bool), success (bool)
**And** **no content fields** (no subject, body, attachments)

### Scenario · Localization

**Given** en-US
**When** the summary + confirmation render
**Then** copy translates; the formatted complaint stays in pt-BR if the authority is Brazilian

### Scenario · Accessibility

**Given** SR is on
**When** the confirmation appears
**Then** announced as a critical success ("Forwarded to {authority}")

## Frontend

```
apps/city-hero/src/screens/IrregularityReport/
├── steps/
│   ├── Step5Handoff.tsx
│   └── HandoffConfirmation.tsx
├── services/
│   ├── composeComplaintMessage.ts
│   └── handoffChannel.ts
```

`composeComplaintMessage` is a small util that takes the program, authority, form data, identification, and produces the email subject/body (or web-form params).

## Backend

Not applicable for content. Analytics use the standard events pipeline.

## Database

Not applicable.

## Edge Cases

- **Authority's channel changed**: the catalog (per task 03) is consulted on each handoff; stale URLs are detected.
- **User's email client missing**: fall back to copy + manual paste.

## Privacy / LGPD

The principle: **CityHero never stores the complaint content.** Analytics only record metadata (authority, program, identified). The Brazilian channel handles the data subject's rights to access/erasure of their complaint — CityHero is not a data controller for this content.

## Analytics

| Event                            | When                             | Props                           |
| -------------------------------- | -------------------------------- | ------------------------------- |
| `irregularity.handoff_started`   | User tapped Enviar               | `authority_id`, `program_id`    |
| `irregularity.handoff_succeeded` | Channel launched successfully    | `authority_id`, `channel: email | web | api`, `identified: bool` |
| `irregularity.handoff_failed`    | Channel failed to launch         | `authority_id`, `reason`        |
| `irregularity.handoff_copied`    | User copied the text as fallback | —                               |

## Tests

- **Unit**: message composition; channel routing; success/failure paths.
- **Integration**: mailto and web-form launch on real devices.
- **A11y**: confirmation announcement.

## Definition of Done

- [ ] Step5Handoff + HandoffConfirmation screens
- [ ] composeComplaintMessage util
- [ ] handoffChannel service for email/web
- [ ] Copy-fallback for failures
- [ ] No-content analytics
- [ ] Localized copy
- [ ] Tests passing

## Standards & References

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Cross-cutting: `docs/engineering/`
- `CLAUDE.md`
