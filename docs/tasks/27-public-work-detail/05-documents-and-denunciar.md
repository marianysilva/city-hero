# Public Work Detail · Documents links + Denunciar CTA

> **Type:** Screen feature · UI + accountability
> **Screen:** SCREEN 27 · Public Work Detail
> **Effort:** S (≤1 day)
> **Dependencies:** `27-public-work-detail/01-render-work-detail-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `accountability`

## Context

A small section listing the work's official documents (Edital, Contrato, Termo de Adjudicação, etc.) with tap-to-open links. Below: the sticky bottom CTA "🛡️ Denunciar irregularidade" routes to SCREEN 24 with the work's identifier pre-filled.

## Acceptance Criteria

### Scenario · Default render

**Given** the work has linked documents
**When** the section renders
**Then** a small "DOCUMENTOS PÚBLICOS" label
**And** below: a list of document rows showing 📄 icon + name + tap-to-open link

### Scenario · Tap a document

**Given** the user taps a row
**When** the action runs
**Then** the OS browser opens the document URL

### Scenario · No documents

**Given** the work has no linked documents
**When** the section renders
**Then** a soft message indicates the documents will be available as the work progresses

### Scenario · Denunciar CTA (sticky)

**Given** the user wants to file an irregularity report
**When** they tap the CTA
**Then** the app navigates to SCREEN 24 with `program=public_works&work_id=...` pre-fill

### Scenario · Compartilhar (overflow menu)

**Given** the user wants to share the work
**When** they use the overflow menu
**Then** the share sheet opens with a link to the work's public page

### Scenario · Accessibility

**Given** SR is on
**When** the section is read
**Then** documents announced as links
**And** the Denunciar CTA labeled with destination

## Frontend

```
apps/city-hero/src/screens/PublicWorkDetail/
└── components/
    ├── DocumentLinks.tsx
    └── DenunciarBottomCta.tsx
```

The Denunciar CTA reuses the shared pattern from `22-programs-transparency/06-footer-and-denunciar.md`.

## Backend

The documents come from the work detail endpoint (a `documents` field with arrays of {label, url}).

## Database

`public_works.documents` (jsonb).

## Edge Cases

- **Link broken**: graceful fallback.
- **Document is large PDF**: opens in browser; user can save.

## Privacy / LGPD

Public documents.

## Analytics

| Event                                  | When                   | Props  |
| -------------------------------------- | ---------------------- | ------ |
| `public_work_detail.document_pressed`  | User opened a document | `kind` |
| `public_work_detail.denunciar_pressed` | User tapped Denunciar  | —      |

## Tests

- **Unit**: rendering; tap fires browser; pre-fill context propagation.
- **Snapshot**: with and without documents.
- **A11y**: links labeled.

## Definition of Done

- [ ] DocumentLinks component
- [ ] DenunciarBottomCta wiring
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Denunciar Irregularity screen: `docs/tasks/24-irregularity-report/`
- `CLAUDE.md`
