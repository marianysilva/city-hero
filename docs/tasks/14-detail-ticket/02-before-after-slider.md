# Detail · Ticket · Before/after slider hero

> **Type:** Screen feature · UI + interaction\
> **Screen:** SCREEN 14 · Detail · Ticket (resolved)\
> **Effort:** M (1-2 days)\
> **Dependencies:** `14-detail-ticket/01-render-detail-ticket-ui-base.md`,
> `00-foundation/08-anonymization-pipeline.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`, `interaction`

## Context

The interactive before/after slider that fills the hero area. The user sees the "antes" photo (the
citizen's original report) and the "depois" photo (the prefecture's confirmation that the problem
was resolved), with a vertical drag handle they can move horizontally to reveal more of one or the
other. A small "ANTES → DEPOIS" pill identifies the control.

This visualization is the **product's strongest emotional payoff** — when the user sees the actual
change, they feel the system worked.

## User Story

**As a** Citizen looking at a resolved report,\
**I want** to see the before-and-after side by side,\
**In order to** appreciate the impact and feel the system worked.

## Acceptance Criteria

### Scenario · Default render with both photos

**Given** the report has both the "antes" and "depois" anonymized photos\
**When** the slider renders\
**Then** the "antes" photo fills the hero by default\
**And** the "depois" photo overlays from the right side at 50% width\
**And** a vertical drag handle is centered with a small white circular knob\
**And** the "ANTES → DEPOIS" pill is in the top-left (next to the back button)

### Scenario · Drag handle

**Given** the user drags the handle horizontally\
**When** the drag moves left or right\
**Then** the "depois" overlay expands or contracts in real time\
**And** the handle follows the touch\
**And** the gesture feels smooth (60fps) on a mid-range device

### Scenario · Drag release with snap suggestions

**Given** the user releases the handle near 0% (showing only "antes")\
**When** the release fires\
**Then** the position can be left as-is (no snap by default)\
**And** if `prefers-reduced-motion` is on, the position holds without spring smoothing

### Scenario · Tap to toggle

**Given** the user taps anywhere on the hero (not on the handle)\
**When** the tap fires\
**Then** the slider animates to either "antes" or "depois" full-frame (alternating)\
**And** this provides an alternative to dragging (for accessibility / quick views)

### Scenario · "Depois" photo not yet uploaded

**Given** the prefecture marked the report resolved but hasn't uploaded the "depois" photo yet\
**When** the hero renders\
**Then** a single-photo hero ("antes" only) is shown\
**And** a translucent overlay reads "Aguardando foto 'depois' da prefeitura"\
**And** when the photo arrives via real-time update, the slider materializes

### Scenario · One or both photos still anonymizing

**Given** either photo is still going through the anonymization pipeline\
**When** the hero renders\
**Then** the affected half shows the "Anonimizando…" state\
**And** the drag handle still works (the unanonymized side simply shows the placeholder)\
**And** when ready, the photo replaces the placeholder

### Scenario · Reduced motion

**Given** the user has reduced motion preferences on\
**When** the slider renders\
**Then** the spring animations are disabled (drag still works; tap-to-toggle is instant)

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the hero\
**Then** the slider has a descriptive label ("Before-and-after comparison slider, currently showing
50 percent after")\
**And** an alternative button "Toggle before/after" is accessible via screen reader\
**And** the labels reflect the slider's current position

### Scenario · Performance

**Given** the user drags the handle quickly\
**When** the position updates\
**Then** the FPS stays at or above 30 on the target devices\
**And** the photo loading uses progressive techniques (smaller resolution while moving, full
resolution on settle)

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/DetailTicket/
└── components/
    └── BeforeAfterSlider.tsx
```

### Component behavior

- `BeforeAfterSlider` accepts the two photo URLs (anonymized), the anonymization status of each, and
  an optional default position.
- The drag handle uses `react-native-gesture-handler` and `react-native-reanimated` for performance.
- The "depois" overlay is positioned with a width tied to the shared value the drag updates.
- Tap-to-toggle is a separate gesture detector with hit-slop to avoid conflict with drag.

### Animation

- Drag: real-time, no interpolation.
- Tap-to-toggle: spring animation (200ms).
- Reduced motion disables the spring.

### Photo loading

Photos use `expo-image` with thumbnail-first loading. While the user drags, lower-resolution
variants render to avoid lag; when settled, full resolution is loaded.

## Backend

This task doesn't introduce new endpoints. The report's existing record includes both photo IDs
(`before_photo_id` and `after_photo_id`).

The "depois" photo is uploaded by the prefecture (via the field team app, or the manager panel)
through the same photo upload pipeline (`00-foundation/07`) and goes through anonymization
(`00-foundation/08`).

## Database

The `reports` table already has:

- `photo_id` — the original report's photo (the "antes").
- `resolution_photo_id` — the prefecture's confirmation photo (the "depois"), nullable until
  resolved.

Schema is owned by the report-creation and resolution flows.

## Edge Cases

- **Both photos identical** (rare, but possible if the prefecture uploads by mistake): the slider
  still works; the visual difference is just zero. A small warning may be surfaced internally for
  moderation.
- **Photo orientation differs** (one portrait, one landscape): both are normalized to the hero's
  aspect ratio with cover-fit.
- **Tap while dragging**: the gesture detector prioritizes drag; tap is suppressed.

## Privacy / LGPD

Both photos shown are **anonymized**. The raw versions never reach the client.

## Analytics

| Event                                | When                                          | Props                |
| ------------------------------------ | --------------------------------------------- | -------------------- |
| `detail_ticket.slider_dragged`       | User dragged the handle (debounced)           | `final_position_pct` |
| `detail_ticket.slider_tap_toggled`   | User tapped to toggle                         | `to: before          | after` |
| `detail_ticket.depois_pending_shown` | The "Aguardando foto depois" overlay appeared | —                    |

## Tests

- **Unit**: drag updates position correctly; tap-to-toggle alternates; reduced motion respected.
- **Snapshot**: both states; pending state; anonymizing state.
- **A11y**: labels and alternative button verified.
- **Performance**: FPS measured during drag in CI on a target device profile.

## Definition of Done

- [ ] BeforeAfterSlider component
- [ ] Drag handle with gesture handler + reanimated
- [ ] Tap-to-toggle alternative
- [ ] Reduced motion respected
- [ ] Pending and anonymizing states
- [ ] Progressive photo loading
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native Gesture Handler: https://docs.swmansion.com/react-native-gesture-handler/
- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/
- expo-image: https://docs.expo.dev/versions/latest/sdk/image/

### Project context

- Render UI base: `01-render-detail-ticket-ui-base.md`
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- `CLAUDE.md`
