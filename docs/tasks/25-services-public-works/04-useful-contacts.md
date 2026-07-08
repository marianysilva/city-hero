# Services & Public Works · Useful contacts footer

> **Type:** Screen feature · UI + offline-capable
> **Screen:** SCREEN 25 · Services & Public Works
> **Effort:** S (≤1 day)
> **Dependencies:** `25-services-public-works/01-render-services-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`

## Context

A pinned section at the bottom listing emergency and important phone numbers: 192 (SAMU), 193 (Bombeiros), 199 (Defesa Civil), 198 (Polícia Rodoviária), plus the city's specific contacts (Ouvidoria, Plantão da Iluminação, Centro Cirúrgico, etc.). Tapping calls; long-press copies.

**Always available offline** — these are stored locally so they work
when the user needs them most.

## Acceptance Criteria

### Scenario · Default render

**Given** the user scrolled to the footer
**When** the section renders
**Then** a small "TELEFONES ÚTEIS" label appears
**And** below: a list of contact rows showing emoji + label + phone number

### Scenario · Tap to call

**Given** the user taps a row
**When** the action runs
**Then** the OS dialer opens with the number pre-filled
**And** the user confirms the call

### Scenario · Long-press to copy

**Given** the user long-presses a row
**When** the action runs
**Then** the number is copied to clipboard
**And** a toast confirms

### Scenario · Always offline-capable

**Given** the device is offline
**When** the user opens the screen
**Then** the contacts list still renders from local cache
**And** tap-to-call still works (uses the OS dialer, no network needed)

### Scenario · Per-city contacts

**Given** different cities have different contacts
**When** loaded
**Then** the user sees their city's contacts plus universal emergency numbers

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** the section label translates
**And** universal numbers (190, 192, etc.) stay numeric

### Scenario · Accessibility

**Given** SR is on
**When** the user navigates contacts
**Then** each row is announced with the label and number
**And** activation announces the call action

## Frontend

```
apps/city-hero/src/screens/ServicesPublicWorks/
└── components/
    └── UsefulContactsFooter.tsx
```

The component reads from the local services catalog cache (always available) + a small static list of universal emergency numbers.

## Backend

The contacts are part of the city services catalog (`city_services` with a flag `is_contact`).

## Database

Same as task 02; specific rows flagged `is_contact: true`.

## Edge Cases

- **Phone number changed**: catalog updates on next sync; cache may be stale briefly.
- **Tel: URI not supported on device** (rare): graceful fallback (copy to clipboard).

## Privacy / LGPD

Public numbers; no PII.

## Analytics

| Event                           | When                  | Props         |
| ------------------------------- | --------------------- | ------------- |
| `services.contact_call_pressed` | User tapped a contact | `contact_key` |
| `services.contact_copied`       | User long-pressed     | `contact_key` |

## Tests

- **Unit**: rendering; tap-to-call via OS Linking; long-press to copy.
- **Snapshot**: light + dark.
- **A11y**: rows labeled.

## Definition of Done

- [ ] UsefulContactsFooter component
- [ ] Universal emergency numbers always present
- [ ] City-specific contacts from catalog
- [ ] Offline cache
- [ ] Tel: URI handling
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Service cards grid (catalog source): `02-service-cards-grid.md`
- `CLAUDE.md`
