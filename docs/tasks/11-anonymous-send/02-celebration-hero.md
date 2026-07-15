# Anonymous Send · Celebration hero

> **Type:** Screen feature · UI + celebration\
> **Screen:** SCREEN 11 · Anonymous Send\
> **Effort:** S (≤1 day)\
> **Dependencies:** `11-anonymous-send/01-render-anonymous-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`, `gamification`

## Context

The violet/indigo gradient hero at the top of the screen. It includes a 🥷 emoji icon in a soft
frame, the protocol number ("Protocolo #2847 · envio anônimo"), a headline ("Você age como ninja. O
problema foi exposto."), and a small pill showing the XP and any unlocked medal ("+50 XP · 🏅 Olho
Vivo desbloqueada"). Subtle decorative blobs in the background add depth without distracting.

## User Story

**As a** Citizen who just submitted anonymously,\
**I want** a clear, calm celebration of my action,\
**In order to** feel acknowledged without feeling exposed.

## Acceptance Criteria

### Scenario · Default render

**Given** the report was submitted successfully\
**When** the hero renders\
**Then** the gradient background uses violet→indigo (per design tokens)\
**And** a 🥷 icon appears in a soft translucent frame\
**And** the protocol number is shown in small caps ("PROTOCOLO #2847 · ENVIO ANÔNIMO")\
**And** the headline reads "Você age como ninja. O problema foi exposto."\
**And** a pill with a pulsing emerald dot shows the XP and medal ("+50 XP · 🏅 Olho Vivo
desbloqueada")

### Scenario · No medal unlocked

**Given** the submit didn't unlock a new medal\
**When** the pill renders\
**Then** it shows only the XP ("+50 XP")\
**And** the medal segment is omitted

### Scenario · First-time anonymous submit

**Given** this is the user's first ever anonymous submission\
**When** the hero renders\
**Then** a small first-time hint appears below the headline ("Bem-vindo aos Heróis Anônimos")\
**And** the hint shows once per user (persisted server-side)

### Scenario · Protocol number

**Given** the backend returned a protocol number for the report\
**When** the hero renders\
**Then** the protocol is displayed (matches what the prefecture will use as a reference)\
**And** if the protocol is not yet assigned (rare race), a friendly placeholder appears ("Protocolo
· gerando…")

### Scenario · Localization

**Given** the user's language is en-US\
**When** the hero renders\
**Then** copy is in English ("You act like a ninja. The problem is exposed.")

### Scenario · Reduced motion

**Given** the user has reduced motion enabled\
**When** the hero renders\
**Then** the decorative blobs and pulsing dot are static\
**And** the visual hierarchy remains the same

### Scenario · Accessibility

**Given** screen reader is on\
**When** the hero is read\
**Then** the headline is announced as a heading\
**And** the XP/medal pill is announced ("Earned 50 XP and Olho Vivo medal")\
**And** the protocol number is announced

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/AnonymousSend/
└── components/
    ├── CelebrationHero.tsx
    └── DecorativeBlobs.tsx
```

### Component behavior

- `CelebrationHero` receives the report's protocol, the XP granted, and the medal info as props.
- `DecorativeBlobs` is a small SVG component honoring reduced motion.
- The hero is purely presentational — no data fetching.

### Visual details

- Gradient: violet 900 → indigo 900 → indigo 500 (tonal range that suggests depth).
- The 🥷 frame uses a white/15 backdrop blur with a subtle inner ring.
- Decorative circles in white/12 opacity at varying sizes.

## Backend

Not applicable.

## Database

Not applicable directly. The protocol number is the report's slug (owned by the report-creation
flow).

## Edge Cases

- **Very long medal name**: text truncates with ellipsis after one line; consider a smaller font
  size.
- **Custom font not loaded**: fallback gracefully.
- **The hint's first-time flag write fails**: the hint shows again next time; not blocking.

## Privacy / LGPD

The hero doesn't expose any PII; the protocol is non-identifying.

## Analytics

| Event                          | When         | Props                                |
| ------------------------------ | ------------ | ------------------------------------ |
| `anonymous_send.hero_rendered` | Hero mounted | `xp`, `medal_id`, `first_time: bool` |

## Tests

- **Unit**: renders with/without medal; first-time hint logic.
- **Snapshot**: with and without medal.
- **A11y**: headline as a heading; pill announced.

## Definition of Done

- [ ] CelebrationHero component
- [ ] DecorativeBlobs respecting reduced motion
- [ ] First-time hint
- [ ] Localization
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-anonymous-ui-base.md`
- `CLAUDE.md`
