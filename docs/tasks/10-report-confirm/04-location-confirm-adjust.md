# Report Confirmation · Location confirm + adjust

> **Type:** Screen feature · UI + geo
> **Screen:** SCREEN 10 · Report Confirmation
> **Effort:** S (≤1 day)
> **Dependencies:** `10-report-confirm/01-render-confirm-ui-base.md`, `09-manual-report/04-mini-map-location.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `geo`

## Context

A compact location row showing the address, the GPS accuracy, and a
small "validado ao vivo" indicator confirming the fix was captured at
the moment of the photo (anti-fraud signal). An "Ajustar" link reuses
the full-screen adjust map from `09-manual-report/04` for finer
correction if needed.

## User Story

**As a** Citizen confirming a report,
**I want** to see and quickly tweak the location,
**In order to** ensure the prefecture knows exactly where to go.

## Acceptance Criteria

### Scenario · Default render with fresh fix

**Given** the user has a fresh fix at capture
**When** the row renders
**Then** a 📍 icon and the address appear ("R. São Pedro, 320")
**And** the GPS accuracy and "validado ao vivo" appear in a smaller secondary line ("GPS precisão 4m · validado ao vivo")
**And** an "Ajustar" link is on the right

### Scenario · Tap "Ajustar"

**Given** the user taps "Ajustar"
**When** the action runs
**Then** the full-screen adjust map opens (the same one from `09-manual-report/04`)
**And** confirming returns to the confirmation screen with the new location
**And** canceling returns with the original location

### Scenario · Outside the city after adjust

**Given** the user moved the pin outside the active city
**When** they return to the confirmation screen
**Then** the row shows a small "Fora de {city_name}" warning
**And** the submit logic (task 08) handles the warning per server-side validation

### Scenario · Stale fix

**Given** the captured fix is now stale (more than ~5 minutes old by the time the user is reviewing)
**When** the row renders
**Then** a small "Atualizar" affordance appears
**And** tapping it requests a fresh fix
**And** if successful, the address re-reverse-geocodes

### Scenario · No GPS attached

**Given** the user came from manual report with no GPS (rare, but possible)
**When** the row renders
**Then** it shows a friendly empty state ("Sem localização · Ajustar pra colocar o pin")
**And** "Ajustar" is the primary action; the user must place the pin before submitting

### Scenario · Reverse geocoding failure

**Given** reverse geocoding failed
**When** the address area renders
**Then** the raw coordinates show as a fallback ("-27.157, -48.555")
**And** the user can still submit; server-side enrichment may re-resolve

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the row
**Then** the address and accuracy are read in order
**And** the "validado ao vivo" indicator is announced when present
**And** the "Ajustar" link is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ReportConfirm/
└── components/
    └── LocationField.tsx
```

The component renders into the `location` slot from task 01. It reads the location state from a shared store (the same `useReportLocation` from `09-manual-report/04`) so the adjust flow naturally syncs.

### Behavior

- Compact presentation with primary line (address) and secondary line (accuracy + validation signal).
- Tapping "Ajustar" opens the full-screen adjust modal.
- The "validado ao vivo" indicator appears only when the fix's `source` is `live` and freshness is within bounds.

## Backend

This task doesn't introduce backend endpoints. The location data travels with the report-create payload (task 08).

## Database

The `reports` table holds `geo`, `address`, `gps_accuracy_m`, `gps_source`, and freshness fields (all owned by the report-creation flow).

## Edge Cases

- **Address changes between adjust openings**: the row re-renders consistently.
- **Indoor vs outdoor accuracy differences**: the display is honest about accuracy; UX accepts what's available.
- **City selector changed between capture and confirm** (rare): the warning logic reflects the current active city.

## Privacy / LGPD

Coordinates travel with the report submission. The fix source and accuracy do not identify the user but help anti-fraud.

## Analytics

| Event                               | When                       | Props              |
| ----------------------------------- | -------------------------- | ------------------ |
| `report_confirm.adjust_pressed`     | User taps Ajustar          | —                  |
| `report_confirm.location_refreshed` | User taps the refresh hint | `from_age_seconds` |

## Tests

- **Unit**: row renders correctly across states (fresh, stale, no GPS, fail).
- **Integration**: adjust modal updates the shared location store.
- **A11y**: indicator and link labeled.

## Definition of Done

- [ ] LocationField component
- [ ] Reuse of `useReportLocation` from manual report
- [ ] Adjust modal reuse
- [ ] State variants handled (fresh, stale, no GPS, geocode fail)
- [ ] Outside-city warning
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-confirm-ui-base.md`
- Mini-map / adjust modal (reused): `09-manual-report/04-mini-map-location.md`
- Foundation map: `00-foundation/10-leaflet-map-wrapper.md`
- `CLAUDE.md`
