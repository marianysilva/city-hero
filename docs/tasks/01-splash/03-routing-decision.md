# Splash · Routing decision

> **Type:** Screen feature · Navigation logic\
> **Screen:** SCREEN 01 · Splash / Welcome\
> **Effort:** S (≤1 day)\
> **Dependencies:** `01-splash/02-app-initialization.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `navigation`

## Context

After the initialization sequence settles (task 02), the splash decides where the user should go
next. The decision tree depends on:

- Authentication state (logged in? token valid?)
- City selection state (does the user have an active city?)
- Onboarding completion (has the user finished onboarding before?)
- Version check result (force update? continue?)
- Pending deep link (is the user trying to open a specific URL?)

## User Story

**As a** Citizen,\
**I want** the app to land on the right screen based on my state,\
**In order to** not have to re-authenticate or re-onboard unnecessarily.

## Acceptance Criteria

### Scenario · Authenticated, fully set up, no deep link

**Given** the init result indicates: authenticated, has active city, onboarding completed, version
allowed, no pending deep link\
**When** the routing task evaluates\
**Then** the app navigates to Home

### Scenario · Authenticated with pending deep link

**Given** the init result indicates: authenticated, full setup, deep link target is a
public/auth-allowed resource\
**When** the routing task evaluates\
**Then** the app navigates directly to the deep link target (skipping Home)

### Scenario · Authenticated but no active city

**Given** the user is logged in but `city_id` is null\
**When** the routing task evaluates\
**Then** the app navigates to City Select (SCREEN 02)\
**And** after city selection, the user proceeds to Home

### Scenario · Authenticated but onboarding not completed

**Given** the user is logged in, has a city, but has not finished onboarding\
**When** the routing task evaluates\
**Then** the app navigates to the onboarding step at which the user stopped\
**And** completing onboarding sends them to Home

### Scenario · Unauthenticated, no deep link

**Given** the init result indicates: not authenticated, no deep link\
**When** the routing task evaluates\
**Then** the app navigates to the Login/Signup screen

### Scenario · Unauthenticated with deep link to a private resource

**Given** the deep link points to a private resource (e.g., a personal report)\
**When** the routing task evaluates\
**Then** the app navigates to Login first\
**And** the deep-link target is stashed for after-login navigation\
**And** after successful login, the user is sent to the original target

### Scenario · Force update required

**Given** the version check result is `force_update_required`\
**When** the routing task evaluates\
**Then** the app navigates to the Force Update screen (see task `04-force-update-flow`)\
**And** all other state is irrelevant — the user can't proceed

### Scenario · First-time user

**Given** there's no token, no cached city, and no completed onboarding\
**When** the routing task evaluates\
**Then** the app navigates to the first onboarding step (or to City Select if onboarding is gated by
city)

### Scenario · Returning user with cleared session

**Given** the device was previously logged in but the user signed out\
**When** the routing task evaluates\
**Then** the app navigates to Login\
**And** the city / language preferences from the previous session are preserved (improves UX)

### Scenario · Terms version outdated (re-accept required)

**Given** the user is authenticated, has a city, and finished onboarding previously, but the
platform's current terms version (per `04b-onboarding-community-pact/04-accept-terms-gate.md`) is
newer than the user's `terms_version_accepted`\
**When** the routing task evaluates\
**Then** the app navigates directly to the Community Pact screen (SCREEN 04b) — not the full
onboarding flow — with a "re-accept" mode that skips the age-tailored hero rotation and jumps
straight to the updated pact cards + footer gate\
**And** once the user accepts the new version, they return to Home (or the original deep-link target
if one was pending)\
**And** this check runs after the force-update and deep-link rules but before "full setup → Home",
since an outdated terms acceptance blocks normal use the same way a force update does, just scoped
to one screen instead of the whole app

## Behavior

### Decision tree (priority order)

The router evaluates conditions top-down; the first matching rule wins:

1. **Force update** → Force Update screen.
2. **Has deep link to public resource** → Deep link target.
3. **Has deep link to private resource and not authenticated** → Login (stash target).
4. **Not authenticated** → Login.
5. **Authenticated, no city** → City Select.
6. **Authenticated, has city, onboarding incomplete** → Onboarding (resume at saved step).
7. **Authenticated, has city, onboarding done, terms version outdated** → Community Pact (re-accept
   mode).
8. **Authenticated, has city, onboarding done, terms current, has deep link** → Deep link target.
9. **Authenticated, full setup** → Home.

### Resume after login

When the user is sent to Login because of a deep link, the original target is held in a "post-login"
buffer. After successful login, the auth flow consults the buffer and routes accordingly.

### Onboarding step persistence

The user's onboarding progress is persisted server-side (or locally with sync) so a partial
onboarding resumes at the right step on a new device or reinstall.

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/services/init/
├── router.ts          ← decision tree
├── postLoginBuffer.ts ← stash deep-link target during login redirect
└── routerMap.ts       ← rule → navigation action
```

### Behavior

- Receives the typed init result and returns a navigation action (route name + params).
- Uses Expo Router's `router.replace()` (or a `<Redirect>` from the splash route) to swap to the
  destination route, so the splash is removed from history — no back-button/back-gesture returns to
  it. For simple, single-condition gates (e.g., "force update blocks everything else"), the root
  layout can additionally wrap the relevant route groups in `Stack.Protected` guards; this task's
  multi-branch decision tree (deep link + city + onboarding-step resume, all combined) still needs
  its own imperative logic on top of that, since `Stack.Protected` alone doesn't model stashing a
  deep-link target or resuming a specific onboarding step.
- The post-login buffer is cleared after successful redirection.

## Backend

The backend supplies the data the router consumes — no router-specific endpoints are needed beyond
what task 02 already specifies.

## Database

The user record stores `onboarding_completed_at` and `onboarding_current_step` so resume works
across devices. It also stores `terms_version_accepted` (see
`04b-onboarding-community-pact/04-accept-terms-gate.md`), which the router compares against the
platform's current required terms version (a small config value, not a per-user field) to decide
whether rule 7 above fires.

## Edge Cases

- **Two reset signals during cold start**: only the first effective one runs; subsequent signals are
  no-ops.
- **Deep link target is invalid or deleted**: routing falls through to Home with a toast (per
  `12-deep-link-handler.md`).
- **City ID present but city no longer exists** (rare; deleted by admin): clear local city, route to
  City Select.
- **User changed cities on another device**: the init fetches the active city from the server, which
  is authoritative.
- **Onboarding step references a removed step**: fall back to the first incomplete step.

## Privacy / LGPD

The post-login buffer must not include sensitive params; it stores only the target route key + a
small set of allowed parameters.

## Analytics

| Event                     | When                      | Props                                       |
| ------------------------- | ------------------------- | ------------------------------------------- |
| `init.routing_decision`   | Router decides            | `route`, `reason` (e.g., `unauthenticated`) |
| `init.post_login_resumed` | Post-login redirect fires | `target_route`                              |

## Tests

- **Unit**: every branch of the decision tree given a constructed init result.
- **Integration**: post-login buffer fully consumed; onboarding resume picks the right step.
- **E2E**: a force-update result navigates to the Force Update screen and locks the user there.

## Definition of Done

- [ ] Router with the decision tree
- [ ] Post-login buffer
- [ ] Onboarding-step persistence on backend/local
- [ ] Terms-version check (routes to Community Pact re-accept mode when outdated)
- [ ] Telemetry for routing decisions
- [ ] Tests covering all branches

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Expo Router — imperative redirects (`router.replace`):
  https://docs.expo.dev/router/reference/redirects/
- Expo Router — protected routes (`Stack.Protected`):
  https://docs.expo.dev/router/advanced/protected/

### Project context

- App initialization: `02-app-initialization.md`
- Force update flow: `04-force-update-flow.md`
- Deep link handler: `00-foundation/12-deep-link-handler.md`
- Terms re-accept gate: `04b-onboarding-community-pact/04-accept-terms-gate.md`
- `CLAUDE.md`
