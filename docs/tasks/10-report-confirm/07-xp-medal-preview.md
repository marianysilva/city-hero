# Report Confirmation · XP / medal preview

> **Type:** Screen feature · UI + gamification preview
> **Screen:** SCREEN 10 · Report Confirmation
> **Effort:** S (≤1 day)
> **Dependencies:** `10-report-confirm/01-render-confirm-ui-base.md`, `10-report-confirm/06-identification-toggle.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `gamification`

## Context

A small two-line preview right above the "Enviar reporte →" CTA: the
first line reads "Você vai ganhar", and the second line shows the XP
delta and the medal (if applicable) the user will earn from this submit
("+50 XP · 🏅 Olho Vivo"). This anchors the action emotionally — the
user knows exactly what's at stake when they hit submit.

The preview is the same whether the user is submitting identified or
anonymous (anonymity isn't penalized).

## User Story

**As a** Citizen about to submit,
**I want** to see the reward I'll earn,
**In order to** feel acknowledged and motivated to act.

## Acceptance Criteria

### Scenario · Default render

**Given** the user has filled the required fields
**When** the preview renders
**Then** the first line shows "Você vai ganhar" in slate-500
**And** the second line shows "+50 XP" (brand-color, extrabold) followed by " · 🏅 Olho Vivo" when applicable
**And** the row sits directly above the CTA, in the sticky CTA bar

### Scenario · XP amount

**Given** the user is making a standard report
**When** the preview renders
**Then** XP is 50 (the configured value for new reports)
**And** the value adapts to special cases (e.g., the very first report grants a "Primeiro Reporte" bonus medal)

### Scenario · Medal eligibility

**Given** the user is about to unlock a medal (e.g., "5 Reportes")
**When** the preview renders
**Then** the medal name appears with its emoji
**And** if no medal is being unlocked, only the XP value is shown

### Scenario · No-photo path

**Given** the user came from manual report without a photo
**When** the preview renders
**Then** the XP is the same (the manual path doesn't penalize)
**And** the message is identical

### Scenario · Anonymous identical to identified

**Given** the user picked Anônima
**When** the preview renders
**Then** the XP value and medal are identical to the identified case
**And** there's no language suggesting Anônima earns less

### Scenario · First report celebration

**Given** this is the user's first ever report
**When** the preview renders
**Then** the medal "🏅 Primeiro Reporte" is shown
**And** the XP may include a small bonus (e.g., +20 XP first-time)

### Scenario · Streak indicator (future)

**Given** the user has been reporting regularly
**When** the preview renders
**Then** a streak indicator may appear ("🔥 3 dias seguidos")
**And** for MVP, this is out of scope (just XP + medal)

### Scenario · Accessibility

**Given** screen reader is on
**When** the preview renders
**Then** it's announced together with the CTA: "You'll earn 50 XP and the Olho Vivo medal. Send report."

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/ReportConfirm/
├── components/
│   └── XpMedalPreview.tsx
└── hooks/
    └── usePostSubmitRewards.ts
```

### Component behavior

- `usePostSubmitRewards` computes the rewards the user will earn based on their current state (number of reports so far, streaks, identity choice). It reads from the gamification store and the report context.
- `XpMedalPreview` is presentational with simple typography and the medal emoji.

### Rewards source

The reward configuration lives in a small static catalog (or a remote config in the future). For MVP:

- Base XP for a new report: 50.
- First report bonus: +20 XP and the "Primeiro Reporte" medal.
- 5th report: "Olho Vivo" medal (no XP bonus).
- 10th report: "Vigilante" medal.
- Enrich action (separate flow): +100 XP (per `07-civic-feed/08`).

### Visual style

A single horizontal row with brand-color emphasis on the XP value. Subtle, doesn't compete with the CTA.

## Backend (FastAPI)

The XP and medal values are stored as gamification configuration. The actual credit happens at submit time (task 08) — this preview is purely informational. The configuration source could be:

- A static catalog in code.
- A remote config endpoint that returns the current values per action type.

For MVP, a static catalog is sufficient.

## Database

The gamification tables (`xp_events`, `medals_unlocked`) are owned by the gamification flow (out of MVP scope to fully spec here; touched in task 08 of this folder and in the Citizen Profile screen tasks).

## Edge Cases

- **Server-side reward differs from client preview** (configuration drift): the client preview is what the user expects; if the server grants a different amount, the next time the user opens the app they'll see the actual XP. For consistency, deploy reward changes carefully.
- **Submission fails and rewards never credit**: the preview is "expected reward", not "guaranteed". On failure, no XP is granted.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `report_confirm.preview_rendered` | Preview computed and rendered           | `xp`, `medal_id`, `first_report: bool` |

## Tests

- **Unit**: rewards computed correctly across states (first report, nth report, anonymous, identified).
- **A11y**: announced with the CTA.

## Definition of Done

- [ ] XpMedalPreview component
- [ ] `usePostSubmitRewards` hook
- [ ] Rewards catalog
- [ ] First-report bonus path
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-confirm-ui-base.md`
- Identification toggle: `06-identification-toggle.md`
- Submit: `08-submit-and-bifurcate.md`
- Citizen Profile (where XP / medals live): `docs/tasks/28-citizen-profile/`
- `CLAUDE.md`
