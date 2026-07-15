# Onboarding · Neighborhood · Location permission and feed radius

> **Type:** Screen feature · Permissions + state\
> **Screen:** SCREEN 05 · Onboarding · Your Neighborhood\
> **Effort:** M (1-2 days)\
> **Dependencies:** `05-onboarding-neighborhood/01-render-onboarding-neighborhood-ui.md`,
> `02-city-select/04-gps-auto-detect.md`, `03-onboarding-camera/02-onboarding-step-machine.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `permissions`, `screen`, `geo`

## Context

Where the app actually requests **location permission** (the GPS auto-detect on City Select asked
for one-shot location, but here we're requesting ongoing access for the Home map and report
capture). Also where the **feed radius** default (10km) is set, and where onboarding is **marked
complete** so the user lands on Home next.

This task ties the user's choice to multiple downstream behaviors: hyperlocal feed scoping, GPS
validation for reports (anti-fraud), and nearby push alerts.

## User Story

**As a** Citizen finishing onboarding,\
**I want** to grant location so the app shows my neighborhood,\
**In order to** see relevant content from day one.

**As a** Citizen who prefers privacy,\
**I want** to defer granting location permission and still use the app,\
**In order to** report problems without sharing my location continuously.

## Acceptance Criteria

### Scenario · Pre-prompt before OS dialog

**Given** the user has not yet granted "always" or "while-using" location permission\
**When** they tap the primary CTA "Permitir localização"\
**Then** a contextual pre-prompt appears explaining the benefit ("Pra centralizar o mapa no seu
bairro e validar onde você reporta")\
**And** if they accept, the OS permission dialog appears\
**And** if they decline the pre-prompt, no OS dialog is shown and onboarding completes (Home opens
with city-centroid view)

### Scenario · Permission granted

**Given** the OS dialog was shown and the user granted permission\
**When** the result returns\
**Then** the feed radius is set to the default (10km)\
**And** onboarding is marked complete via the state machine\
**And** the user is navigated to Home\
**And** the Home map will center on the user's GPS position

### Scenario · Permission denied (first time)

**Given** the OS dialog was shown and the user denied permission\
**When** the result returns\
**Then** a non-blocking message acknowledges the choice ("Sem problema · você pode ativar depois em
Ajustes")\
**And** onboarding is marked complete\
**And** the user is navigated to Home\
**And** the Home map will center on the active city's centroid

### Scenario · Permission denied permanently

**Given** the user previously denied with "Don't ask again"\
**When** they tap the primary CTA again\
**Then** no OS dialog is shown\
**And** the CTA opens the system settings page directly\
**And** if they grant from settings and return, the screen detects the change and proceeds

### Scenario · Already granted from City Select

**Given** the user already granted location permission at City Select\
**When** they reach this screen\
**Then** the primary CTA reads "Continuar →"\
**And** tapping it directly marks onboarding complete and routes to Home (no extra prompt)

### Scenario · Background vs. foreground location

**Given** the OS distinguishes "while using" and "always" permission\
**When** we request\
**Then** we ask only for "while using" — sufficient for the use case\
**And** we do not request "always" without a clear additional reason (per privacy best practices)

### Scenario · Defer permission ("Permitir depois")

**Given** the user taps the "Permitir depois" link instead of the primary CTA\
**When** the action runs\
**Then** no OS prompt is shown\
**And** onboarding is marked complete (the user did view all 5 steps)\
**And** the user is navigated to Home\
**And** the Home map falls back to the active city's centroid until permission is granted later via
Settings

### Scenario · Feed radius default applied

**Given** any of the paths above\
**When** onboarding completes\
**Then** the user's `feed_radius_km` preference is set to 10 (the default)\
**And** the user can change it later in Profile / City Profile

## Frontend (React Native / Expo)

### Where it lives

```
apps/city-hero/src/screens/Onboarding/Neighborhood/
├── hooks/
│   ├── useLocationPermission.ts
│   └── useFinalizeOnboarding.ts
└── components/
    └── PermissionPrePrompt.tsx
```

### Behavior

- `useLocationPermission` is shared with City Select (`02-city-select/04-gps-auto-detect.md`). It
  exposes the permission state and a `request()` function that handles the iOS / Android / Expo
  flow, including detecting "permanently denied" so we route to settings.
- `useFinalizeOnboarding` wraps the post-permission flow: writes the feed radius default to the user
  record (or local store if unauthenticated), marks onboarding complete via the state machine, and
  triggers navigation to Home.
- `PermissionPrePrompt` is a simple modal/sheet with a clear benefit statement and Continue / Cancel
  buttons.
- The screen tracks the permission state and updates the primary CTA label accordingly.

### State transitions

| State               | Primary CTA            | Action                      |
| ------------------- | ---------------------- | --------------------------- |
| Not requested       | "Permitir localização" | Show pre-prompt → OS dialog |
| Granted             | "Continuar →"          | Finalize and go to Home     |
| Denied (asked once) | "Permitir agora"       | Show pre-prompt → OS dialog |
| Permanently denied  | "Abrir Ajustes"        | Open system settings        |

### After settings return

When the user returns from system settings, the screen re-queries permission state and updates the
CTA accordingly. If granted, finalizing happens automatically (or with a confirmation tap, depending
on UX preference).

## Backend (FastAPI)

### Field on `users`

The `users` table gains:

| Column           | Type | Notes                         |
| ---------------- | ---- | ----------------------------- |
| `feed_radius_km` | int  | Default 10; constrained 1-100 |

### Endpoint reuse

Existing `PATCH /api/v1/auth/me` accepts `feed_radius_km` and `onboarding_seen_steps` /
`onboarding_completed_at` (already defined in the state machine task). No new endpoint needed.

For unauthenticated users, the radius is stored locally and merged on signup.

## Database

The `feed_radius_km` column on `users` is added via Alembic migration with a safe default.

## Edge Cases

- **Permission state changes between mount and CTA tap** (rare): state is re-queried just before the
  action.
- **Pre-prompt cancel after several attempts**: respect the user's pattern; a small contextual hint
  mentions they can change later in Settings.
- **Background fetch behavior**: not requested at this stage; "always" permission is out of scope
  for MVP.
- **iOS approximate location**: respect the user's choice; the app continues to work with
  approximate coordinates (with a slight loss of precision in radius validation).

## Privacy / LGPD

- The pre-prompt clearly states the purpose: "centralizar o mapa do seu bairro e validar localização
  ao reportar".
- We request only "while using" permission.
- Coordinates are not transmitted to the backend during onboarding; only on report capture or feed
  scoping (and even then, with the granular controls described in `security-baseline.md`).

## Analytics

| Event                                     | When                             | Props                        |
| ----------------------------------------- | -------------------------------- | ---------------------------- |
| `onboarding.location.pre_prompt_shown`    | Pre-prompt rendered              | —                            |
| `onboarding.location.pre_prompt_accepted` | User taps Continue on pre-prompt | —                            |
| `onboarding.location.pre_prompt_declined` | User cancels pre-prompt          | —                            |
| `onboarding.location.os_prompt_granted`   | OS dialog returned granted       | `precision: full             | reduced` |
| `onboarding.location.os_prompt_denied`    | OS dialog returned denied        | `permanent: bool`            |
| `onboarding.location.settings_opened`     | User opened system settings      | —                            |
| `onboarding.location.finalized`           | Onboarding marked complete       | `granted: bool`, `radius_km` |

## Tests

- **Unit**: state transitions; CTA label per state; pre-prompt logic; finalization sets radius and
  marks complete.
- **Integration**: granted path → finalize → state machine marks complete → navigation to Home;
  denied path → finalize without permission.
- **E2E**: simulate granted and denied paths on a real device.

## Definition of Done

- [ ] Pre-prompt component
- [ ] Permission management with permanent-denial handling
- [ ] CTA label changes per permission state
- [ ] Finalization hook (radius + state machine + navigation)
- [ ] Backend `feed_radius_km` column + accepts patch
- [ ] Privacy-first telemetry
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- expo-location: https://docs.expo.dev/versions/latest/sdk/location/
- iOS authorization best practices:
  https://developer.apple.com/documentation/corelocation/requesting-authorization-for-location-services
- Android runtime permissions: https://developer.android.com/training/location/permissions

### Project context

- City Select GPS detect: `02-city-select/04-gps-auto-detect.md`
- Onboarding state machine: `03-onboarding-camera/02-onboarding-step-machine.md`
- Render UI: `01-render-onboarding-neighborhood-ui.md`
- `CLAUDE.md`
