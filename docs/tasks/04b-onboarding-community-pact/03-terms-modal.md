# Onboarding · Citizen Pact · Terms modal

> **Type:** Screen feature · Shared UI (design-system promotion candidate)\
> **Screen:** SCREEN 04b · Onboarding · Citizen Pact\
> **Effort:** S (≤1 day)\
> **Dependencies:** `04b-onboarding-community-pact/01-render-community-pact-ui.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `database`, `screen`, `ui`, `lgpd`

## Context

A bottom-sheet modal showing the full platform terms text, opened from the sticky footer's "termos"
link. It's version-aware: it always displays the exact version and effective date it's showing, so
what the user reads matches what `04-accept-terms-gate.md` will record as accepted.

**Design-system note**: per `docs/engineering/design-system.md`'s reuse rule ("used by 2+ screens
lives in the design system"), this component has only one consumer in the current task catalog (this
screen). It ships **screen-local** for MVP. It is a strong promotion candidate the moment a second
consumer appears — Settings, Profile, or an LGPD privacy section will plausibly want the identical
look and behavior. This task documents the promotion criteria so whichever future task adds that
second consumer follows `design-system.md`'s promotion checklist (move the file to
`packages/design_system/src/molecules/`, add a Storybook story, generalize the props — e.g. rename
to `LegalTextModal` — re-export, update this screen's import) instead of copy-pasting a second
implementation.

## User Story

**As a** Citizen deciding whether to accept the platform's terms,\
**I want** to read the full text before I commit,\
**In order to** know exactly what I'm agreeing to.

## Acceptance Criteria

### Scenario · Opening the modal

**Given** the user taps the "termos" link in the footer\
**When** the tap registers\
**Then** a bottom sheet slides up showing: a title ("Termos da plataforma"), the exact version
identifier and effective date, the full scrollable terms text, and a close affordance (X button)\
**And** opening the sheet does **not** tick the acceptance checkbox — reading and accepting are two
independent actions, owned by two different tasks

### Scenario · No scroll-to-bottom gate

**Given** the terms text is long enough to require scrolling\
**When** the user opens the sheet\
**Then** the close button and dismiss gestures are available immediately — there is **no**
"must-scroll-to-the-bottom-to-enable-close" pattern\
**And** likewise, closing the sheet (having read some, all, or none of it) has no bearing on the
footer checkbox's state — the hard gate is the checkbox in task 04, not a scroll-completion signal
in this modal; don't build a scroll-lock here, it isn't in scope

### Scenario · Dismissing the modal

**Given** the sheet is open\
**When** the user taps the X, swipes the sheet down, or taps the scrim behind it\
**Then** the sheet closes without any side effect on the acceptance checkbox\
**And** focus returns to the terms link that opened it

### Scenario · Version and date always visible

**Given** the sheet is open\
**When** the user scrolls the body text\
**Then** the version identifier and effective date remain visible (sticky header inside the sheet),
so the user always knows exactly which version they're reading

### Scenario · Content fails to load

**Given** the terms text/version couldn't be fetched (network error) and no bundled fallback for the
current version exists on-device\
**When** the sheet opens\
**Then** an inline error state with a "Tentar de novo" retry appears inside the sheet — never a
blank or stale-looking body\
**And** the sheet remains open so the user isn't dropped back to the pact screen mid-error

### Scenario · Cached version, background refresh

**Given** the app has a bundled/cached copy of the terms for the version it already knows about, and
the backend has since published a newer version\
**When** the sheet opens\
**Then** the cached version renders immediately (no loading spinner blocking the read)\
**And** a background check silently refreshes if a newer version exists — if it turns out the user
was reading a stale version, task 04's re-validation at submit time (not this task) is what actually
enforces correctness

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user opens the sheet\
**Then** it's announced as a dialog with the title\
**And** the version/date and full body text are reachable via the reader\
**And** the close button is clearly labeled\
**And** the system back gesture/button closes the sheet like the X does

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Onboarding/CommunityPact/
└── components/
    └── TermsModal.tsx
```

### Behavior

- `TermsModal` accepts `version`, `effectiveDate`, `bodyText` (or an i18n content key), `isLoading`,
  `error`, `onRetry`, and `onClose` — a purely presentational component with no data fetching of its
  own and no acceptance side effects.
- It renders as a bottom sheet consistent with other sheets already speced in this batch (e.g., the
  waitlist sheet in `02-city-select/06-waitlist-coming-soon.md`) — same dismissal conventions (X,
  swipe-down, scrim tap), same underlying sheet primitive, so the app doesn't accumulate multiple
  bespoke sheet implementations.
- A sibling hook (`useCurrentTermsVersion`, shared with task 04) owns the actual fetch/cache logic
  and feeds this component its props; that hook is specified in `04-accept-terms-gate.md` since both
  tasks consume the same version data and duplicating the fetch would risk the two screens
  disagreeing about which version is "current."

## Backend (FastAPI)

### Endpoint

| Method | Path                  | Purpose                                               |
| ------ | --------------------- | ----------------------------------------------------- |
| GET    | `/api/v1/legal/terms` | Public, unauthenticated — current version + body text |

Response includes `version`, `effective_date`, and the body text per locale (`body_pt`, `body_en`,
or a single `body` resolved server-side from the `Accept-Language` header — either shape is
acceptable; pick one and keep it consistent with `00-foundation/13-i18n.md`'s pattern). This
endpoint must be reachable **unauthenticated**, since onboarding (and therefore this screen) can run
before signup completes.

### Caching

The response can be cached client-side (bundled fallback for the version the app shipped with, plus
whatever was last fetched) since terms text changes rarely; a `Cache-Control` header of a few hours
is reasonable.

## Database (PostgreSQL)

### `terms_versions` table

| Column           | Type        | Notes                     |
| ---------------- | ----------- | ------------------------- |
| `id`             | UUID PK     |                           |
| `version`        | varchar(20) | Unique, e.g. `2026-07-01` |
| `effective_date` | date        |                           |
| `body_pt`        | text        |                           |
| `body_en`        | text        |                           |
| `created_at`     | timestamptz |                           |

The row with the latest `effective_date` is "current." `04-accept-terms-gate.md` compares a user's
`terms_version_accepted` against this table's current row to decide whether re-acceptance is needed.

## Edge Cases

- **Terms published with a typo, needs a same-day correction**: publish a new row with a new
  `version`/`effective_date` rather than mutating an existing row — an accepted version's text must
  never change retroactively under an already-recorded `terms_version_accepted`.
- **Very long terms text on a small device**: the sheet caps at roughly 90% of screen height; the
  body scrolls independently of the version/date header.
- **Locale mismatch** (user's `Accept-Language` doesn't match any stored body): fall back to
  `body_pt` (the platform's primary language) rather than showing an empty body.

## Privacy / LGPD

- The terms text is itself the LGPD/consent disclosure surfaced to the user; legal/product must
  review and approve copy before this ships to citizens (see
  `docs/engineering/security-baseline.md`).
- This component collects no data; the acceptance record is `04-accept-terms-gate.md`'s
  responsibility.

## Analytics

| Event                                          | When         | Props               |
| ---------------------------------------------- | ------------ | ------------------- |
| `onboarding.community_pact.terms_modal_opened` | Sheet opens  | `version`           |
| `onboarding.community_pact.terms_modal_closed` | Sheet closes | `time_open_seconds` |

## Tests

- **Unit (frontend)**: renders version/date/body; close via X/swipe/scrim; error + retry state; no
  scroll-lock behavior present.
- **Unit (backend)**: endpoint returns the latest version by `effective_date`; locale fallback
  works; endpoint is reachable without auth.
- **Integration**: end-to-end fetch from a seeded `terms_versions` row.
- **A11y**: dialog semantics; back gesture closes the sheet.

## Definition of Done

- [ ] `TermsModal` component (screen-local for MVP; promotion criteria documented above)
- [ ] Bottom-sheet behavior (X / swipe-down / scrim dismiss), no scroll-lock
- [ ] `terms_versions` table + Alembic migration + seed data (at least one version)
- [ ] Public `GET /api/v1/legal/terms` endpoint
- [ ] Cached/bundled fallback for offline or slow-network opens
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Design system (promotion rule): `docs/engineering/design-system.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- LGPD (Brazilian data protection law): Lei nº 13.709/2018

### Project context

- Render UI: `01-render-community-pact-ui.md`
- Accept-terms gate (shared version hook, actual acceptance record): `04-accept-terms-gate.md`
- Waitlist sheet (sibling bottom-sheet convention): `02-city-select/06-waitlist-coming-soon.md`
- `CLAUDE.md`
