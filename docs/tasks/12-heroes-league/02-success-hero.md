# Heroes League · Success hero

> **Type:** Screen feature · UI + celebration
> **Screen:** SCREEN 12 · Heroes League
> **Effort:** M (1-2 days)
> **Dependencies:** `12-heroes-league/01-render-league-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`, `gamification`

## Context

The emerald gradient hero at the top of the screen. Centered: a white
circular checkmark badge, the protocol label ("PROTOCOLO #2847 ·
ENVIADO"), the headline ("Ótimo trabalho, herói!"), and a celebration
pill showing the XP and any unlocked medal ("+50 XP · 🏅 Olho Vivo
desbloqueada"). Small SVG confetti and sparkles decorate the gradient
to amplify the celebration without overwhelming.

This is the moment of payoff for the user — the more emotionally
resonant this lands, the more likely they'll share.

## User Story

**As a** Citizen who just submitted an identified report,
**I want** a satisfying, celebratory moment,
**In order to** feel my action mattered.

## Acceptance Criteria

### Scenario · Default render

**Given** the report was submitted successfully
**When** the hero renders
**Then** the background uses an emerald gradient (per design tokens)
**And** a 64dp circular checkmark badge appears centered, in white with translucency
**And** below it: protocol number, headline ("Ótimo trabalho, herói!"), and the XP/medal pill
**And** confetti and sparkles decorate the background (animated by default)

### Scenario · Animation on mount

**Given** the user just landed on the screen
**When** the hero mounts
**Then** the checkmark badge scales in (0.8 → 1.0) with a small spring
**And** the headline fades in with a slight upward translation
**And** the confetti animates in over 1-1.5 seconds
**And** medium haptic feedback fires once on mount (success haptic)

### Scenario · Reduced motion

**Given** the user has reduced motion enabled
**When** the hero renders
**Then** the elements appear in their final state immediately
**And** the confetti is static (decorative, not animated)
**And** the haptic still fires (it's tactile, not motion)

### Scenario · No medal

**Given** no medal was unlocked
**When** the pill renders
**Then** only the XP value is shown
**And** the medal segment is omitted cleanly

### Scenario · First-report bonus

**Given** this is the user's very first report ever
**When** the hero renders
**Then** the XP value reflects the first-time bonus
**And** the medal "🏅 Primeiro Reporte" is shown alongside any others
**And** the headline includes a small "Primeiro de muitos!" subtitle

### Scenario · Level-up celebration

**Given** the submit pushed the user across a level boundary
**When** the hero renders
**Then** an additional level-up indicator appears ("Você virou Vigilante!")
**And** the celebration adds a subtle level-up animation (e.g., a soft glow ring around the medal pill)
**And** the level change is announced for accessibility

### Scenario · Localization

**Given** the user's language is en-US
**When** the hero renders
**Then** the copy is in English ("Great work, hero!", "PROTOCOL #2847 · SENT", "+50 XP · 🏅 Sharp Eye unlocked")

### Scenario · Accessibility

**Given** screen reader is on
**When** the hero is read
**Then** the headline is announced as a heading ("Great work, hero!")
**And** the protocol number is announced
**And** the XP/medal pill is announced as a single fact ("Earned 50 XP and Sharp Eye medal")
**And** if level-up: "You're now a Watchman" is announced

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/HeroesLeague/
└── components/
    ├── SuccessHero.tsx
    ├── ConfettiBackground.tsx
    └── XpMedalPill.tsx
```

### Component behavior

- `SuccessHero` receives the protocol, XP granted, medal info, and a flag for first-report. It manages mount animations.
- `ConfettiBackground` is an SVG component with multiple shapes (circles, small triangles) at varying opacities and positions. It honors reduced motion.
- `XpMedalPill` is reused from `10-report-confirm/07-xp-medal-preview.md` (shared component in `packages/design_system`).

### Animation details

- Checkmark: spring scale + opacity.
- Confetti: staggered translation and rotation over 1-1.5s.
- Level-up indicator (when applicable): soft glow ring scales subtly.

### Performance

The hero is rendered once on mount and doesn't update reactively (the data is stable for the screen's lifetime).

## Backend

Not applicable to this task. The data is read from the screen's navigation params (set by `10-report-confirm/08`).

## Database

Not applicable directly.

## Edge Cases

- **Protocol not yet assigned**: rare timing issue; the placeholder "Protocolo · gerando…" is shown until assigned.
- **Medal data missing**: pill falls back to XP-only.
- **Very long medal name in en-US**: text wraps gracefully or truncates.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                  | When         | Props                                                               |
| ---------------------- | ------------ | ------------------------------------------------------------------- |
| `league.hero_rendered` | Hero mounted | `xp`, `medal_ids: [string]`, `first_report: bool`, `level_up: bool` |

## Tests

- **Unit**: renders correctly with all variants (with/without medal, first report, level up).
- **Snapshot**: each variant.
- **A11y**: announcements verified.
- **Performance**: mount animation under 1.5s on a mid-range device.

## Definition of Done

- [ ] SuccessHero component
- [ ] ConfettiBackground component (reduced motion respected)
- [ ] Reused XpMedalPill from design system
- [ ] Mount animations + haptic
- [ ] First-report and level-up variants
- [ ] Localized copy
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (shared components): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/
- React Native Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context

- Render UI base: `01-render-league-ui-base.md`
- XP/medal pill (shared): `10-report-confirm/07-xp-medal-preview.md`
- `CLAUDE.md`
