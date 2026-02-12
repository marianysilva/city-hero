# Report Confirmation · Identification toggle (anonymous vs identified)

> **Type:** Screen feature · UI + state + bifurcation
> **Screen:** SCREEN 10 · Report Confirmation
> **Effort:** M (1-2 days)
> **Dependencies:** `10-report-confirm/01-render-confirm-ui-base.md`, `00-foundation/06-auth-system.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `lgpd`, `bifurcation`

## Context

The "Como se identificar" choice is one of the most consequential UX
moments in the product: does the report carry the user's identity
(visible in the feed, used for viral growth via the Liga de Heróis
screen) or is it anonymous (a 🥷 in the feed, the user's identity hidden
from neighbors but still visible to the prefecture per LAI)?

Both choices grant **the same XP** — anonymity isn't penalized. The
choice determines the **post-submit destination**: Identified →
SCREEN 12 (Liga de Heróis); Anonymous → SCREEN 11 (Envio Anônimo).

## User Story

**As a** Citizen,
**I want** to choose between identified and anonymous reporting,
**In order to** participate fairly without giving up privacy when I prefer not to.

## Acceptance Criteria

### Scenario · Default render

**Given** the user has reached this section
**When** it renders
**Then** a small label "Como se identificar" with a 🥷 icon appears
**And** two large tiles appear side by side: "Identificada" (default) and "Anônima"
**And** the default is "Identificada" — the user's identity is shown in the feed and on the Liga de Heróis screen

### Scenario · Default reasoning

**Given** identification policy:
**When** the screen mounts
**Then** the default is set based on the user's preference (if they set one in Settings) or "Identificada" otherwise
**And** anonymous users (not logged in, in the rare case they reach here) default to "Anônima"

### Scenario · Tap "Identificada"

**Given** the user taps Identificada
**When** the action runs
**Then** the tile becomes active (brand-color ring + tinted background)
**And** Anônima becomes inactive
**And** the secondary text reads "Perfil no feed · vira apoios e XP visível"

### Scenario · Tap "Anônima"

**Given** the user taps Anônima
**When** the action runs
**Then** the tile becomes active (violet-color ring + tinted background, to differentiate from brand)
**And** Identificada becomes inactive
**And** the secondary text reads "🥷 Herói Anônimo · XP mantida"

### Scenario · XP equivalence is honest

**Given** either choice is active
**When** the XP preview (task 07) renders
**Then** the XP value is identical for both choices
**And** the messaging makes this clear

### Scenario · Bifurcation prepared for submit

**Given** the user picked "Anônima"
**When** the submit action runs (task 08)
**Then** the post-submit navigation goes to SCREEN 11 (Envio Anônimo)
**And** the report payload includes `anonymous: true`

**Given** the user picked "Identificada"
**When** submit runs
**Then** the post-submit navigation goes to SCREEN 12 (Liga de Heróis)
**And** the payload includes `anonymous: false`

### Scenario · LAI disclosure on Anônima

**Given** the user taps Anônima for the first time
**When** the tile activates
**Then** a small hint appears once: "A prefeitura ainda vê seu nome (Lei de Acesso à Informação). Só os vizinhos não."
**And** the hint is dismissible and doesn't reappear

### Scenario · Persistence as default for future

**Given** the user is making this choice
**When** they submit
**Then** an optional follow-up question appears (later, in Liga / Envio Anônimo) asking if they want this to be their default
**And** if accepted, the choice persists in the user profile for next time

### Scenario · Anonymous report shows as 🥷 in feed

**Given** the user submitted Anônima
**When** the report appears in the feed (per `07-civic-feed/03-feed-item-card.md`)
**Then** it shows the anonymous variant — 🥷 avatar, "Herói Anônimo" label, no name
**And** the rest of the post (photo, description, location) is fully visible to neighbors

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the toggle
**Then** the section is announced as a group ("How to identify: Identified, selected; Anonymous, not selected")
**And** activating each option announces the new state
**And** the LAI disclosure is read as a live region

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/ReportConfirm/
├── components/
│   ├── IdentificationToggle.tsx
│   └── LaiDisclosureHint.tsx
└── hooks/
    └── useIdentificationChoice.ts
```

### Behavior

- `useIdentificationChoice` reads the user's default preference and exposes the current choice + a setter. It tracks whether the LAI hint was already shown for this user.
- `IdentificationToggle` is a two-tile selector with active state, secondary text, and a tap callback.
- `LaiDisclosureHint` is a small, dismissible message shown once when the user picks Anônima for the first time.

### Visual differentiation

The two tiles use distinct color schemes to make the choice tactile:

- Identified: brand-orange ring + brand-50 background.
- Anonymous: violet-500 ring + violet-50 background.

This isn't just aesthetic — the violet recalls the "shadow hero"
metaphor of the Envio Anônimo screen (per the project's design memory).

## Backend (FastAPI)

The report-create endpoint (task 08) accepts `anonymous: boolean`. The server enforces:

- For anonymous reports, the public response (feed, detail) masks the reporter's identity.
- The prefecture's view (manager panel) always sees the real reporter (per LAI).
- The user's XP is credited identically regardless of `anonymous`.

The user record optionally has a `default_anonymous: boolean` field for the persisted preference.

## Database

The `reports.anonymous` column is a boolean (defaults to false). The `users.default_anonymous` column is also a boolean (defaults to false). Both are owned by the report-creation and auth flows respectively.

## Edge Cases

- **User toggled the choice multiple times before submit**: only the final state at submit counts.
- **User had `default_anonymous` set in Settings**: the toggle defaults to Anonymous accordingly.
- **Anonymous on a guest account** (no logged-in user): the toggle still works; the report is created with a placeholder anonymous identity tied to the device.
- **Anonymous report deleted later by user**: the user record can be matched to the report internally (for the prefecture and audit), but the public view stays anonymized.

## Privacy / LGPD

This task is a **key privacy control**. Specific guarantees:

- The user's identity is hidden from other citizens in the feed when Anônima is chosen.
- The prefecture's access is governed by LAI (Lei 12.527/2011) and is logged for audit.
- The LAI disclosure ensures the user understands the limit of anonymity.
- The user can later request anonymization of a previously-identified report (out of MVP scope; future feature).

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `report_confirm.identification_changed` | User toggled                          | `to: identified|anonymous`           |
| `report_confirm.lai_disclosure_shown` | First time anonymous picked              | —                                     |
| `report_confirm.lai_disclosure_dismissed` | User dismissed                       | —                                     |

## Tests

- **Unit**: toggle state transitions; default read from user preference; LAI hint shown once.
- **Integration**: anonymous + identified routes navigate correctly (verified in task 08).
- **A11y**: toggle announced as a group; LAI hint as live region.

## Definition of Done

- [ ] IdentificationToggle component
- [ ] `useIdentificationChoice` hook with default + persistence
- [ ] LaiDisclosureHint (one-time)
- [ ] Default preference read/written
- [ ] Bifurcation target captured in submit payload
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Privacy / LGPD (Lei de Acesso à Informação): `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-confirm-ui-base.md`
- Auth system: `00-foundation/06-auth-system.md`
- Submit / bifurcation: `08-submit-and-bifurcate.md`
- Envio Anônimo screen: `docs/tasks/11-anonymous-send/`
- Liga de Heróis screen: `docs/tasks/12-heroes-league/`
- Feed card anonymous variant: `07-civic-feed/03-feed-item-card.md`
- `CLAUDE.md`
