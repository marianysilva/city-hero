# Irregularity Report · Step 3 · Form fields

> **Type:** Screen feature · UI + state\
> **Screen:** SCREEN 24 · Irregularity Report\
> **Effort:** M (1-2 days)\
> **Dependencies:** `24-irregularity-report/01-render-irregularity-ui-base.md`,
> `24-irregularity-report/03-step-2-authority-selection.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `forms`

## Context

Step 3: the actual form. Fields include: a structured summary (what happened, where, when), location
pin (optional), evidence attachments (photos, documents), and a short narrative.

Pre-fills use context from steps 1-2 plus the user's current location. The form follows what the
chosen authority expects (each authority's form has different required fields — task 02's
authorities catalog defines this).

## Acceptance Criteria

### Scenario · Default render

**Given** the user reaches step 3\
**When** the form renders\
**Then** the required fields per the chosen authority appear\
**And** pre-fills apply where applicable

### Scenario · Per-authority field set

**Given** different authorities require different fields\
**When** the form renders for CGU\
**Then** CGU-specific fields appear (e.g., "Programa federal", "Onde ocorreu", "Suspeita")\
**And** for Ouvidoria, simpler fields appear

### Scenario · Optional attachments

**Given** the user wants to attach evidence\
**When** they tap "Anexar foto" or "Anexar documento"\
**Then** the OS picker opens (photos via camera + gallery; documents via system picker)\
**And** chosen items appear as a row of thumbnails

### Scenario · Pre-fill location

**Given** the user granted location permission\
**When** the form renders\
**Then** the location field pre-fills with the current GPS coords\
**And** the user can adjust or clear

### Scenario · Validation

**Given** the user submits with missing required fields\
**When** the action runs\
**Then** errors highlight inline\
**And** Continuar stays disabled

### Scenario · Narrative cap

**Given** the user types in the narrative\
**When** they reach the cap (configurable, e.g., 1000 chars)\
**Then** input truncates / blocks further\
**And** a counter shows the limit

### Scenario · Localization

**Given** en-US\
**When** the form renders\
**Then** field labels translate

### Scenario · Accessibility

**Given** SR is on\
**When** the user navigates fields\
**Then** each is labeled with required/optional status

## Frontend

```
apps/city-hero/src/screens/IrregularityReport/
├── steps/
│   └── Step3FormFields.tsx
└── hooks/
    └── useIrregularityForm.ts
```

The hook holds field values + validation state.

## Backend

Not applicable for this step (the data is held client-side until the handoff in step 5).

The authorities catalog (from task 03) defines each authority's required-fields schema, which drives
the form.

## Database

Not applicable.

## Edge Cases

- **Large file attachments**: client-side resize for photos; size warning for documents.
- **Permission denied for attachments**: graceful fallback (form still allowed without).

## Privacy / LGPD

The form data is held in memory only. **Nothing is transmitted to CityHero's backend.** Attachments
are read locally and included in the eventual mailto/handoff (task 06).

## Analytics

| Event                             | When               | Props        |
| --------------------------------- | ------------------ | ------------ |
| `irregularity.form_field_changed` | Field changed      | `field`      |
| `irregularity.attachment_added`   | Attachment chosen  | `kind: photo | document` |
| `irregularity.attachment_removed` | Attachment removed | `kind`       |

## Tests

- **Unit**: field validation; cap; attachment add/remove.
- **Integration**: per-authority fields render correctly.
- **A11y**: fields labeled.

## Definition of Done

- [ ] Step3FormFields screen
- [ ] useIrregularityForm hook
- [ ] Per-authority field set
- [ ] Pre-fills (program, location)
- [ ] Attachments (photo + document)
- [ ] Validation + cap
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Cross-cutting: `docs/engineering/`
- `CLAUDE.md`
