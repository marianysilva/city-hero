# Analytics Tracking · Events, funnels, user properties

> **Type:** Foundation · Product analytics\
> **Screen(s):** All\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/01-monorepo-setup.md`, `00-foundation/06-auth-system.md`,
> `00-foundation/20-observability-package.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `web`, `analytics`, `foundation`, `lgpd`

## Context

A unified analytics layer that captures user behavior events, application metrics, and funnel/cohort
data. Used to understand product usage, measure gamification effectiveness, identify drop-offs, and
feed business dashboards.

A single tracker abstraction hides the underlying provider (PostHog, Mixpanel, Amplitude, or
self-hosted) so we can swap or run multiple in parallel without touching screen code.

> **Scope flag:** for a 1-city MVP, a single self-hosted or PostHog-Cloud-free-tier provider is
> almost certainly enough — PostHog alone covers events, funnels, cohorts, and session replay, so
> there's no early need for the `multiplexer.ts` "run multiple providers in parallel" capability or
> for wiring Mixpanel/Amplitude. This mirrors the same reasoning `docs/engineering/observability.md`
> already applies to the observability stack (no multi-vendor tooling until there's a team and
> multiple cities to justify it). Keep the `providers/` interface so a second provider is a drop-in
> later, but treat building the multiplexer and any non-PostHog provider as deferred, not required
> for this task's Definition of Done.

## User Story

**As a** Product Manager,\
**I want** consistent event tracking across mobile and web,\
**In order to** measure feature adoption, retention, and where users get stuck.

**As a** Frontend Developer,\
**I want** a single tracker with typed event names,\
**In order to** avoid free-text events that vary across platforms.

## Acceptance Criteria

### Scenario · Event tracking

**Given** the user performs an action that should be tracked\
**When** the screen calls the tracker\
**Then** the event is recorded with: a typed name, the user ID (if authenticated), the city ID, the
platform, the app version, the timestamp, and a property bag\
**And** the event is sent to the configured analytics backend

### Scenario · Anonymous events (pre-login)

**Given** the user has not yet logged in\
**When** events fire (e.g., onboarding step completion)\
**Then** they're tagged with an anonymous device ID\
**And** when the user logs in, the tracker calls "identify" so the backend stitches anonymous events
to the authenticated user

### Scenario · Page/screen views

**Given** the user navigates to a screen\
**When** the route activates\
**Then** an automatic `screen.viewed` event fires with the screen name\
**And** the duration on the previous screen is included as a property

### Scenario · User properties

**Given** the user updates a relevant attribute (city, language, level, role)\
**When** the change happens\
**Then** the tracker updates the user's profile properties\
**And** subsequent events include the new properties via the backend's enrichment

### Scenario · Funnel example

**Given** the analytics backend has events for the report flow\
**When** a Product Manager builds a funnel: `home.fab_camera_pressed` → `camera.captured` →
`report.confirmed` → `report.synced`\
**Then** the funnel shows conversion rate per step\
**And** groups by city, OS, and app version

### Scenario · LGPD opt-out

**Given** a user has explicitly opted out of analytics in settings\
**When** any event would fire\
**Then** the tracker no-ops\
**And** no events are sent for that user

### Scenario · Local development

**Given** a developer is running locally\
**When** events fire\
**Then** they're logged to the console with a clear `[analytics]` prefix\
**And** are not sent to the production analytics backend (unless explicitly enabled)

## Frontend (React Native + Web)

### Package location

```
packages/analytics/
├── package.json
├── src/
│   ├── tracker.ts          ← public API
│   ├── providers/
│   │   ├── posthog.ts
│   │   ├── console.ts      ← dev / fallback
│   │   └── multiplexer.ts  ← runs multiple providers
│   ├── eventTypes.ts       ← exhaustive list of event names + payload shapes
│   ├── deviceId.ts
│   └── identify.ts
└── tests/
```

### Behavior

- A single `track(eventName, payload)` function is the only API used by screens.
- The event name is typed; passing an unknown name is a TypeScript error.
- The payload is also typed per event, preventing typos like `screnName` instead of `screenName`.
- An `identify(userId, traits)` function is called after login.
- A `reset()` function is called on logout to clear the user identity and start a new anonymous
  session.
- The tracker queues events while offline and flushes when online.
- Provider configuration is read from environment.

### Auto-tracking

- Screen views via React Navigation listener.
- App lifecycle events (cold start, foreground, background).
- Errors (`error.boundary_caught`, `error.unhandled_rejection` — defined and emitted by
  `00-foundation/15-error-boundary.md`; this package only receives and forwards them). Each carries
  the shared trace ID from `@cityhero/observability` (see
  `00-foundation/20-observability-package.md`) so an event here can be cross-referenced with the
  matching Sentry issue and backend log lines.

### Event taxonomy

Events follow a `<domain>.<verb>` convention:

| Domain         | Examples                                              |
| -------------- | ----------------------------------------------------- |
| `app`          | `app.opened`, `app.foregrounded`, `app.backgrounded`  |
| `auth`         | `auth.login_succeeded`, `auth.signup_started`         |
| `nav`          | `nav.tab_pressed`, `nav.fab_camera_pressed`           |
| `report`       | `report.created`, `report.supported`, `report.shared` |
| `comment`      | `comment.tag_added`                                   |
| `gamification` | `xp.earned`, `level.up`, `achievement.unlocked`       |
| `onboarding`   | `onboarding.step_completed`, `onboarding.skipped`     |
| `notification` | `notification.received`, `notification.tapped`        |
| `error`        | `error.boundary_caught`, `error.unhandled_rejection`  |

Each task spec lists the events it should emit; the central event list lives in this package.

### Identity stitching

On login, the tracker calls the analytics backend's identify API with the user UUID and trait
properties (city, language, role, level, signup_at). Anonymous events from before login are merged
to the authenticated profile.

## Backend (FastAPI)

The backend can also emit events for things only it knows about (cron-driven aggregations, AI
inference outcomes, etc.). It uses the PostHog Python SDK (`posthog-python`) with the same event
taxonomy as the client package (kept in sync manually, since Python can't import a TS package — see
"Schema drift" under Edge Cases). Every server-emitted event carries the user UUID (when known) and
the `city_id` from the request's tenant scope, per this repo's multi-tenant rule that all data is
scoped by city — never emit a business event without a `city_id` unless it's explicitly
platform-wide (e.g. a cron health-check event).

## Database

Not applicable — events live in the analytics backend, not the operational DB.

The analytical data warehouse (see `analytics/transformations` for dbt) reads from the operational
DB and combines with analytics-backend exports to feed Superset dashboards. Schema design lives
there, not here.

## Edge Cases

- **Provider outage**: events queue locally; flush on next opportunity.
- **Quota exceeded**: provider drops events; the tracker logs and continues.
- **User reinstalls the app**: device ID resets; identity is re-established on next login.
- **Multiple devices per user**: each has its own device ID; identify call links them to the same
  user UUID.
- **Schema drift between client and server**: the canonical event taxonomy is authored once in
  `packages/analytics/src/eventTypes.ts` (TypeScript, consumed directly by mobile and web). The
  Python backend cannot import a TS package, so it keeps a hand-maintained mirror in
  `apps/backend/.../analytics/event_types.py`; a CI check diffs the two lists (event names +
  required property keys) and fails the build if they've drifted. This is a real risk to actively
  guard against, not something eliminated "by construction."

## Privacy / LGPD

- The opt-out toggle is exposed in Settings and is honored immediately.
- The user UUID is the only identifier sent. **Never** send email, CPF, name, phone.
- IP and user agent are sent to the analytics backend as part of normal headers; ensure the
  backend's region is compliant with LGPD (Brazil-region, or contracted DPA).
- Aggregated metrics that can be derived from events should not require raw event retention beyond
  the configured period (e.g., 13 months).

## Analytics (meta)

| Event                       | When                             | Props                         |
| --------------------------- | -------------------------------- | ----------------------------- |
| `analytics.opt_out_toggled` | User toggles opt-out in Settings | `opted_out: bool`             |
| `analytics.queue_drained`   | Offline event buffer flushes     | `count`, `oldest_age_seconds` |

## Tests

- **Unit**: event taxonomy is typed (TS catches unknown events); `track()` calls the underlying
  provider with the right payload; opt-out short-circuits all events.
- **Integration**: identity stitching after login; reset on logout; queue drains on connectivity
  return.
- **Privacy**: assert no PII keys are sent (denylist test).

## Definition of Done

- [ ] `packages/analytics` package built
- [ ] PostHog (or equivalent) provider integrated
- [ ] Console provider for dev
- [ ] Typed event taxonomy
- [ ] Auto-tracked events: app lifecycle, screen views, errors
- [ ] Identity stitch on login; reset on logout
- [ ] Settings opt-out fully honored
- [ ] Backend SDK integrated for server-side events
- [ ] Telemetry on the tracker itself
- [ ] Tests passing per strategy

## Standards & References

### Cross-cutting standards

- Privacy: `docs/engineering/security-baseline.md` (LGPD section)
- Observability: `docs/engineering/observability.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- PostHog (primary provider — client + server SDKs confirmed current, cover `identify`/`reset` with
  durable offline queueing suited to this task's "queue while offline, flush online" and "identity
  stitching" requirements): https://posthog.com/docs, React Native SDK:
  https://posthog.com/docs/libraries/react-native, Python SDK:
  https://posthog.com/docs/libraries/python
- Mixpanel (alternative, not selected for MVP — see "Scope flag" above):
  https://docs.mixpanel.com/docs/quickstart
- Amplitude (alternative, not selected for MVP — see "Scope flag" above):
  https://www.docs.developers.amplitude.com/

### Project context

- Each task lists its own events; the canonical list lives in `packages/analytics/src/eventTypes.ts`
- Error events (`error.*`) are defined and emitted by `00-foundation/15-error-boundary.md`; this
  package only receives them
- Shared trace ID used to cross-link analytics events with Sentry issues and backend logs:
  `00-foundation/20-observability-package.md`
- `CLAUDE.md`
