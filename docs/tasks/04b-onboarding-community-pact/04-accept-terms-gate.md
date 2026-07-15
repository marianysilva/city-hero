# Onboarding · Citizen Pact · Accept-terms gate, persistence and CTA enablement

> **Type:** Screen feature · State + persistence + compliance gate\
> **Screen:** SCREEN 04b · Onboarding · Citizen Pact\
> **Effort:** S (≤1 day)\
> **Dependencies:** `04b-onboarding-community-pact/01-render-community-pact-ui.md`,
> `04b-onboarding-community-pact/03-terms-modal.md`,
> `03-onboarding-camera/02-onboarding-step-machine.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `screen`, `compliance`, `onboarding`

## Context

The actual hard gate behind SCREEN 04b: checkbox state, CTA enablement, and — once the user taps
"Continuar →" — persisting `terms_accepted_at` and `terms_version_accepted` to the user record (or
locally, merged on signup, for unauthenticated users). This is the first onboarding step that
collects an explicit action with legal weight, so its persistence is held to a higher bar than the
other tutorial screens: acceptance must be **confirmed persisted**, not just optimistically assumed,
before the user is allowed to move on.

This task also implements the **re-accept mode** consumed via `01-splash/03-routing-decision.md`'s
routing rule 7: when a returning, fully-onboarded user's `terms_version_accepted` is older than the
platform's current terms version, they land back on this screen (without the rest of the onboarding
chrome — see `01-render-community-pact-ui.md`'s re-accept scenario) and, once they accept, return to
Home (or a pending deep-link target) instead of advancing to step 5.

The `community_pact` step key already exists in the shared onboarding state machine
(`03-onboarding-camera/02-onboarding-step-machine.md` already lists it among the five stable keys) —
this task consumes that key; it does not need to migrate the state machine itself.

## User Story

**As a** Citizen completing onboarding,\
**I want** my acceptance of the platform's terms to be recorded reliably,\
**In order to** trust that my agreement counts and won't need to be redone by accident.

**As a** Product / Legal team,\
**I want** a returning user re-routed here whenever the terms change,\
**In order to** keep consent current without re-running the entire onboarding flow.

## Acceptance Criteria

### Scenario · CTA disabled by default

**Given** the screen just mounted\
**When** it renders\
**Then** the checkbox is unchecked and "Continuar →" is disabled

### Scenario · Ticking the checkbox enables the CTA

**Given** the checkbox is unchecked\
**When** the user taps it\
**Then** "Continuar →" becomes enabled immediately\
**And** unticking it disables the CTA again immediately — no debounce, since this is a legal gate,
not a UX nicety

### Scenario · Accepting in normal onboarding mode

**Given** the checkbox is ticked and the user taps "Continuar →"\
**When** the action runs\
**Then** `terms_accepted_at` (now) and `terms_version_accepted` (the version the terms modal showed)
are persisted — to the backend if authenticated, or to local storage (merged into the signup payload
later) if not, consistent with the pattern in `02-city-select/05-select-and-activate-tenant.md` and
`03-onboarding-camera/02-onboarding-step-machine.md`\
**And** only after persistence is confirmed does the state machine mark `community_pact` as seen and
advance to step 5 (Neighborhood) — navigation is **not** optimistic here, unlike lower-stakes
onboarding steps

### Scenario · Accepting in re-accept mode

**Given** the screen is in `re_accept` mode (arrived here via `01-splash/03-routing-decision.md`'s
rule 7, not via forward onboarding navigation)\
**When** the user accepts\
**Then** the same persistence happens (new `terms_accepted_at` + `terms_version_accepted`)\
**And** the app navigates to Home, or to the deep-link target that was pending, instead of to step
5\
**And** the onboarding step machine's `currentStep`/`seenSteps` are left untouched — this is a
re-acceptance, not a re-run of onboarding

### Scenario · Version changed between mount and submit (race)

**Given** the terms version was updated on the backend after this screen mounted but before the user
tapped "Continuar →"\
**When** the submit runs\
**Then** the client re-validates against the latest version at submit time (not just at mount)\
**And** the backend independently rejects an accept request carrying a stale version — the check is
enforced server-side, not only client-side\
**And** on a version mismatch, the checkbox resets, the terms/pact content refreshes, and a brief
message explains that the terms were just updated and need another look

### Scenario · Persist failure

**Given** the persistence call fails (network or 5xx)\
**When** the failure is detected\
**Then** the checkbox and CTA remain interactive (the user can retry) but navigation forward does
**not** happen until a persist attempt succeeds\
**And** an inline error with a "Tentar novamente" CTA appears\
**And** retries use backoff; repeated failures don't lock the user out of retrying manually

### Scenario · Re-accept mode entered unnecessarily (stale routing race)

**Given** the router sent the user here in `re_accept` mode, but on mount the user's
`terms_version_accepted` already matches the current version (a race between the routing decision
and a very recent acceptance elsewhere, e.g. another device)\
**When** the screen mounts\
**Then** it detects this immediately and routes forward without showing the gate again — the user is
never asked to re-accept something they already accepted

### Scenario · Unauthenticated signup merge

**Given** the user accepted the pact before signing up (onboarding can run before authentication —
see `02-city-select/05-select-and-activate-tenant.md`)\
**When** they later sign up\
**Then** the locally-held `terms_accepted_at` and `terms_version_accepted` are included in the
signup payload and stored on the new user record, the same way `onboarding_seen_steps` is merged
(per `03-onboarding-camera/02-onboarding-step-machine.md`)

### Scenario · No Skip path

**Given** the user is on this screen in `onboarding` mode\
**When** they look for a way out\
**Then** there is no "Pular" affordance anywhere — the only way forward is ticking the checkbox and
tapping "Continuar →"; the back button (to step 3) is the only other available action

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Onboarding/CommunityPact/
├── hooks/
│   ├── useAcceptTermsGate.ts
│   └── useCurrentTermsVersion.ts   ← shared with 03-terms-modal.md's modal
└── CommunityPactScreen.tsx         ← wires hero (task 02) + cards (task 01) + modal (task 03) + this gate
```

### Behavior

- `useCurrentTermsVersion` fetches/caches the current terms version (the same data
  `03-terms-modal.md`'s sheet displays) so both consumers agree on what "current" means; it's the
  single source of truth this task's version-mismatch check compares against.
- `useAcceptTermsGate` holds `checked: boolean`, derives `canContinue`, and exposes an async
  `acceptAndContinue()` that: re-validates the version is still current, persists via
  `PATCH /api/v1/auth/me` (authenticated) or the local onboarding store (unauthenticated, merged on
  signup), marks the state-machine step as seen via `useOnboardingNav` (only in `onboarding` mode),
  and resolves to a navigation instruction — "advance to step 5" or "return to Home/deep-link
  target" — depending on the `mode` prop passed down from the router.
- The hook does not navigate itself; it returns the instruction, and `CommunityPactScreen` calls the
  navigation layer per `01-splash/03-routing-decision.md`'s conventions (Expo Router's
  `router.replace`/`router.push` as appropriate for the destination).

## Backend (FastAPI)

### Fields on `users`

| Column                   | Type        | Notes                                                            |
| ------------------------ | ----------- | ---------------------------------------------------------------- |
| `terms_accepted_at`      | timestamptz | Set on every (re-)acceptance                                     |
| `terms_version_accepted` | varchar(20) | Matches a `terms_versions.version` row (see `03-terms-modal.md`) |

### Endpoint reuse

`PATCH /api/v1/auth/me` accepts both fields in its patch payload, alongside the other onboarding
fields already documented in `03-onboarding-camera/02-onboarding-step-machine.md` and
`05-onboarding-neighborhood/02-location-permission.md`. The backend validates that the submitted
`terms_version_accepted` matches the current row in `terms_versions` (from `03-terms-modal.md`) and
rejects (with a machine-readable `code`) if it's stale — this is what makes the client-side
version-mismatch scenario above actually enforceable, not just a UX nicety.

## Database

Two columns on `users` (above), added via a small Alembic migration with safe (`null`) defaults —
existing seeded users simply haven't accepted anything yet, which is a valid state (they'll be
routed here on next launch per the routing decision's rules).

## Edge Cases

- **Double-tap on "Continuar →"**: the second tap while a request is in flight is a no-op; the hook
  guards against concurrent submits.
- **App backgrounded mid-request**: the request continues; on foreground, the UI reflects whatever
  the (by-then-resolved) request outcome was.
- **Multi-device acceptance**: the server is authoritative — if the user accepted on another device
  first, this device's next check simply confirms they're already current (see the "entered
  unnecessarily" scenario above).
- **Terms version bumped, but the user never opened the modal to read it**: still allowed — reading
  is optional (see `03-terms-modal.md`), the checkbox is the only hard requirement, consistent with
  "hard gate, not friction theatre" from the screen's product notes.

## Privacy / LGPD

- `terms_accepted_at` + `terms_version_accepted` together are the auditable consent record required
  for LGPD compliance — this is the single most legally significant pair of fields in the onboarding
  flow.
- For MVP, only the **latest** acceptance is stored (no historical log of every past acceptance). A
  full acceptance-history table (mirroring the `auth_audit_log` gap already flagged in
  `00-foundation/06-auth-system.md`) is a reasonable v2 addition, not required for MVP launch.
- See `docs/engineering/security-baseline.md` for the broader consent/audit baseline this should
  eventually satisfy.

## Analytics

| Event                                              | When                           | Props                                      |
| -------------------------------------------------- | ------------------------------ | ------------------------------------------ |
| `onboarding.community_pact.checkbox_toggled`       | Checkbox ticked/unticked       | `checked: bool`                            |
| `onboarding.community_pact.accepted`               | Continue tapped, persisted OK  | `version`, `mode: onboarding \| re_accept` |
| `onboarding.community_pact.accept_failed`          | Persist failed                 | `code`                                     |
| `onboarding.community_pact.version_mismatch_retry` | Version changed at submit time | —                                          |

## Tests

- **Unit**: CTA enablement logic; version re-validation at submit; re-accept mode resolves to
  Home/deep-link instead of step 5; signup merge for unauthenticated acceptance; "already current"
  short-circuit in re-accept mode.
- **Unit (backend)**: `PATCH /api/v1/auth/me` rejects a stale `terms_version_accepted`; accepts and
  persists a current one.
- **Integration**: end-to-end accept with a mocked backend, both `onboarding` and `re_accept` modes.
- **E2E**: complete onboarding through this gate; bump the terms version server-side and confirm a
  returning authenticated user is routed back here per `01-splash/03-routing-decision.md`.

## Definition of Done

- [ ] `useAcceptTermsGate` hook with checkbox state + CTA enablement
- [ ] `useCurrentTermsVersion` hook shared with `03-terms-modal.md`
- [ ] Persistence (authenticated PATCH + unauthenticated local/signup-merge path)
- [ ] Re-accept mode routes to Home/deep-link instead of step 5
- [ ] Version re-validation at submit, enforced both client- and server-side
- [ ] Backend fields + migration + validation against `terms_versions`
- [ ] Telemetry per the table above
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI: `01-render-community-pact-ui.md`
- Terms modal (shared version data): `03-terms-modal.md`
- Onboarding state machine: `03-onboarding-camera/02-onboarding-step-machine.md`
- Splash routing decision (re-accept trigger, rule 7): `01-splash/03-routing-decision.md`
- Location permission (sibling PATCH-me field pattern):
  `05-onboarding-neighborhood/02-location-permission.md`
- `CLAUDE.md`
