# Onboarding · Citizen Pact · Render UI

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 04b · Onboarding · Citizen Pact\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The visual rendering of the fourth onboarding step (step 4 of 5): a header (back button + step
indicator), an age-tailored hero message, five pact cards (non-partisan community, monitored false
reports, proportional consequences, Gov.br identity, LGPD data protection), and a sticky footer with
a checkbox + "Continuar →" CTA.

This task is layout and styling only. The hero's actual message-selection logic is task
`02-age-tailored-message-rotator.md`, the terms bottom-sheet is task `03-terms-modal.md`, and the
checkbox/CTA gating + persistence is task `04-accept-terms-gate.md`. This screen receives all of
that as props/callbacks and renders it.

> Onboarding has **no Skip path** (see `03-onboarding-camera/02-onboarding-step-machine.md`). The
> user can go back to revisit step 3 (Gamification) but the pact must be accepted to move forward —
> there is no way to bypass this screen.

## User Story

**As a** Citizen completing onboarding,\
**I want** to clearly understand the platform's rules before I start reporting,\
**In order to** feel the community is fair and know what's expected of me.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen is the active onboarding step\
**When** it renders\
**Then** the status bar variant is `dark`\
**And** a back button sits at the top-left and the step indicator "Passo 4 de 5" at the top-right\
**And** a hero section shows a single age-tailored headline (the string is supplied by task 02; this
task renders whatever string it receives, without picking or rotating it)\
**And** five pact cards render in a fixed order: non-partisan community, monitored false reports,
proportional consequences (XP loss / suspension / ban), Gov.br identity verification, LGPD data
protection\
**And** a sticky footer shows a checkbox with the label "Li e aceito os termos da plataforma", the
word "termos" styled as a tappable link, and a "Continuar →" CTA

### Scenario · Pagination dots

**Given** this is step 4 of 5\
**When** the screen renders\
**Then** the fourth pagination dot is active (wider/colored); the others are small/neutral

### Scenario · CTA disabled until checkbox is ticked

**Given** the checkbox is unchecked (the default)\
**When** the screen renders\
**Then** the "Continuar →" CTA is visually disabled and does not respond to taps\
**And** ticking the checkbox is the only thing that enables it — the actual enablement logic lives
in task 04; this task just reflects the `canContinue` prop it's given

### Scenario · Tapping the terms link

**Given** the user taps the word "termos" in the footer label\
**When** the tap registers\
**Then** the terms bottom-sheet opens (delegated to task `03-terms-modal.md`)\
**And** opening the sheet does **not** tick the checkbox by itself — reading and accepting are
separate actions

### Scenario · Back button

**Given** the screen is rendered in normal (forward) onboarding flow\
**When** the user taps the back button\
**Then** the action delegates to the onboarding state machine, which goes back to step 3
(Gamification)

### Scenario · Re-accept mode (no back button, no pagination chrome)

**Given** the screen is rendered in "re-accept" mode (the user already completed onboarding once,
but the platform's terms version has changed since — see `01-splash/03-routing-decision.md`)\
**When** it renders\
**Then** the step indicator, pagination dots, and back button are all omitted (there is no "step 4
of 5" in this context — the user isn't mid-onboarding)\
**And** only the hero, pact cards, and footer gate render\
**And** the `mode` prop (`onboarding` | `re_accept`) is what the screen reads to decide this —
passed down by the router, not inferred locally

### Scenario · Long copy / small device

**Given** a smaller device (e.g., iPhone SE)\
**When** the screen renders\
**Then** the five pact cards scroll vertically inside the screen (the footer stays sticky, never
scrolling with the cards)\
**And** none of the pact card copy — especially the consequences and LGPD cards — is ever truncated;
legal/compliance copy must always be fully legible, unlike marketing copy elsewhere in onboarding

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the screen\
**Then** the hero headline is announced as a heading\
**And** each pact card is announced with its title and full body text\
**And** the checkbox is announced with its label and current checked state\
**And** the "Continuar →" CTA announces its disabled state when the checkbox is unchecked\
**And** the terms link is announced as a button that opens more information

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/Onboarding/CommunityPact/
├── CommunityPactScreen.tsx
├── CommunityPactScreen.styles.ts
├── CommunityPactScreen.test.tsx
└── components/
    ├── AgeTailoredHero.tsx
    ├── PactCard.tsx
    └── AcceptFooter.tsx
```

`StepIndicator` and `PaginationDots` are shared molecules in `@cityhero/design-system` (see
`docs/engineering/component-inventory.md` · Molecules). Consumed with `{ step: 4, total: 5 }` and
`{ total: 5, activeIndex: 3 }` respectively — only in `onboarding` mode (see the re-accept scenario
above).

### Component behavior

- The screen is presentational: it receives `mode` (`onboarding` | `re_accept`), `heroMessage`
  (string, from task 02), `termsChecked` + `onToggleTerms` + `canContinue` + `onContinue` (from task
  04), `onOpenTermsModal` (opens task 03's sheet), and `onBack` (from `useOnboardingNav`, only used
  in `onboarding` mode).
- `AgeTailoredHero` renders the headline it's given — it has no knowledge of age brackets or
  rotation; that's entirely task 02's concern.
- `PactCard` renders an icon, title, and body from fixed design copy (not dynamic per-user content);
  five instances compose the list, always in the same order.
- `AcceptFooter` is the checkbox + CTA row; it's a dumb component driven entirely by props — the
  actual gating state machine lives in task 04's hook.

### Theming

The screen background uses a tonal gradient consistent with the rest of the onboarding triplet. Pact
card icons use semantic colors (e.g., the LGPD card uses an info/shield tone) rather than the
playful category colors used elsewhere in the app — the tone here is trustworthy, not celebratory.

## Backend

Not applicable to this task (layout only). The terms text/version comes from task 03; the age
bracket comes from task 02; persistence comes from task 04.

## Database

Not applicable to this task.

## Edge Cases

- **Custom font not loaded**: fallback to system sans-serif while loading, without layout shift.
- **Pact card icon fails to load**: fallback to a neutral placeholder icon; the text content still
  fully conveys the meaning (icons are decorative, never load-bearing for comprehension).
- **Checkbox hit target on small devices**: the tappable area (checkbox + label) is at least 44×44dp
  even though the visual checkbox glyph is smaller.
- **Screen re-rendered with a different `mode` after mount** (shouldn't normally happen, but the
  screen doesn't assume `mode` is static): re-render cleanly shows/hides the chrome without a
  jarring layout jump.

## Privacy / LGPD

This screen renders the LGPD data-protection pact card, which is itself a compliance-facing
disclosure — its exact copy must be reviewed by legal/product before ship (see
`docs/engineering/security-baseline.md`). This task doesn't collect any data itself; acceptance
persistence is task 04's concern.

## Analytics

| Event                                         | When                     | Props  |
| --------------------------------------------- | ------------------------ | ------ |
| `onboarding.community_pact.viewed`            | Screen mounts            | `mode` |
| `onboarding.community_pact.back_pressed`      | User taps back           | —      |
| `onboarding.community_pact.terms_link_tapped` | User taps the terms link | —      |

(Checkbox toggling and the actual accept/continue event are owned by task 04.)

## Tests

- **Unit**: renders all five pact cards in the fixed order; pagination dot 4 active in `onboarding`
  mode; step chrome hidden in `re_accept` mode; CTA reflects the `canContinue` prop; terms link
  triggers `onOpenTermsModal`.
- **Snapshot**: light + dark, both modes.
- **A11y**: TalkBack/VoiceOver pass; checkbox and CTA states are announced correctly.

## Definition of Done

- [ ] CommunityPactScreen layout matching the prototype, in both `onboarding` and `re_accept` modes
- [ ] Five PactCard instances with final copy (pending legal/product review of the LGPD card)
- [ ] Sticky footer layout (checkbox + CTA), driven entirely by props
- [ ] StepIndicator + PaginationDots wired for `onboarding` mode; hidden in `re_accept` mode
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`

### Library / framework references

- React Native Reanimated (subtle card entrance):
  https://docs.swmansion.com/react-native-reanimated/

### Project context

- Prototype: `design/index.html` (search `title: 'Onboarding · Pacto Cidadão'`)
- Design tokens: `00-foundation/02-design-tokens.md`
- Age-tailored hero message: `02-age-tailored-message-rotator.md`
- Terms modal: `03-terms-modal.md`
- Accept-terms gate: `04-accept-terms-gate.md`
- Onboarding state machine: `03-onboarding-camera/02-onboarding-step-machine.md`
- Splash routing decision (re-accept trigger): `01-splash/03-routing-decision.md`
- `CLAUDE.md`
