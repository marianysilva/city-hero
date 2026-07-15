# City Select · GPS auto-detect closest active city

> **Type:** Screen feature · Geo\
> **Screen:** SCREEN 02 · Choose City\
> **Effort:** M (1-2 days)\
> **Dependencies:** `02-city-select/02-cities-catalog-api.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `geo`, `permissions`

## Context

When the user opens the City Select screen, the app asks for location and matches the device's
coordinates against the catalog's bounding boxes (or centroids) to pre-select the most likely city.
This converts the choice from "search and tap" to "tap to confirm" for the typical user — a
significant friction reduction.

## User Story

**As a** Citizen physically in a supported city,\
**I want** the app to detect where I am,\
**In order to** confirm with one tap instead of searching.

## Acceptance Criteria

### Scenario · First-time permission prompt

**Given** the user has not yet been asked for location permission\
**When** the screen mounts\
**Then** the app shows a contextual pre-prompt explaining why we need location ("Pra detectar sua
cidade")\
**And** if the user accepts the pre-prompt, the OS permission dialog appears\
**And** if granted, GPS detection runs

### Scenario · Permission already granted

**Given** the user previously granted location permission\
**When** the screen mounts\
**Then** GPS detection runs immediately without prompting again

### Scenario · Permission denied

**Given** the user denied location permission\
**When** the screen mounts\
**Then** the GPS detection card is hidden\
**And** a small "Ativar GPS" link appears near the search bar (re-prompts if possible, otherwise
opens system settings)\
**And** the user can still pick a city manually

### Scenario · GPS detection succeeds inside an active city's bbox

**Given** the device location is inside an active city's bounding box (or within a small radius of
its centroid)\
**When** detection completes\
**Then** the GPS card displays the matched city's name and the GPS precision (e.g., "8m")\
**And** offers a "Confirmar ✓" CTA that selects that city (delegates to task
`05-select-and-activate-tenant`)

### Scenario · GPS detection lands on a coming-soon city

**Given** the device is inside a coming-soon city's bbox\
**When** detection completes\
**Then** the GPS card shows the city name with a "Em breve" indicator\
**And** the CTA changes to "Avise-me" (offers to join the waitlist via task 06)\
**And** the user can still pick another city manually

### Scenario · GPS detection lands outside any catalog city

**Given** the device location doesn't match any city's bbox\
**When** detection completes\
**Then** the GPS card is hidden (or shows a soft message: "Não encontramos sua cidade ainda")\
**And** the user can search/pick manually\
**And** a waitlist CTA is offered with the user's coordinates so we can prioritize expansion

### Scenario · GPS unavailable / inaccurate

**Given** the GPS sensor returns a low-accuracy result (>500m) or fails to lock\
**When** detection times out (e.g., 5s)\
**Then** the GPS card is hidden\
**And** the screen falls back to manual selection without showing an error

### Scenario · GPS denied permanently

**Given** the user denied permission and chose "Don't ask again"\
**When** the screen mounts\
**Then** no system dialog is shown\
**And** the "Ativar GPS" link opens the system settings page directly

### Scenario · User changes GPS suggestion

**Given** the GPS card pre-suggests "Pôrto Belo" but the user lives in Bombinhas (a neighbor)\
**When** the user picks a different city manually\
**Then** the manual choice wins\
**And** the GPS card is replaced/dismissed

## Frontend (React Native / Expo)

### Where it lives

```
apps/city-hero/src/screens/CitySelect/
├── hooks/
│   ├── useLocationPermission.ts
│   └── useCityFromGps.ts
└── components/
    └── GpsPrePrompt.tsx
```

### Behavior

- The pre-prompt is a small modal/sheet explaining the reason. Only after the user accepts does the
  OS permission dialog appear.
- `useLocationPermission` wraps the platform permission API (granted, denied, blocked).
- `useCityFromGps` requests a one-shot location fix with reasonable accuracy (`Balanced` mode),
  times out after 5 seconds, and matches against the catalog's `bbox` (preferring exact match) or,
  failing that, the nearest centroid within ~25 km.
- The matching logic runs locally on the device using the catalog's geo data — no extra backend
  call.
- The screen orchestrates: it shows the GPS card only when there's a confident match.

### Permission UX

- Pre-prompt phrased positively, focusing on user benefit.
- Permission requested only on the City Select screen — not at app launch.
- If denied, no nagging; the user can always ask later.

### Accuracy

A "low-accuracy" GPS fix (e.g., 500m+) can still uniquely identify a city in well-spaced regions, so
the match logic doesn't reject low-accuracy fixes outright. It only rejects fixes outside any bbox.

## Backend

Not applicable to this task. The catalog includes the geographic data needed for matching
(`centroid`, `bbox`).

## Database

Not applicable directly.

## Edge Cases

- **User on a flight, no signal**: GPS fails; manual selection used.
- **Device VPN spoofing GPS**: not the device's GPS — the actual sensor reads through the OS, not
  the network. This is fine for the MVP.
- **Two cities with overlapping bboxes** (rare): nearest centroid wins.
- **Cached location** (last-known): use only if fresh (≤5 min) to avoid stale matches.
- **Battery saver mode**: respect the OS's reduced accuracy mode; the pre-prompt mentions accuracy
  may be lower.

## Privacy / LGPD

- The user's coordinates are used only locally for matching against the catalog. **They are not sent
  to the backend** in this task.
- If the user lands outside any city and we offer a waitlist (task 06), the coordinates can be sent
  — only with explicit consent and for the stated purpose.
- The pre-prompt text mentions data usage transparently.

## Analytics

| Event                                | When                         | Props                   |
| ------------------------------------ | ---------------------------- | ----------------------- |
| `city_select.gps_pre_prompt_shown`   | Pre-prompt rendered          | —                       |
| `city_select.gps_permission_granted` | OS dialog accepted           | —                       |
| `city_select.gps_permission_denied`  | OS dialog denied             | `permanent: bool`       |
| `city_select.gps_match_found`        | Catalog match found          | `city_id`, `accuracy_m` |
| `city_select.gps_no_match`           | Coordinates outside any bbox | `accuracy_m`            |

## Tests

- **Unit**: matching logic — bbox preferred, centroid fallback, confidence threshold; permission
  state machine.
- **Integration**: granted → fix returned → match → card displayed; denied → card hidden + manual
  link.
- **E2E**: simulate granted permission and a known-coordinate device; verify the pre-suggested city.

## Definition of Done

- [ ] Pre-prompt component
- [ ] Permission management hook
- [ ] One-shot GPS fix with timeout
- [ ] Local matcher against the catalog (bbox + centroid)
- [ ] GPS card wiring on the screen
- [ ] Permanent-denial flow opens system settings
- [ ] Privacy-first telemetry (no raw coordinates)
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- expo-location: https://docs.expo.dev/versions/latest/sdk/location/
- iOS location authorization best practices:
  https://developer.apple.com/documentation/corelocation/requesting-authorization-for-location-services
- Android runtime permissions: https://developer.android.com/training/location/permissions

### Project context

- Cities catalog: `02-cities-catalog-api.md`
- Selection: `05-select-and-activate-tenant.md`
- Waitlist: `06-waitlist-coming-soon.md`
- `CLAUDE.md`
