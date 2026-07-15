# Push Notification Handler · FCM + APNs + tap routing

> **Type:** Foundation · Notifications\
> **Screen(s):** Notifications (19), Detail (13/14), and any screen reachable via push\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/05-api-client.md`, `00-foundation/06-auth-system.md`,
> `00-foundation/12-deep-link-handler.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `notifications`, `foundation`

## Context

Push notifications keep the citizen in the loop without opening the app: status changes on their
reports, neighborhood alerts, and prefecture announcements. They're also how we re-engage dormant
users (carefully — too many = uninstall).

This task wires the cross-platform push pipeline: device-token registration on the backend, dispatch
from the backend, foreground/background/quit handling on the device, and tap routing into the right
screen.

> **Architecture note (verified against current Expo SDK 56 docs):** the title says "FCM + APNs",
> but neither the mobile app nor the backend should integrate the Firebase Admin SDK or raw APNs
> certificates directly. `expo-notifications` obtains an **Expo push token**
> (`ExponentPushToken[...]`) via `getExpoPushTokenAsync()`, and the backend dispatches through
> **Expo's push notification service**, which relays to FCM (Android) and APNs (iOS) on our behalf.
> This is the current Expo-recommended path and is materially simpler than hand-rolling FCM device
> registration/APNs certificate management — that direct-provider approach only becomes necessary if
> a future requirement needs a non-Expo push pipeline (e.g., a native module Expo doesn't manage).
> The sections below assume the Expo push service path.

## User Story

**As a** Citizen,\
**I want** to be notified when something happens with my report (or in my neighborhood),\
**In order to** stay engaged without checking the app every day.

## Acceptance Criteria

### Scenario · First-time permission

**Given** the user just completed onboarding\
**When** the app prompts for notification permission\
**Then** the OS dialog appears\
**And** if granted, the device token is registered with the backend\
**And** if denied, the user can re-enable it later in Settings

### Scenario · Token registration

**Given** the user granted permission\
**When** the app obtains an Expo push token via `expo-notifications`' `getExpoPushTokenAsync()`
(which wraps the native FCM registration on Android and APNs registration on iOS)\
**Then** the token is sent to the backend along with the user ID, platform, and language\
**And** the backend stores it and uses it for future dispatches through Expo's push service

### Scenario · Token rotation

**Given** the OS rotates the device token\
**When** the app detects the new token\
**Then** the backend is notified\
**And** the old token is marked stale

### Scenario · Receiving in foreground

**Given** the app is open\
**When** a push arrives\
**Then** an in-app banner shows it (top-of-screen) with category icon\
**And** does **not** show the system notification\
**And** tapping the banner triggers the same routing as a system notification tap

### Scenario · Receiving in background

**Given** the app is in background\
**When** a push arrives\
**Then** the system notification appears\
**And** the badge count on the app icon is incremented

### Scenario · Receiving when quit

**Given** the app is force-quit\
**When** a push arrives\
**Then** the OS shows the notification\
**And** if the user taps it, the app launches and routes to the target screen\
**And** the launch sequence (Splash → init → routing) waits for the deep-link target before
navigating to Home

### Scenario · Tap routing

**Given** a notification has a `target` payload (e.g., `{ kind: "report", id: "abc" }`)\
**When** the user taps it\
**Then** the app navigates to the appropriate screen (e.g., Report Detail)\
**And** marks the notification as read in the Notifications screen

### Scenario · Categories

**Given** the backend dispatches a notification\
**When** the device receives it\
**Then** the notification carries a category label (status update, neighborhood alert, prefecture
announcement, gamification) for display + analytics

### Scenario · Localization

**Given** the user's language is en-US\
**When** the backend dispatches a notification\
**Then** the title and body are in en-US\
**And** the backend uses the user's stored language to pick the template

## Frontend (React Native / Expo)

### Where the handler lives

```
apps/city-hero/src/services/notifications/
├── permission.ts
├── tokenManager.ts
├── foregroundHandler.ts
├── tapRouter.ts
└── settings.ts
```

### Behavior

- On login, request permission and register the device token. On token rotation, update the backend.
- A background-message handler responds to silent pushes (e.g., for re-syncing).
- Foreground messages render an in-app banner instead of a system notification.
- Tap handling converts the notification's payload to a deep link and delegates to the deep-link
  handler.

### Out of scope (for now)

Per-user preferences (mute categories, quiet hours, rate limits) are **not** in MVP scope. The
product hasn't defined the notification catalog yet, and over-engineering preferences before the
catalog exists is wasteful. When defined, preferences will live under **More → Settings**
(`28-citizen-profile/06-settings-and-logout.md`) and reuse a single `/notifications/preferences`
endpoint added at that time.

### Real-time update strategy

For the MVP, **Push (via Expo's push service, relaying to FCM/APNs) is the single channel** for
delivering events to the device — including while the app is open (rendered as the foreground in-app
banner above). No WebSocket, no polling. Trade-off documented in `architecture-patterns.md` §
Real-time updates: on-screen lists may take 5–30s to reflect changes; acceptable for the MVP per
product decision (2026-06-19).

### Permission UX

Don't request permission at first launch — request after onboarding so the user understands why we
need it.

## Backend (FastAPI)

### Endpoints

| Method | Path                                 | Purpose                                     |
| ------ | ------------------------------------ | ------------------------------------------- |
| POST   | `/api/v1/devices`                    | Register/update a device token              |
| DELETE | `/api/v1/devices/{token_id}`         | Unregister (logout, opt-out)                |
| GET    | `/api/v1/notifications`              | List notifications for the user (paginated) |
| PATCH  | `/api/v1/notifications/{id}`         | Mark read / acted                           |
| GET    | `/api/v1/notifications/unread-count` | For the bottom-nav badge                    |

### Dispatch worker

A background worker reads the events that should produce notifications (status changes, supports,
achievements) and dispatches via **Expo's push notification service**
(`https://exp.host/--/api/v2/push/send`), batching Expo push tokens per Expo's guidance. Expo relays
each message to FCM or APNs depending on the token's platform — the worker does not talk to Firebase
or Apple directly. It uses the user's stored language to pick the template.

### Templates

Templates live in `apps/backend/src/templates/notifications/<category>/<lang>.json`. Each has
`title` and `body` with placeholders.

## Database (PostgreSQL)

### `device_tokens` table

| Column         | Type        | Notes                                                                    |
| -------------- | ----------- | ------------------------------------------------------------------------ |
| `id`           | UUID PK     |                                                                          |
| `user_id`      | UUID FK     |                                                                          |
| `token`        | text unique | The Expo push token (`ExponentPushToken[...]`), not a raw FCM/APNs token |
| `platform`     | varchar(20) | `ios`, `android`                                                         |
| `app_version`  | varchar(20) |                                                                          |
| `language`     | varchar(10) |                                                                          |
| `last_seen_at` | timestamptz |                                                                          |
| `created_at`   | timestamptz |                                                                          |

### `notifications` table

| Column        | Type        | Notes                          |
| ------------- | ----------- | ------------------------------ |
| `id`          | UUID PK     |                                |
| `user_id`     | UUID FK     |                                |
| `category`    | varchar(50) | `status_update`, `alert`, etc. |
| `title_key`   | text        | i18n key                       |
| `body_key`    | text        | i18n key                       |
| `body_params` | jsonb       | Substitution values            |
| `target`      | jsonb       | `{kind, id}` for deep linking  |
| `read_at`     | timestamptz | Nullable                       |
| `acted_at`    | timestamptz | Nullable                       |
| `created_at`  | timestamptz |                                |

## Edge Cases

- **Permission denied permanently**: a banner in Settings explains how to re-enable in OS settings.
- **Stale device tokens**: the backend prunes tokens not seen in 60 days.
- **Multiple devices per user**: all active tokens receive the dispatch.
- **App uninstalled**: provider returns invalid-token error → backend marks token stale.
- **User logs out**: device token is unregistered immediately so the next user on this device
  doesn't get the previous user's notifications.
- **Push provider outage**: dispatch worker retries with backoff; failed dispatches are visible in
  the ops dashboard.

## Privacy / LGPD

- Notification content is stored in the DB without PII (uses i18n keys + IDs, not literal text with
  names).
- The user can disable notifications entirely; the backend honors this immediately.
- Tokens are not shared with third parties.

## Analytics

| Event                             | When                            | Props                              |
| --------------------------------- | ------------------------------- | ---------------------------------- |
| `notification.received`           | App receives a push (any state) | `category`, `app_state: foreground | background | quit` |
| `notification.tapped`             | User taps a notification        | `category`, `target_kind`          |
| `notification.permission_granted` | User grants permission          | —                                  |
| `notification.permission_denied`  | User denies permission          | —                                  |

## Tests

- **Unit (mobile)**: token rotation triggers backend update; foreground handler renders banner; tap
  routing converts payload to navigation.
- **Unit (backend)**: dispatch worker selects correct locale; templates render with placeholders.
- **Integration**: end-to-end dispatch with a mocked Expo push service endpoint.
- **E2E**: send a real push to a test device, verify it lands and routes correctly.

## Definition of Done

- [ ] Mobile permission flow (after onboarding)
- [ ] Device token registration and rotation
- [ ] Foreground/background/quit handlers
- [ ] Tap routing delegated to the deep-link handler
- [ ] In-app banner UI for foreground
- [ ] Backend endpoints (device registration, notifications inbox)
- [ ] Dispatch worker with language selection
- [ ] Templates for the initial set of categories the product defines
- [ ] Unread-count endpoint (used by the bottom nav badge)
- [ ] Tests per strategy

## Standards & References

### Cross-cutting standards

- Architecture (background workers): `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Expo Notifications (verified against SDK 56 docs, 2026-07):
  https://docs.expo.dev/versions/latest/sdk/notifications/
- Expo push notifications overview (Expo push service, the recommended path — not raw FCM/APNs
  integration): https://docs.expo.dev/push-notifications/overview/
- Firebase Cloud Messaging (background only — Expo's push service is the relay, we don't call this
  API directly): https://firebase.google.com/docs/cloud-messaging
- Apple Push Notification service (background only, same reasoning):
  https://developer.apple.com/documentation/usernotifications

### Project context

- Deep-link handler: `00-foundation/12-deep-link-handler.md`
- Notifications screen: `docs/tasks/19-notifications/`
- `CLAUDE.md`
