# Public Work Detail · Milestones timeline

> **Type:** Screen feature · UI + content
> **Screen:** SCREEN 27 · Public Work Detail
> **Effort:** M (1-2 days)
> **Dependencies:** `27-public-work-detail/01-render-work-detail-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `backend`, `screen`

## Context

A vertical timeline of the work's milestones (similar pattern to `13-detail-in-progress/04` but with construction-specific states): Planejamento → Edital publicado → Licitação encerrada → Contrato assinado → Início das obras → Vistoria intermediária → Conclusão prevista → Conclusão. Each entry has a date, a short description, an actor (e.g., "Câmara Municipal", "Empresa X"), and an optional document link.

## Acceptance Criteria

### Scenario · Default render

**Given** milestones exist
**When** the timeline renders
**Then** entries appear chronologically with colored dots per state
**And** completed entries are full-color; future ones muted

### Scenario · Document links

**Given** an entry has a linked document (e.g., the edital)
**When** the user taps the link
**Then** the OS browser opens the source PDF

### Scenario · Tap for more

**Given** an entry has notes/context
**When** tapped
**Then** a sheet expands with the details

### Scenario · SLA / delay indicators

**Given** a milestone is behind schedule
**When** rendered
**Then** an "Atrasado X dias" amber pill appears next to it

### Scenario · Real-time updates

**Given** the prefecture updates a milestone
**When** the WS pushes
**Then** the new entry appears with animation

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** state labels translate

### Scenario · Accessibility

**Given** SR is on
**When** navigated
**Then** entries read as list items

## Frontend

```
apps/city-hero/src/screens/PublicWorkDetail/
└── components/
    ├── MilestonesTimeline.tsx
    ├── MilestoneEntry.tsx
    └── MilestoneDetailSheet.tsx
```

## Backend

| Method | Path                                   | Purpose         |
| ------ | -------------------------------------- | --------------- |
| GET    | `/api/v1/public-works/{id}/milestones` | Timeline events |

## Database

`public_work_milestones` table with: id, work_id, state, title_key, actor, occurred_at, scheduled_for, document_url, notes.

## Edge Cases

- **Document link broken**: graceful fallback (informs user).
- **Out-of-order updates**: timeline sorts by date.

## Privacy / LGPD

Public.

## Analytics

| Event                                  | When                 | Props         |
| -------------------------------------- | -------------------- | ------------- |
| `public_work_detail.timeline_rendered` | Mounted              | `entry_count` |
| `public_work_detail.milestone_tapped`  | User opened detail   | `state`       |
| `public_work_detail.document_pressed`  | User opened document | `state`       |

## Tests

- **Unit**: timeline rendering; SLA pill; document links.
- **Integration**: real-time updates.
- **A11y**: list semantics.

## Definition of Done

- [ ] MilestonesTimeline + MilestoneEntry + MilestoneDetailSheet
- [ ] Backend endpoint
- [ ] Real-time integration
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Similar pattern: `13-detail-in-progress/04-timeline.md`
- `CLAUDE.md`
