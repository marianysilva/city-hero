# Camera · Enrich mode integration

> **Type:** Screen feature · Cross-flow integration
> **Screen:** SCREEN 08 · Camera with AI (live)
> **Effort:** M (1-2 days)
> **Dependencies:** `08-camera-live/04-capture-shutter.md`, `08-camera-live/05-gps-validation-on-capture.md`, `07-civic-feed/08-enriquecer-action.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `cross-flow`

## Context

When the user taps "Enriquecer" on a feed card or detail screen
(`07-civic-feed/08-enriquecer-action.md`), the camera opens in **enrich
mode**: instead of creating a new report after capture, the photo is
attached to the existing report. The UI subtly signals the mode (a chip
showing the target report's category and address), the GPS validation
is stricter (within ~20m of the report's geo, not just within the city),
and post-capture the user lands on a slimmed confirmation flow.

## User Story

**As a** Citizen passing by an existing reported problem,
**I want** to add a fresh photo with one tap,
**In order to** give the prefecture the latest evidence and earn double XP.

## Acceptance Criteria

### Scenario · Enter enrich mode

**Given** the user tapped "Enriquecer" on a feed item for report `R`
**When** the camera opens
**Then** the top of the camera shows a chip "🕳️ Buraco · R. Central, 320" identifying the target report
**And** the bottom tip changes to "Mire no mesmo problema · ganhe +100 XP"
**And** the underlying AI detection still runs (the user benefits from the same UX)

### Scenario · Target chip tap

**Given** the enrich chip is visible
**When** the user taps it
**Then** a small bottom sheet shows the original report (anonymized photo thumbnail, description, support count)
**And** the user can confirm they're enriching the right one, or close the camera

### Scenario · GPS validation is stricter

**Given** the user is more than ~20m from the target report's geo
**When** they try to capture
**Then** the standard GPS validation (task 05) is augmented with a proximity check
**And** the capture is blocked with a "Você precisa estar no local" message and a "Ver no mapa" link
**And** the user can navigate to the map to see how far they are

### Scenario · Capture in enrich mode

**Given** the user is within range and taps the shutter
**When** the capture flow runs
**Then** the photo is captured with the standard pipeline
**And** instead of going to the new-report confirmation (SCREEN 10), it goes to a slimmed enrich confirmation
**And** the enrich confirmation only asks "Tudo certo? Vai pra prefeitura" with the photo preview

### Scenario · Enrich confirmation

**Given** the slimmed confirmation is shown
**When** the user confirms
**Then** the photo is uploaded and associated with the existing report via the enrich action (`07-civic-feed/08`)
**And** +100 XP is granted
**And** the user lands on the report's detail screen, where the new photo is visible

### Scenario · Anonymous enrichment

**Given** the user wants to enrich anonymously (e.g., for privacy)
**When** they toggle the anonymous option on the enrich confirmation
**Then** the enrichment is submitted with the user as anonymous to other citizens
**And** the prefecture still sees the user's identity (per LAI)

### Scenario · Switch back to new-report mode

**Given** the user is in enrich mode but decides they want to create a new report instead
**When** they tap the chip and pick "Reportar como novo"
**Then** the camera switches back to the standard mode
**And** the next capture creates a fresh report

### Scenario · Already-enriched check

**Given** the user already enriched this report today (per the once-per-day rule from `07-civic-feed/08`)
**When** they open the camera in enrich mode
**Then** a soft sheet appears: "Você já enriqueceu esse reporte hoje · volta amanhã"
**And** the user can switch to new-report mode or close

### Scenario · Offline enrichment

**Given** the device is offline
**When** the user captures in enrich mode
**Then** the photo + association is queued via the offline queue
**And** the optimistic UI shows the photo as "pending sync"
**And** the queue handles the rest (same path as a regular enrich action)

### Scenario · Multi-tenant scoping

**Given** the target report's city doesn't match the user's active city (shouldn't happen normally, but a sanity check)
**When** the camera enters enrich mode
**Then** the screen prevents the flow and routes back to the source screen with an explanation

### Scenario · Accessibility

**Given** screen reader is on
**When** the user enters enrich mode
**Then** the mode is announced ("Camera, enrich mode, target: Buraco at R. Central 320")
**And** the chip is focusable and explains the target

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Camera/
├── components/
│   ├── EnrichTargetChip.tsx
│   └── EnrichConfirmationScreen.tsx
└── hooks/
    └── useEnrichMode.ts
```

### Behavior

- The camera screen receives a `mode` navigation param: `new_report` (default) or `enrich` with a `target_report_id`.
- `useEnrichMode` fetches the target report's lightweight metadata (category, address, geo, photo thumbnail, support count) when entering enrich mode.
- The capture flow (task 04) is reused with a different post-capture route: enrich confirmation instead of new-report confirmation.
- GPS validation (task 05) is configured to enforce the ~20m proximity check.
- The slim confirmation screen uses the photo upload pipeline and the enrich endpoint via the action service from `07-civic-feed/08`.

### Visual differentiation

The chip uses a soft brand-tinted background to differentiate from the standard top bar. The tip text changes accordingly. Everything else remains consistent with the standard camera UI.

## Backend (FastAPI)

This task does not introduce new backend endpoints — it reuses the enrich endpoint from `07-civic-feed/08-enriquecer-action.md` (`POST /api/v1/reports/{id}/enrich`).

For the chip, a lightweight endpoint is used to fetch the target metadata:

| Method | Path                           | Purpose                          |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/api/v1/reports/{id}/summary` | Lightweight summary for previews |

This endpoint returns a minimal subset (category, address, geo, photo thumbnail URL, support count, status) suitable for previews.

## Database

No new schema. Reuses `reports`, `report_enrichments`, and related tables defined elsewhere.

## Edge Cases

- **Target report status changed to resolved before capture**: the enrich chip surfaces a hint ("Esse problema foi resolvido"); the user can switch to new-report or close.
- **Target report deleted between entering enrich and capture**: the sheet explains and offers switch-to-new.
- **Latency on the target metadata fetch**: the chip shows a small skeleton while loading.
- **The user wants to enrich a different report**: they need to exit and re-tap Enriquecer on the new card.

## Privacy / LGPD

- The enrich photo passes through the same anonymization pipeline as new-report photos.
- Anonymous enrichment is supported; the same rules apply.

## Analytics

| Event                              | When                                      | Props        |
| ---------------------------------- | ----------------------------------------- | ------------ |
| `camera.enrich_mode_entered`       | Camera opens in enrich mode               | `report_id`  |
| `camera.enrich_target_chip_tapped` | User taps the chip                        | `report_id`  |
| `camera.enrich_blocked_too_far`    | Proximity check failed                    | `distance_m` |
| `camera.enrich_captured`           | Capture in enrich mode                    | `report_id`  |
| `camera.enrich_switched_to_new`    | User exited enrich to create a new report | `report_id`  |

## Tests

- **Unit (frontend)**: mode switching; proximity check; navigation to slim confirmation; offline queue path.
- **Integration**: enter enrich mode → capture → confirm → +100 XP credited.
- **E2E**: simulate location near a seeded report → tap Enriquecer → see chip → capture → confirm → see photo added on the detail screen.

## Definition of Done

- [ ] Camera accepts `mode=enrich&target_report_id=` navigation param
- [ ] EnrichTargetChip component
- [ ] EnrichConfirmationScreen (slim flow)
- [ ] Proximity check (~20m) in GPS validation when in enrich mode
- [ ] Lightweight target summary endpoint
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Security (anti-fraud, proximity): `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Navigation params: https://reactnavigation.org/docs/params/

### Project context

- Enriquecer action (full spec): `07-civic-feed/08-enriquecer-action.md`
- Capture / shutter: `04-capture-shutter.md`
- GPS validation: `05-gps-validation-on-capture.md`
- Render UI base: `01-render-camera-ui-base.md`
- `docs/user-stories.md` (US: Collaborative Evidence)
- `CLAUDE.md`
