# Heroes League · Editable message template

> **Type:** Screen feature · UI + content
> **Screen:** SCREEN 12 · Heroes League
> **Effort:** S (≤1 day)
> **Dependencies:** `12-heroes-league/01-render-league-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `content`

## Context

A small card showing the **suggested share message** in a soft emerald
background — the text that will pre-fill when the user picks a channel.
A small ✨ icon, a section label ("MENSAGEM SUGERIDA"), and an "Editar"
link in the corner let the user customize the message. Tapping "Editar"
opens a small modal where the user can rewrite the text; their version
persists for this share and is the default if they share again on the
same screen.

The default template uses an emoji, a hook ("🚨 Preciso do seu apoio!"),
a one-line description of the issue, and a clickable URL.

## User Story

**As a** Citizen about to share,
**I want** a suggested message I can either use or tweak,
**In order to** share quickly with a personal touch when I want to.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen
**When** the message card renders
**Then** the card has a soft emerald-tinted background
**And** at the top: ✨ icon, "MENSAGEM SUGERIDA" label, "Editar" link on the right
**And** below: the default suggested message in friendly tone, ending with the universal link
**And** the message is a faithful preview of what will go to the share sheet

### Scenario · Default template content

**Given** the report is identified with category "Buraco" and severity "Moderado"
**When** the default template fills in
**Then** the message reads (in pt-BR): 
> "🚨 Preciso do seu apoio! Reportei um **buraco perigoso** na R. São Pedro, 320. Quanto mais gente apoiar, mais rápido a prefeitura resolve.
> 👉 cityhero.app/r/2847"

### Scenario · Tap "Editar"

**Given** the user taps Editar
**When** the action runs
**Then** a small modal opens with a multi-line text input pre-filled with the current message
**And** the user can edit freely; a character counter is shown
**And** the URL is fixed at the end (the user can rewrite text but not the link)

### Scenario · Save edit

**Given** the user wrote their version
**When** they tap "Salvar"
**Then** the card updates with the new message
**And** subsequent shares use this version
**And** the change persists only for this session (resets on next visit)

### Scenario · Reset to default

**Given** the user edited but wants to revert
**When** they tap "Resetar para o sugerido" inside the edit modal
**Then** the default message is restored
**And** the user can save or continue editing

### Scenario · Profanity hint

**Given** the user's edited text matches a denylist
**When** the text changes
**Then** a soft hint appears ("Mantenha o respeito")
**And** the user can still save; the warning is informational

### Scenario · Localization

**Given** the user's language is en-US
**When** the template renders
**Then** copy is in English ("🚨 I need your support! I reported a dangerous pothole at R. São Pedro, 320. The more people support, the faster city hall fixes it.")

### Scenario · Anonymous report variant

**Given** an anonymous report is being shared (shouldn't happen on this screen, but defensive)
**When** the template loads
**Then** the message omits personal language ("I" becomes "A neighbor reported…")
**And** the share happens through the appropriate flow (per `11-anonymous-send/05`)

### Scenario · Accessibility

**Given** screen reader is on
**When** the section is read
**Then** the label is announced as a heading
**And** the suggested message is read in order
**And** "Editar" is clearly labeled as a button

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/HeroesLeague/
└── components/
    ├── SuggestedMessageCard.tsx
    └── EditMessageModal.tsx
```

### Component behavior

- `SuggestedMessageCard` renders the current message (default or edited) and the "Editar" affordance.
- `EditMessageModal` is a modal with a text input, save/cancel actions, and a reset link.
- The screen-scoped state holds the current message; it does not persist across sessions.
- The default template uses the report's data via a small compose function.

### Compose function

A shared utility produces the default message from inputs (category, severity, address). It runs on the client; the server doesn't need to mirror it for MVP (the server's role is to render the OG card for the link preview, not the body of the share text).

## Backend

Not applicable to this task. The message is client-side content.

## Database

Not applicable.

## Edge Cases

- **User clears the entire message**: the share sheet still includes the URL; the message body would be empty (acceptable but unusual).
- **Very long edited messages**: capped (e.g., 500 chars) with a counter.
- **Emoji-only messages**: allowed.
- **Channel-specific limits** (e.g., X 280 chars): handled by the channel adapter (task 05), which may truncate intelligently.

## Privacy / LGPD

The user has full control over what they share. The default template doesn't contain anything beyond what's already public (the report's category, severity, address). Editing happens entirely on the device.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `league.template_edit_opened`      | User taps Editar                           | —                                     |
| `league.template_edit_saved`       | User saved a custom message                | `length_bucket`                       |
| `league.template_reset`            | User reset to default                      | —                                     |

## Tests

- **Unit**: default template renders correctly per category/severity; edit modal saves and resets; cap enforced.
- **Integration**: share with edited template uses the new text; resetting restores default.
- **A11y**: card and modal announced correctly.

## Definition of Done

- [ ] SuggestedMessageCard component
- [ ] EditMessageModal component
- [ ] Default template compose function
- [ ] Edit / save / reset flow
- [ ] Localized strings
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-league-ui-base.md`
- Share channels (consumes message): `05-share-channels.md`
- `CLAUDE.md`
