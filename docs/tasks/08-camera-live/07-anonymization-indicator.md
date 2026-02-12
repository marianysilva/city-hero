# Camera · Anonymization preview indicator (LGPD)

> **Type:** Screen feature · Compliance signal
> **Screen:** SCREEN 08 · Camera with AI (live)
> **Effort:** S (≤1 day)
> **Dependencies:** `08-camera-live/01-render-camera-ui-base.md`, `00-foundation/08-anonymization-pipeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `lgpd`, `compliance`

## Context

The small green-dot badge "ANONIMIZAÇÃO ATIVA" at the top of the camera
screen is a **deliberate, constant trust signal** for LGPD compliance.
It tells the citizen that faces, license plates, and other sensitive
content will be automatically blurred before any photo becomes public —
without having to read a privacy policy.

Tapping the badge opens a short, friendly explainer modal: what is
anonymized, what isn't, who sees what. This is a key transparency
moment — it's the difference between "I trust this app" and "what
happens to my data?".

## User Story

**As a** Citizen aiming the camera at a public scene,
**I want** a visible reminder that the app protects identities,
**In order to** report confidently without worrying about exposing bystanders.

## Acceptance Criteria

### Scenario · Badge always visible

**Given** the camera screen is rendered
**When** the user is in any state (loading, viewfinder active, detection on, capturing)
**Then** the "ANONIMIZAÇÃO ATIVA" badge is visible in the top bar
**And** the small green dot pulses subtly (reduced-motion: static dot)
**And** the badge respects the design tokens (dark translucent background, white text)

### Scenario · Tap the badge

**Given** the badge is visible
**When** the user taps it
**Then** a small modal sheet appears with friendly explainer copy
**And** the explainer covers: what is blurred (faces, license plates, document numbers, name tags), what isn't (the problem you're reporting), who sees what (citizens see the anonymized version; the prefecture has audited access to the original for legitimate cases), and a link to the full privacy policy

### Scenario · Dismiss the explainer

**Given** the explainer modal is open
**When** the user taps "Entendi" or swipes down
**Then** the modal closes
**And** the camera remains in its previous state

### Scenario · First-session emphasis

**Given** the user is opening the camera for the very first time
**When** the screen renders
**Then** the badge briefly highlights (a soft glow + slight scale) for ~2s
**And** doesn't auto-open the explainer (the user discovers it organically)
**And** the highlight runs only once per install

### Scenario · Indicator never lies

**Given** the system is in any state where anonymization is required for the eventual upload
**When** the badge is visible
**Then** the upload pipeline always applies anonymization before public visibility
**And** there is no code path that bypasses the pipeline
**And** the badge is **never** rendered if the pipeline is disabled (which, in MVP, never happens — it's mandatory)

### Scenario · Localized copy

**Given** the user's language is pt-BR
**When** the badge and explainer render
**Then** copy is in Portuguese
**And** in en-US, copy is in English

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the badge
**Then** it's announced as "Anonimização ativa, abre detalhes" (button role)
**And** activating it announces the modal opening
**And** the modal's content is read in order

### Scenario · Color contrast

**Given** any background the viewfinder might show (bright sky, dark indoors)
**When** the badge renders
**Then** contrast remains legible (≥ WCAG AA)
**And** the dark translucent background ensures consistency

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/Camera/
└── components/
    └── AnonymizationExplainerModal.tsx
```

The "ANONIMIZAÇÃO ATIVA" indicator itself is **not** a screen-local
component — it's a `<Badge>` composition from `@cityhero/design-system`
(see `docs/engineering/component-inventory.md` · Badge section, row
"Anonymization active"): a pulsing pill with a dot + label, rendered
via children. No `AnonymizationBadge` file in the screen folder.

### Component behavior

- The indicator is rendered in the camera top bar (handled by the top bar component from task 01 via a slot).
- The `<Badge>`'s `pulse` prop is suppressed when the OS reports reduced-motion preferences.
- `onPress` opens `AnonymizationExplainerModal`, a small bottom sheet with the explainer content and a single "Entendi" CTA. It's lazy-loaded.
- The first-session emphasis is governed by a per-install flag (AsyncStorage).

### Copy (pt-BR / en-US)

The badge label is short ("ANONIMIZAÇÃO ATIVA" / "ANONYMIZATION ON"). The explainer is intentionally short — 4-5 lines max — so users actually read it.

## Backend

This task does not call the backend. The pipeline it claims to enforce is owned by `00-foundation/08-anonymization-pipeline.md`.

## Database

Not applicable.

## Edge Cases

- **Reduced motion**: the dot is static; the first-session highlight is omitted.
- **Tap target near the back button**: a small invisible padding ensures the badge has its own clearly hit-table area without overlapping the back button's target.
- **Modal open during capture**: the capture is allowed; the modal closes automatically.
- **Modal open when navigating away**: closes cleanly.

## Privacy / LGPD

- The badge is a transparency device — its presence is part of the LGPD compliance posture.
- The explainer's claims must match the actual implementation (`00-foundation/08`). Discrepancy is a legal risk.
- The link to the privacy policy must always point to the current canonical URL.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `camera.anonymization_badge_shown` | Camera mounts                              | `first_session: bool`                 |
| `camera.anonymization_badge_tapped`| User taps the badge                        | —                                     |
| `camera.anonymization_explainer_dismissed` | User closes the modal              | `via: cta|swipe`                     |
| `camera.privacy_policy_opened`     | User taps the policy link                  | —                                     |

## Tests

- **Unit**: badge renders correctly; reduced-motion variant; first-session highlight runs only once.
- **Integration**: tap opens modal; close path; link opens external browser (mocked).
- **A11y**: badge labeled with action; modal content announced.

## Definition of Done

- [ ] `<Badge>` composition wired into the camera top-bar slot (no screen-local badge component)
- [ ] AnonymizationExplainerModal component with copy in pt-BR + en-US
- [ ] First-session highlight via per-install flag
- [ ] Reduced-motion respected
- [ ] Privacy policy link wired
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native AccessibilityInfo: https://reactnative.dev/docs/accessibilityinfo
- Bottom Sheet (`@gorhom/bottom-sheet`): https://gorhom.dev/react-native-bottom-sheet

### Project context
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- Render UI base: `01-render-camera-ui-base.md`
- `CLAUDE.md`
