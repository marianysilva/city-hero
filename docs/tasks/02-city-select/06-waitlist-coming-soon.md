# City Select · Waitlist for "coming soon" cities

> **Type:** Screen feature · Growth / lead capture
> **Screen:** SCREEN 02 · Choose City
> **Effort:** S (≤1 day)
> **Dependencies:** `02-city-select/02-cities-catalog-api.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `growth`

## Context

Cities not yet active are listed as "coming soon" — both an honest promise
and a sales tool. When a user from a coming-soon city expresses interest,
we capture their email/phone and city so we can:

1. Notify them when CityHero is live in their city.
2. Show prefectures real demand from their constituents (powerful sales
   evidence).
3. Prioritize expansion based on demand.

The waitlist is also the fallback when GPS detection lands outside any
catalog city ("we don't support your city yet — sign up for updates").

## User Story

**As a** Citizen in a city that's coming soon,
**I want** to be notified when CityHero arrives,
**In order to** start using it on day one without searching again.

**As a** Product / Growth team,
**I want** to capture demand signals,
**In order to** prioritize city onboarding and have data to share with prospective prefectures.

## Acceptance Criteria

### Scenario · Tap a coming-soon city

**Given** the list shows coming-soon cities
**When** the user taps one
**Then** a bottom sheet (or modal) opens with:
  - Contextual copy ("Em breve em Bombinhas. Quer ser avisado?")
  - Email field (required; pre-filled if the user is already authenticated)
  - Optional phone field (Brazilian format, mask applied)
  - "Avise-me" CTA
  - Small disclosure about how the data is used

### Scenario · Submit waitlist form

**Given** the user fills the email and submits
**When** the request goes through
**Then** the backend stores the entry: city, email, optional phone, source (`tap_row` | `gps_no_match` | `search_no_result`), referrer (utm_source if any)
**And** the sheet shows a brief "Pronto · te avisamos" success state with a celebratory micro-animation
**And** the user returns to the screen and can continue picking another city or skip

### Scenario · Already on the waitlist for that city

**Given** the user already submitted for the same city in the past
**When** they submit again
**Then** the backend handles it idempotently (no duplicate row)
**And** the success state shows "Já tá registrado · te avisamos quando lançarmos"

### Scenario · GPS no match → waitlist with coordinates

**Given** GPS detection found no matching city
**When** the user opts to join the waitlist via the GPS card
**Then** the form is pre-filled with the device's coordinates (with explicit consent)
**And** the backend stores the coordinates so the team can identify clusters of demand outside catalog

### Scenario · Search no result → waitlist with the typed query

**Given** the user searched for a city not in the catalog
**When** they tap "Avise-me quando tiver" from the empty-search state
**Then** the form opens with the typed query as a hint ("Avise sobre {query}?")
**And** on submit, the backend stores the typed query in the entry's `requested_city_name` field

### Scenario · Validation errors

**Given** the user submits an invalid email or invalid phone
**When** the form runs validation
**Then** inline errors appear next to the offending field
**And** the submit button is disabled until validation passes

### Scenario · Privacy disclosure

**Given** the user is filling the form
**When** they read the disclosure
**Then** the copy clearly states: "Vamos te enviar um único email quando lançarmos. Sem spam. Pode descadastrar."
**And** a link to the privacy policy is present

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the form
**Then** every field has an associated label
**And** errors are announced as the user navigates to the offending field
**And** the success state is announced

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CitySelect/
├── components/
│   └── WaitlistSheet.tsx
└── hooks/
    └── useJoinWaitlist.ts
```

The sheet is opened by:

- Tapping a coming-soon city in the list.
- Tapping the GPS card's "Avise-me" CTA when the GPS match is on a coming-soon city or no match.
- Tapping the empty-search "Avise-me" CTA.

The hook `useJoinWaitlist` wraps a TanStack Query mutation against the backend, with optimistic UI on success.

### Form

- Email: required, validated with a permissive regex (RFC-5322 compatible).
- Phone: optional, masked as `(DD) 9XXXX-XXXX`.
- Hidden context: `source`, `requested_city_name` (for unknown city), and (with consent) `coords`.

## Backend (FastAPI)

### Endpoint

| Method | Path                              | Purpose                            |
|--------|-----------------------------------|-------------------------------------|
| POST   | `/api/v1/waitlist`                | Submit a waitlist entry            |

The endpoint accepts the form fields plus context. The backend:

- Validates email/phone format.
- Upserts (idempotent) on `(email, target)` where `target` is either a known city ID or the typed query / coordinates.
- Optionally enqueues a confirmation email ("Anotamos · te avisamos quando chegar").
- Rate-limits per IP (e.g., 5 entries per minute) to prevent abuse.

The endpoint is **public** (no auth required) so first-time installers can also use it.

## Database (PostgreSQL)

### `waitlist_entries` table

| Column                  | Type          | Notes                                                    |
|-------------------------|---------------|----------------------------------------------------------|
| `id`                    | UUID PK       |                                                          |
| `email`                 | varchar(255)  | Required                                                 |
| `phone`                 | varchar(20)   | Optional                                                  |
| `target_city_id`        | UUID FK       | Set when the user picked a known coming-soon city        |
| `requested_city_name`   | varchar(120)  | Set when the user typed a free-form name                  |
| `coords`                | geography(Point) | Optional, with consent                                |
| `source`                | varchar(30)   | `tap_row`, `gps_no_match`, `search_no_result`             |
| `utm_source`            | varchar(60)   | If the user came from a campaign                          |
| `consent_at`            | timestamptz   | Explicit consent timestamp                                |
| `created_at`            | timestamptz   |                                                           |
| `notified_at`           | timestamptz   | Set when we email them about availability                 |

A unique constraint on `(email, target_city_id)` (when both present) prevents duplicates.

## Edge Cases

- **User submits multiple times same email + same city**: idempotent upsert, no duplicate.
- **Email blacklisted (typo, disposable)**: rejected with a clear message.
- **No `target_city_id` and no `requested_city_name`**: the entry is associated with coordinates only — useful for clustering analysis.
- **Coordinates without consent**: the form does not include them; the backend rejects entries with coords if `consent_at` isn't set.
- **Privacy policy link 404**: the team's URL must be valid; CI lints for it.

## Privacy / LGPD

- Email and phone are PII. The endpoint requires explicit consent (`consent_at`), and the disclosure is visible in the form.
- Entries are kept only as long as needed for the notification purpose; after launching in their city and notifying them, entries can be auto-deleted (or kept anonymized if useful for analytics).
- No tracking pixels in the confirmation email.

## Analytics

| Event                          | When                                       | Props                                  |
|--------------------------------|--------------------------------------------|-----------------------------------------|
| `waitlist.sheet_opened`        | Sheet opens                                | `source`                                |
| `waitlist.submitted`           | Form submitted successfully                | `source`, `had_phone: bool`             |
| `waitlist.submission_failed`   | Validation or backend error                | `code`                                  |

## Tests

- **Unit (frontend)**: form validation; hook submits with correct payload; success state renders; errors render inline.
- **Unit (backend)**: idempotent upsert; rate limit; consent enforcement.
- **Integration**: end-to-end submit with mocked backend; deduplication.

## Definition of Done

- [ ] Waitlist sheet component
- [ ] Hook with mutation
- [ ] Backend endpoint with idempotent upsert + rate limit + email confirmation
- [ ] `waitlist_entries` table + Alembic migration
- [ ] Privacy disclosure with link to policy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Hook Form: https://react-hook-form.com/
- Brazilian phone mask conventions: https://www.gov.br/anatel/pt-br/

### Project context
- Cities catalog: `02-cities-catalog-api.md`
- Search filter: `03-search-filter.md`
- GPS auto-detect: `04-gps-auto-detect.md`
- `CLAUDE.md`
