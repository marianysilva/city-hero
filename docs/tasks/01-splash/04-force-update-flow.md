# Splash · Force update flow

> **Type:** Screen feature · Compliance / safety net
> **Screen:** SCREEN 01 · Splash / Welcome (sub-screen)
> **Effort:** S (≤1 day)
> **Dependencies:** `01-splash/02-app-initialization.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `safety`

## Context

Some bugs are too critical to live with old clients in the field — security
holes, broken crypto, regulatory issues, or breaking API changes. The force
update flow is the safety net: when the backend says "this version is no
longer supported", the app blocks usage until the user updates from the app
store.

This is the inverse of "update recommended" (a soft prompt). Force update
is **non-dismissible** by design.

## User Story

**As a** Product Owner,
**I want** to block outdated clients when needed,
**In order to** ensure no users run a known-broken or insecure version.

**As a** Citizen,
**I want** a clear path to the app store,
**In order to** get the new version with one tap.

## Acceptance Criteria

### Scenario · Force update required

**Given** the version check returns `force_update_required`
**When** the routing task evaluates
**Then** the app navigates to the Force Update screen and replaces the navigation stack (no back-button to other screens)
**And** the screen explains why the update is needed in plain language
**And** offers a single primary CTA: "Atualizar agora"

### Scenario · CTA opens the store

**Given** the user taps "Atualizar agora"
**When** the action runs
**Then** the app opens the App Store (iOS) or Play Store (Android) on the CityHero listing
**And** the deep link uses the platform's native scheme

### Scenario · No way to dismiss

**Given** the user is on the Force Update screen
**When** they try to back out (Android back button), background the app, or tap anywhere outside the CTA
**Then** the screen remains active and unbypassable
**And** backgrounding/restoring the app brings them back to the same screen

### Scenario · After update

**Given** the user installed the new version
**When** they reopen the app
**Then** the splash runs init normally
**And** the version check succeeds, so the user proceeds to their normal landing screen
**And** the update prompt is not shown again

### Scenario · Network outage during version check

**Given** the version check failed (network/timeout) in the init sequence
**When** the routing evaluates
**Then** the user is allowed to continue (graceful failover — see `02-app-initialization.md`)
**And** the next successful check at the next cold start applies if force update has since been required

### Scenario · Forced update for a specific platform

**Given** the version check returns `force_update_required` only for iOS clients (e.g., a regulatory iOS-only fix)
**When** the user is on Android
**Then** they are not blocked
**And** vice versa

### Scenario · Localized copy

**Given** the user's language is en-US
**When** the screen renders
**Then** all copy is in English
**And** in pt-BR, copy is in Portuguese

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ForceUpdate/
├── ForceUpdateScreen.tsx
├── ForceUpdateScreen.styles.ts
└── ForceUpdateScreen.test.tsx
```

### Behavior

- The screen is presented in a way that blocks navigation backwards (replace the stack) and ignores the system back button on Android.
- The CTA opens the platform-appropriate store URL using the OS's deep-link mechanism.
- The screen does not auto-retry the version check; the user has to update + relaunch.
- The screen logs telemetry on mount, on CTA tap, and on back-button suppression.

### Visual design

- Centered illustration (a hero icon with a small upward arrow / sparkle).
- Title and short paragraph explaining "Update needed".
- Single primary CTA button.
- Optional small text: "Versão atual: 1.2.3 · Mínima: 1.4.0" for transparency.
- Status bar variant matches the screen background (light or dark theme).

## Backend (FastAPI)

### Endpoints used

- The same `GET /api/v1/version/check` endpoint from `02-app-initialization`. It returns the verdict per platform and version.

The backend can manage the minimum version through configuration (env var or admin endpoint), without a deploy. A small admin UI to toggle the threshold per platform is desirable but not part of this task.

## Database

A small config table or feature-flag store is sufficient to manage the minimum versions per platform. Schema is owned by the version-check service / config service, not this task.

## Edge Cases

- **Store URL missing or invalid**: fallback to the platform's app-store search using the bundle ID.
- **App was sideloaded** (no store presence): the CTA shows a message indicating the user needs to update via their original install method.
- **User updates outside the app store** (test-flight, internal distribution): version check still gates them; once the new version is installed, it's allowed.
- **Cycling between background/foreground**: each foreground re-runs init; if force update is still required, the user lands here again.
- **Mid-flight breaking change deployed**: the backend can gracefully serve `force_update_required` to old clients; this task ensures the client honors it.

## Privacy / LGPD

Not applicable directly. No user data is collected.

## Analytics

| Event                          | When                                       | Props                                  |
|--------------------------------|--------------------------------------------|-----------------------------------------|
| `force_update.shown`           | Screen mounts                              | `current_version`, `min_required`      |
| `force_update.cta_tapped`      | User taps the update CTA                   | `target_store`                          |
| `force_update.back_blocked`    | User attempted to bypass                   | `attempt_method`                        |

## Tests

- **Unit**: renders correctly; CTA opens the right store URL per platform; back-press is suppressed.
- **Integration**: navigation `reset` ensures no other screen is in the stack; mock version check returning `force_update_required` triggers this screen.
- **E2E**: simulate an old client by mocking the version response; verify the user lands here and cannot bypass.

## Definition of Done

- [ ] Force Update screen implemented
- [ ] Stack reset on entry (non-bypassable)
- [ ] Platform-aware store URL
- [ ] Localized copy (pt-BR + en-US)
- [ ] Telemetry events
- [ ] Tests passing per strategy

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references
- React Navigation `reset`: https://reactnavigation.org/docs/navigation-actions#reset
- Linking (open store URLs): https://reactnative.dev/docs/linking
- Hardware back-button handling: https://reactnative.dev/docs/backhandler

### Project context
- App initialization: `02-app-initialization.md`
- Routing decision: `03-routing-decision.md`
- `CLAUDE.md`
