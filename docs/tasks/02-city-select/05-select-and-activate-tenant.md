# City Select · Select and activate tenant

> **Type:** Screen feature · State + persistence
> **Screen:** SCREEN 02 · Choose City
> **Effort:** M (1-2 days)
> **Dependencies:** `02-city-select/02-cities-catalog-api.md`, `00-foundation/06-auth-system.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `multi-tenant`

## Context

The screen's payoff: when the user picks a city (via GPS confirmation,
search result, or list tap), the choice activates the multi-tenant scope
for the rest of the session and persists for future launches. After this,
every API call carries the `city_id` (header + JWT claim), and every UI
adapts (theme, services, prefecture name).

This is also where **anonymous → authenticated transitions** matter: a
not-yet-logged-in user picks a city, the choice is held in local state,
and is included in the signup payload when the user creates their account.

## User Story

**As a** Citizen,
**I want** my chosen city to stick,
**In order to** see my neighborhood content from now on without picking it again.

## Acceptance Criteria

### Scenario · Authenticated user picks an active city

**Given** the user is logged in and taps an active city
**When** the selection is processed
**Then** the backend updates the user's `city_id` to the chosen one
**And** a fresh access token is issued with the new `city_id` claim (or the existing token is revoked and refreshed)
**And** the local state stores the new active city
**And** the user proceeds to the next step (Onboarding, or Home if onboarding is done)

### Scenario · Unauthenticated user picks an active city

**Given** the user is not logged in (first install)
**When** they pick an active city
**Then** the choice is held in local state (volatile, in-memory) plus persistent storage (AsyncStorage)
**And** the user proceeds to the next onboarding step
**And** when the user later signs up, the chosen city is included in the signup payload

### Scenario · Confirming the GPS suggestion

**Given** the GPS card pre-suggests Pôrto Belo with a "Confirmar ✓" CTA
**When** the user taps the CTA
**Then** the same selection flow runs as if the user had tapped the row
**And** haptic feedback fires
**And** the rest of the screen briefly shows a "Confirmando…" state during the API call

### Scenario · Coming-soon city tap

**Given** a coming-soon city is in the list
**When** the user taps it
**Then** the selection flow does **not** activate the tenant
**And** instead, the waitlist flow opens (delegated to task `06-waitlist-coming-soon`)

### Scenario · API failure during activation

**Given** the user picks an active city
**When** the backend update fails (network or 5xx)
**Then** the local state is rolled back (no city set)
**And** an inline error appears with a "Tentar de novo" CTA
**And** the user can pick again or retry

### Scenario · Switching cities later

**Given** the user already has an active city and is browsing City Profile (out of MVP scope, but supported)
**When** they pick a different city via the same selection mechanism
**Then** the same activation flow runs
**And** existing local data scoped to the previous city is cleared (or marked stale) — current screens re-fetch under the new tenant

### Scenario · Theme and copy adapt

**Given** the active city has a configured theme variant or branding (white-label friendly, even if MVP uses one variant)
**When** the city is activated
**Then** subsequent screens render with the city's flag emoji in the top bar
**And** the prefecture's name appears where applicable

### Scenario · Multi-tenant scoping enforced

**Given** the city is activated
**When** any subsequent backend request fires
**Then** the request includes the `X-City-Id` header
**And** the backend cross-validates with the JWT's `city_id` claim
**And** rejects requests where they don't match (this is foundation-level enforcement; this task only confirms the client always sends both correctly)

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CitySelect/
├── hooks/
│   └── useSelectCity.ts
└── api/
    └── selectCityEndpoint.ts
```

A small global store (`useTenantStore`) holds the active city. The screen calls `selectCity(cityId)` which:

1. Updates the store (`pending_city_id`).
2. If authenticated, calls the backend to persist; receives the new token; updates the auth store; sets `active_city_id`.
3. If not authenticated, sets `active_city_id` from local state and persists to AsyncStorage.
4. Clears any previously-cached data scoped to the previous tenant (TanStack Query cache invalidation by city scope).
5. Navigates forward.

On error, rolls back and surfaces the inline error.

### Navigation forward

After a successful activation, the screen navigates to:

- The next onboarding step if onboarding is incomplete.
- Home if onboarding is already done (e.g., a user who just switched cities post-MVP).
- The deep-link target if there was a buffered post-login link.

The destination is computed by the same routing logic as the splash (foundation-level routing).

## Backend (FastAPI)

### Endpoints

| Method | Path                              | Purpose                                              |
|--------|-----------------------------------|------------------------------------------------------|
| PATCH  | `/api/v1/auth/me`                 | Update the current user (including `city_id`)        |

The backend enforces:

- Only `active` cities can be set as `city_id`.
- Setting the same `city_id` is a no-op (idempotent).
- A new access token is issued (the JWT's `city_id` claim must match).
- The refresh token can stay valid (or rotate, per refresh-token policy).

### Multi-tenant behavior

The backend's middleware reads `X-City-Id` and the JWT's `city_id` claim. They must match. After the user's `city_id` changes, the next request the client makes will include the new header and a token whose claim matches.

## Database

The `users.city_id` field is updated. No new tables.

## Edge Cases

- **Selecting the same city again**: no-op; navigation proceeds.
- **Selecting before the catalog finished loading**: the action waits for the catalog or shows a brief loading state.
- **User aborts mid-activation** (closes app): on next launch, the splash routing handles the partial state. Either the local-storage city is set (and the user proceeds) or it's empty (and they return to City Select).
- **Server-side `city_id` differs from client** (out-of-sync): the server is authoritative on next session; the client reconciles silently.
- **Token revocation race**: the auth store ensures only one in-flight refresh runs at a time.

## Privacy / LGPD

- The chosen city is not sensitive PII, but it does locate the user. It's stored within the user record and protected by the same controls as other profile fields.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `city_select.selection_started`    | User confirms a city                       | `source: gps|search|list`            |
| `city_select.selection_succeeded`  | Tenant activated                           | `city_id`, `previous_city_id` (if any)|
| `city_select.selection_failed`     | Activation errored                         | `code`                                |

## Tests

- **Unit (frontend)**: store transitions; rollback on error; cache invalidation on city switch.
- **Unit (backend)**: rejects coming-soon city for selection; new token has correct claim; no-op on same city.
- **Integration**: end-to-end activation with a mocked backend.
- **E2E**: pick a city → see brand applied on next screen → backend enforces scoping.

## Definition of Done

- [ ] Tenant store with active city
- [ ] Selection hook orchestrating the flow
- [ ] Backend update endpoint
- [ ] New token issuance on city change
- [ ] Cache invalidation on city change
- [ ] Inline error handling and retry
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (multi-tenant): `docs/engineering/architecture-patterns.md`
- Security: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- TanStack Query cache invalidation: https://tanstack.com/query/latest/docs/react/guides/query-invalidation
- AsyncStorage: https://docs.expo.dev/versions/latest/sdk/async-storage/

### Project context
- Auth system: `00-foundation/06-auth-system.md`
- API client (header propagation): `00-foundation/05-api-client.md`
- `CLAUDE.md`
