# Onboarding · Step machine and progress persistence

> **Type:** Cross-screen behavior · State machine
> **Screen(s):** SCREENS 03, 04, 05 (entire onboarding triplet)
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/05-api-client.md`, `00-foundation/06-auth-system.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `state-machine`, `onboarding`

## Context

The shared logic that drives all four onboarding tutorial screens
(SCREENS 03, 04, 04b, 05 — second through fifth step of the 5-step
onboarding flow, where SCREEN 02 is step 1): tracking which step the
user is on, what's been completed, and persisting progress so it
resumes across sessions and devices.

> **Onboarding has no Skip path** — understanding the app on first
> launch is essential, so all 5 steps must be completed sequentially.
> The user can go back to revisit a previous step but never skip ahead
> or out.

This task lives under SCREEN 03 because that's the entry point of the
onboarding tutorial (after city selection), but its scope spans all
three tutorial screens.

## User Story

**As a** Citizen interrupting onboarding (close the app, reinstall),
**I want** to resume where I left off,
**In order to** not redo what I've already seen.

**As a** Citizen who wants to revisit a previous step,
**I want** to go back through the steps I've already seen,
**In order to** re-read content I missed.

## Acceptance Criteria

### Scenario · Step navigation forward

**Given** the user is on step 1 (Camera AI)
**When** they tap "Próximo →"
**Then** the state machine marks step 1 as seen
**And** the next route is step 2 (Gamification)
**And** progress is persisted (server if authenticated, local otherwise)

### Scenario · Step navigation backward

**Given** the user is on step 3
**When** they tap the back button (in-screen or system back on Android, swipe back on iOS)
**Then** the state machine moves to step 2 again
**And** "seen" status of step 2 is preserved

### Scenario · Cannot exit onboarding without finishing

**Given** the user is on any onboarding step
**When** they look for a way out
**Then** there is **no "Pular" / Skip affordance** anywhere on the screen
**And** the back button on step 1 (City Select) is disabled (no previous step to return to)
**And** the only path forward is to complete all 5 steps

### Scenario · Resume on next launch

**Given** the user closed the app on step 2
**When** they reopen the app and complete the splash routing
**Then** the routing logic (per `01-splash/03-routing-decision.md`) sends them to the onboarding step at the saved progress
**And** that step renders normally

### Scenario · Persist progress server-side

**Given** the user is authenticated
**When** progress changes (a step is seen or skipped)
**Then** the server is updated via the user-update endpoint
**And** retries on transient failures
**And** local state is updated optimistically

### Scenario · Persist progress locally (unauthenticated)

**Given** the user is not authenticated
**When** progress changes
**Then** the change is persisted only locally (AsyncStorage)
**And** when the user later signs up, the local progress is sent in the signup payload to be merged

### Scenario · Onboarding done

**Given** the user reached the last step (Neighborhood) and completed it
**When** the state machine flags onboarding as complete
**Then** subsequent app launches bypass onboarding entirely
**And** if the user manually navigates back (developer build), they can revisit

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Onboarding/
├── stateMachine/
│   ├── store.ts            ← Zustand or similar
│   ├── steps.ts            ← step keys and order
│   └── persistence.ts      ← server + local sync
└── hooks/
    └── useOnboardingNav.ts
```

### Behavior

- A small typed store holds: `currentStep`, `seenSteps` (array), `completedAt` (nullable).
- Each onboarding screen calls `next()` or `back()` from a shared hook (`useOnboardingNav`). There is **no `skip()` method** — it would be an explicit affordance for breaking the flow.
- `next()` advances the index, marks the previous step as seen, and persists.
- `back()` decreases the index when possible; on step 1 it is a no-op (with a subtle disabled visual).
- The state machine flags `completedAt` only when the user finishes the final step (Neighborhood) — never as a side effect of an early exit.
- Persistence layer attempts server-side save when authenticated; otherwise persists locally.
- Recovery on app start: the store hydrates from local storage; the splash routing reads the store to decide where to send the user.

### Step keys

The five onboarding steps have stable keys: `city_select`, `camera_ai`, `gamification`, `community_pact`, `neighborhood`. The order is fixed in MVP but the key-based design allows reordering or adding/removing steps without breaking persistence.

## Backend (FastAPI)

### Field on `users`

The `users` table gains:

| Column                    | Type        | Notes                                     |
| ------------------------- | ----------- | ----------------------------------------- |
| `onboarding_seen_steps`   | jsonb       | Array of step keys seen so far            |
| `onboarding_completed_at` | timestamptz | Set when the user finishes the final step |

### Endpoints

The existing `PATCH /api/v1/auth/me` is reused with these fields included in the patch payload. No new endpoint is needed.

### Signup merge

When an unauthenticated user finishes onboarding locally and then signs up, the signup payload includes `onboarding_seen_steps` and `onboarding_completed_at`. The backend stores them on the new user record.

## Database

The two new columns on `users` (above). A small Alembic migration adds them with safe defaults.

## Edge Cases

- **Reordering or adding a step in the future**: the persisted `seen_steps` is a list of keys, not indices, so old data still maps correctly.
- **Server save fails**: optimistic UI; the change retries with backoff.
- **User on multiple devices**: the server is authoritative; the second device's onboarding state syncs from the server on next session.
- **User signs out mid-onboarding**: progress is preserved locally for the next user only if it's the same device person (fairly rare); on logout we clear local progress to avoid leakage.
- **Signup with local progress already complete**: the user lands directly on Home post-signup.

## Privacy / LGPD

- The fields are non-sensitive (just a list of step identifiers and a timestamp).
- Stored within the user record; protected like other profile data.

## Analytics

| Event                       | When                     | Props                            |
| --------------------------- | ------------------------ | -------------------------------- |
| `onboarding.step_viewed`    | Step screen mounts       | `step_key`                       |
| `onboarding.step_completed` | User taps Next on a step | `step_key`, `time_spent_seconds` |
| `onboarding.step_back`      | User taps Back           | `from_step_key`, `to_step_key`   |
| `onboarding.completed`      | All steps done           | `total_time_seconds`             |

## Tests

- **Unit**: store transitions; next/back/resume; signup merge logic; no skip path exists.
- **Integration**: persistence syncs to server; offline path writes only locally.
- **E2E**: complete the 5 steps end-to-end; resume after force-quit; back navigation works on steps 2-5 and is a no-op on step 1.

## Definition of Done

- [ ] State machine implemented (store + steps + persistence)
- [ ] `useOnboardingNav` hook used by all three onboarding screens
- [ ] Backend fields added; PATCH endpoint accepts them
- [ ] Signup endpoint merges anonymous local progress
- [ ] Optimistic update + retry
- [ ] Splash routing consumes the state for resume
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Zustand persistence middleware: https://github.com/pmndrs/zustand#persist-middleware

### Project context

- Splash routing: `01-splash/03-routing-decision.md`
- Auth system: `00-foundation/06-auth-system.md`
- Other onboarding screens: `04-onboarding-gamification/`, `05-onboarding-neighborhood/`
- `CLAUDE.md`
