# Onboarding · Citizen Pact · Age-tailored hero message

> **Type:** Screen feature · Content logic\
> **Screen:** SCREEN 04b · Onboarding · Citizen Pact\
> **Effort:** S (≤1 day)\
> **Dependencies:** `04b-onboarding-community-pact/01-render-community-pact-ui.md`,
> `00-foundation/06-auth-system.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `frontend`, `screen`, `content`

## Context

The hero message has four tone-of-voice variants, one per age bracket: **under 18**, **18–29**,
**30–59**, **60+**. The library on social-norm nudges (vs. shame/fear) drives the tone of each
variant — none of them lecture or threaten; they invite. Exactly **one** variant renders per
session, chosen from the user's birth date. There is no rotation in production — a 10-second demo
rotator exists only in the design prototype and must never ship to real users.

**Reconciling this task against what's actually built**: `00-foundation/06-auth-system.md` documents
that Gov.br SSO (the originally planned source of a verified birth date) is **not implemented and
deferred** — no `/auth/govbr/*` routes, no CPF field, no birth-date field on `users` at all today.
This task cannot block on Gov.br shipping first. Instead, it adds its own minimal, provider-agnostic
`birth_date` field to the user record (nullable, optional) and degrades gracefully to a neutral
default variant whenever no birth date is on file — which, in the MVP, will be the common case,
since no signup screen in the current task catalog collects it yet either. When Gov.br SSO (or any
other birth-date source) eventually ships, it simply becomes another writer of the same field; this
task doesn't need to change.

## User Story

**As a** Citizen completing onboarding,\
**I want** the pact's tone to feel like it's speaking to me,\
**In order to** take the platform's rules personally rather than as boilerplate.

**As a** Product Owner,\
**I want** the demo rotator to be structurally impossible to ship to production,\
**In order to** avoid real users ever seeing four different tones flash by in one sitting.

## Acceptance Criteria

### Scenario · Birth date on file

**Given** the current user's record has a `birth_date`\
**When** the hero mounts\
**Then** the age is computed from `birth_date` as of today\
**And** exactly one of the four variants is selected based on the bracket the age falls into\
**And** that single string is rendered for the entire time the user is on this screen — it never
changes mid-session

### Scenario · Bracket boundaries

**Given** an age is computed\
**When** the bracket is resolved\
**Then** the boundaries are inclusive on the lower bound and non-overlapping: **under 18** (0–17),
**18–29**, **30–59**, **60+** — an age of exactly 18 falls into "18–29", exactly 30 falls into
"30–59", exactly 60 falls into "60+"

### Scenario · No birth date on file (the common MVP path)

**Given** the current user's record has no `birth_date` (unauthenticated user, or an authenticated
user who signed up before this field existed, or Gov.br SSO isn't live yet)\
**When** the hero mounts\
**Then** the neutral **18–29** variant renders (the least presumptuous, general-audience tone)\
**And** no error or loading state is shown — the fallback is instant and silent\
**And** a telemetry event notes the fallback was used (bracket only, never raw data)

### Scenario · Demo rotator is dev-only

**Given** a developer build with the internal `communityPactMessageRotatorDemo` feature flag
enabled\
**When** the hero mounts\
**Then** it cycles through all four variants every 10 seconds, purely for design/demo review\
**And** the flag defaults to **off**, is stripped from release builds, and this task's Definition of
Done requires verifying it is absent from a production build — this rotator must never be visible to
a real citizen

### Scenario · Invalid or future birth date

**Given** the stored `birth_date` is in the future or otherwise fails a basic sanity check\
**When** the hero resolves a bracket\
**Then** it's treated the same as "no birth date on file" — the neutral default renders, and a
data-quality telemetry event fires (no user-facing error)

### Scenario · Birthday passes between sessions

**Given** the user's age crosses a bracket boundary since their last session (e.g., they turned 18,
or they're in `re_accept` mode after their next birthday)\
**When** the hero mounts again\
**Then** the bracket is recomputed fresh from `birth_date` — nothing about the previous session's
resolved variant is cached or reused

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Onboarding/CommunityPact/
└── hooks/
    └── useAgeTailoredMessage.ts
```

### Behavior

- The hook reads the current user (if any) from the auth store, computes the bracket from
  `birth_date` when present, and returns the single matching copy string plus the resolved bracket
  (for telemetry).
- When no `birth_date` is available, it returns the "18–29" neutral copy immediately — there is no
  loading state to wait on for this decision.
- The dev-only rotator is a separate code path gated by
  `__DEV__ && featureFlags.communityPactMessageRotatorDemo` (see `00-foundation` feature-flag
  conventions once that task exists); when the flag is off (always true in production), the hook
  behaves exactly as described above with no cycling.
- The hook does not fetch anything over the network by itself — it reads whatever user record is
  already in the app's auth/profile state (populated by `00-foundation/06-auth-system.md`'s
  `GET /users/me` equivalent, once that includes `birth_date`).

## Backend (FastAPI)

### Field on `users`

| Column       | Type           | Notes                                                         |
| ------------ | -------------- | ------------------------------------------------------------- |
| `birth_date` | date, nullable | Optional; absent for most users until a collection path ships |

### Endpoint reuse

The existing `PATCH /api/v1/auth/me` (see `00-foundation/06-auth-system.md`) accepts `birth_date` in
its patch payload alongside the other profile fields already documented there (once that endpoint's
target design is built — see that task's Status notes on what's actually implemented today). No new
endpoint is introduced by this task.

**Explicitly out of scope for this task**: building a signup/profile UI field to actually collect
`birth_date` from the user, and the Gov.br SSO integration that would eventually supply it
authoritatively. Both are tracked against `00-foundation/06-auth-system.md`. This task only defines
the column and consumes it if/when it's populated by either path.

## Database

The nullable `birth_date` column on `users`, added via a small Alembic migration with no default
(absence is a valid, expected state, not an error).

## Edge Cases

- **Unauthenticated user reaches this screen** (the onboarding flow can run before signup completes
  — see `02-city-select/05-select-and-activate-tenant.md`'s anonymous-selection pattern): there is
  no user record at all yet, so the neutral default renders; no backend call is attempted.
- **Clock skew / device time wrong**: age computation uses device time; a wildly wrong device clock
  could misclassify the bracket, but this is an acceptable, low-stakes failure mode (worst case: a
  slightly different but still respectful tone).
- **Rotator flag leaks into a release build**: treated as a shipping blocker, not a cosmetic bug —
  see Definition of Done.

## Privacy / LGPD

- `birth_date` is PII that reveals exact age; it is used **only** to select a coarse bracket
  client-side and is never sent to analytics or logged — only the resolved bracket name is (see
  Analytics below).
- Storing `birth_date` at all is a minimal addition scoped strictly to this feature; if Gov.br SSO
  later becomes the authoritative source, this field is simply overwritten, not duplicated.

## Analytics

| Event                                             | When                          | Props     |
| ------------------------------------------------- | ----------------------------- | --------- |
| `onboarding.community_pact.hero_variant_shown`    | Hero mounts, variant resolved | `bracket` |
| `onboarding.community_pact.birthdate_unavailable` | Neutral default used          | —         |

## Tests

- **Unit**: bracket computation at each boundary (17/18, 29/30, 59/60); neutral default when
  `birth_date` is absent, invalid, or in the future; rotator never activates unless the dev flag is
  explicitly true.
- **Integration**: hook reads the current user's `birth_date` from the auth store correctly across
  authenticated and unauthenticated states.
- **Build check**: a CI assertion (or manual release checklist item) confirming the rotator flag
  defaults to false and is not toggleable from a production build.

## Definition of Done

- [ ] `useAgeTailoredMessage` hook with the four fixed copy variants
- [ ] Neutral "18–29" default when no birth date is available (the common MVP path)
- [ ] `birth_date` column + `PATCH /api/v1/auth/me` support (coordinated with
      `00-foundation/06-auth-system.md`)
- [ ] Demo rotator gated behind a dev-only flag, verified absent/inert in production builds
- [ ] Privacy-safe telemetry (bracket only, never raw birth date or age)
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Gov.br SSO context (deferred, not yet built): `00-foundation/06-auth-system.md`

### Project context

- Render UI: `01-render-community-pact-ui.md`
- Auth system (birth-date field coordination, Gov.br deferral): `00-foundation/06-auth-system.md`
- `CLAUDE.md`
