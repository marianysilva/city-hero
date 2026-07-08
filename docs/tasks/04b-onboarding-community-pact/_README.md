# SCREEN 04b · Onboarding · Citizen Pact

> **Group:** 01 · Entry & Onboarding
> **Prototype screen:** `design/index.html` (search for `title: 'Onboarding · Pacto Cidadão'`)
> **Position in navigation:** Step 4 of 5 onboarding steps (between Gamification and Your Neighborhood)

## Overview

The fourth onboarding step. Before the user touches the camera, the
report flow, or the feed, the Pact establishes the social contract of
the platform: **CityHero is a community, not a partisan space; bad
behavior has real consequences; identity is verified via Gov.br; data is
protected under LGPD.**

The screen mixes four ingredients:

1. **Hero with an age-tailored message.** A single sentence chosen from
   four tone-of-voice variants (under 18 · 18+ · 30+ · 60+) — in
   production the variant is picked once from the Gov.br birth date;
   the prototype rotates them every 10 seconds purely for demo. The
   library on social-norm nudges (vs. shame/fear) drives the tone.
2. **Five pact cards.** Non-partisan community, monitored false
   reports, proportional consequences (XP / suspension / ban), Gov.br
   identity, LGPD data protection.
3. **Sticky footer with a hard gate.** A checkbox "Li e aceito os
   termos da plataforma" and a "Continuar →" CTA that stays disabled
   until the checkbox is ticked. The terms text opens in a bottom-sheet
   modal.
4. **Persistence of the acceptance.** Both the timestamp and the
   **version** of the terms accepted are stored so we can require a
   re-accept when legal updates ship.

This is the first onboarding step that **collects an explicit user
action with legal weight**, so its UI, telemetry, and persistence are
held to a higher bar than the other tutorial screens.

## Features (4 tasks)

| #   | Task                                                                                                  | Effort | Depends on                                                                      |
| --- | ----------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| 01  | [Render UI · header, hero, pact cards, sticky footer](./01-render-community-pact-ui.md)               | S      | `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md` |
| 02  | [Age-tailored hero message (Gov.br integration · demo rotator)](./02-age-tailored-message-rotator.md) | S      | task 01, `00-foundation/06-auth-system.md`                                      |
| 03  | [Terms modal (bottom-sheet, version-aware, candidate for shared component)](./03-terms-modal.md)      | S      | task 01                                                                         |
| 04  | [Accept-terms gate, persistence and CTA enablement](./04-accept-terms-gate.md)                        | S      | task 01, task 03, `03-onboarding-camera/02-onboarding-step-machine.md`          |

## Suggested implementation order

```
01 (UI scaffold) ──┬─→ 02 (age message via Gov.br · single-shot in prod)
                   ├─→ 03 (terms modal — promote to design system if reused)
                   └─→ 04 (checkbox + CTA gate + persist acceptance)
```

Tasks 02, 03 and 04 are independent of each other after task 01 lands;
they can ship in parallel.

## Product notes

- **Hard gate, not friction theatre.** The CTA stays disabled until the
  checkbox is ticked. This is the only point in onboarding where the
  user has to make an explicit legal commitment, so a deliberate
  speed-bump is the right shape — but the copy stays warm, not
  bureaucratic ("Aqui sua palavra tem peso", not "Termos de uso").
- **No "Pular" / Skip path.** Like the other onboarding steps, the user
  can go back to revisit step 3 (Gamification) but never skip ahead.
  The pact must be accepted to move forward.
- **One message per session, not four.** The prototype's 10-second
  rotation is **demo only** — in production the user sees one variant
  picked from their Gov.br birth date. Spec 02 makes this contract
  explicit so nobody ships the rotator to real users.
- **Terms versioning is required, not optional.** We store both
  `terms_accepted_at` and `terms_version_accepted`. When legal ships a
  new version, the routing decision (`01-splash/03-routing-decision.md`)
  re-routes the user back to this screen.
- **The modal is a reuse candidate.** A `TermsModal` (or generic
  `LegalTextModal`) likely belongs in `packages/design_system` —
  Settings, Profile, and the LGPD privacy section will all need to
  show terms with the same look and feel. Task 03 documents the
  decision criteria.
- **No partisan, no shame.** The "Comunidade, não política" card and
  the age-tailored hero are deliberate moves away from outrage-style
  copy. The brand voice here is civic pride, not finger-wagging.
- **Position shift.** Adding this screen renumbers onboarding from 4
  steps to 5; the `StepIndicator` molecule receives `{ step: 4, total:
5 }` here, and the existing state machine
  (`03-onboarding-camera/02-onboarding-step-machine.md`) must learn the
  new `community_pact` step key. Task 04 details the migration.
