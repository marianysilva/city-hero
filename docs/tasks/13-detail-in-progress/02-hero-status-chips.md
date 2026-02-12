# Detail · In Progress · Hero + status chips

> **Type:** Screen feature · UI
> **Screen:** SCREEN 13 · Detail · In Progress
> **Effort:** S (≤1 day)
> **Dependencies:** `13-detail-in-progress/01-render-detail-ui-base.md`, `00-foundation/08-anonymization-pipeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The tall photo hero with a vertical gradient overlay for legibility, a
small "ABERTO HÁ N DIAS" pill in the top-left, two status chips at the
bottom-left (category + state), and overlay buttons (back at top-left,
overflow ⋯ at top-right). The hero handles photo states: anonymized,
anonymizing, placeholder.

## User Story

**As a** Citizen opening a detail screen,
**I want** to immediately see the photo and the report's status,
**In order to** orient myself before reading details.

## Acceptance Criteria

### Scenario · Anonymized photo

**Given** the report's anonymization completed
**When** the hero renders
**Then** the photo fills the hero area (object-fit cover)
**And** a vertical gradient overlay (transparent → translucent black) at the top and bottom keeps overlays legible
**And** the small "ABERTO HÁ 5 DIAS" pill (or accurate age) appears next to the back button at the top-left
**And** two status chips at the bottom-left: category ("💡 POSTE") and state ("⚡ EM ANDAMENTO")

### Scenario · Status chip variants

**Given** the report's status is `open` / `in_progress` / `pending`
**When** the chips render
**Then** the state chip uses a color matching the status (amber for in_progress, sky for triage, slate for open without prefecture action yet)
**And** the chip has a small pulsing dot when actively being worked on (e.g., agendado for hoje/amanhã)

### Scenario · Photo anonymizing

**Given** the photo is still anonymizing
**When** the hero renders
**Then** a soft "Anonimizando…" overlay replaces the photo
**And** the rest of the chips and pills render normally
**And** the hero updates when the pipeline completes

### Scenario · No photo

**Given** the report has no photo (manual flow without photo)
**When** the hero renders
**Then** the hero area shows a large category emoji on a soft brand background
**And** the chips still appear

### Scenario · Long category names

**Given** the category label is long (e.g., "ÁRVORE / PODA")
**When** the chip renders
**Then** the chip width adapts; long labels truncate at a sensible point with ellipsis

### Scenario · Real-time status update

**Given** the user is on the screen
**When** the WebSocket delivers a status change (per `06-home-map/08`)
**Then** the state chip animates to the new value (color transition)
**And** the small pulsing dot updates accordingly
**And** the timeline (task 04) shows the new entry concurrently

### Scenario · Age computation

**Given** the report was created N days ago
**When** the age pill renders
**Then** the value is computed relative to the user's local clock
**And** "ABERTO HÁ 1 DIA" / "ABERTO HÁ 5 DIAS" / "ABERTO HOJE" variants are supported
**And** for very old reports (>30 days), a more abstract "ABERTO HÁ 1 MÊS" / similar applies

### Scenario · Accessibility

**Given** screen reader is on
**When** the hero is read
**Then** the photo has a meaningful description (the category and address)
**And** the age pill is announced
**And** the status chips are announced as a group ("Lighting, in progress")

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/DetailInProgress/
└── components/
    ├── DetailHero.tsx
    └── StatusChipsRow.tsx
```

### Component behavior

- `DetailHero` receives the photo URL (anonymized), anonymization status, status data, and age in days. It renders the photo, gradient overlays, and pill.
- `StatusChipsRow` renders the category and state chips with the appropriate colors based on the design tokens and the status.
- Real-time updates flow via the React Query cache (per `06-home-map/08` pattern), which the hero subscribes to.

### Photo loading

The photo uses lazy loading with a blur placeholder while it loads. The blur is generated client-side from a thumbnail (or a tiny hash).

## Backend

This task doesn't introduce new endpoints. The photo URL, status, and timestamps come from the report's existing record.

## Database

Not applicable directly.

## Edge Cases

- **Status flips back and forth** (race in real-time updates): the latest server state wins; the UI animates smoothly without flicker.
- **The report's photo was rejected by anonymization** (pending reprocessing): the placeholder is shown; the user gets a soft hint.
- **Multi-tenant scoping**: the screen is gated by city scope; cross-tenant access returns 403.

## Privacy / LGPD

The hero shows only the **anonymized** photo. The reporter's identity is not exposed in this section — the summary card (task 03) is where attribution lives.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_in_progress.hero_rendered` | Hero mounted                               | `had_photo: bool`, `status`          |
| `detail_in_progress.status_changed_realtime` | WS status change                  | `from`, `to`                          |

## Tests

- **Unit**: photo state variants; age pill variants; status chip color mapping.
- **Snapshot**: anonymized, anonymizing, no-photo; each status.
- **A11y**: announcements verified.

## Definition of Done

- [ ] DetailHero component
- [ ] StatusChipsRow component
- [ ] Status color tokens
- [ ] Real-time status update wiring
- [ ] Age pill computation
- [ ] Photo state variants
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- expo-image (lazy + blur placeholder): https://docs.expo.dev/versions/latest/sdk/image/

### Project context
- Render UI base: `01-render-detail-ui-base.md`
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- Real-time pattern: `06-home-map/08-realtime-pin-updates.md`
- `CLAUDE.md`
