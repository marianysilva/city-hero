# Public Work Detail · Summary card

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 27 · Public Work Detail
> **Effort:** S (≤1 day)
> **Dependencies:** `27-public-work-detail/01-render-work-detail-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`

## Context

A white card overlapping the hero with the work's primary facts: title, address, contractor, budget, dates, and a progress bar. Status pill at the top.

## Acceptance Criteria

### Scenario · Default render

**Given** the work has data
**When** the summary renders
**Then** title + address + status pill at the top
**And** a 4-cell KPI grid: budget, contracted amount, start date, end date
**And** a progress bar showing % complete
**And** contractor name and bidding link below

### Scenario · Budget transparency

**Given** the work is post-bidding
**When** the card renders
**Then** the contracted amount + winning bidder appear
**And** for works in bidding, "Em licitação" is shown

### Scenario · Progress bar

**Given** the work has progress reported
**When** the bar renders
**Then** it shows the percentage with a color matching the status

### Scenario · Date format

**Given** dates have specific formats
**When** rendered
**Then** dd/mm/yyyy for pt-BR; mm/dd/yyyy for en-US

### Scenario · Real-time updates

**Given** the work's status/progress changes
**When** the WS pushes
**Then** the card updates with subtle animation

### Scenario · Accessibility

**Given** SR is on
**When** the card is read
**Then** announced as a group with each field

## Frontend

```
apps/city-hero/src/screens/PublicWorkDetail/
└── components/
    └── WorkSummaryCard.tsx
```

## Backend

| Method | Path                        | Purpose     |
| ------ | --------------------------- | ----------- |
| GET    | `/api/v1/public-works/{id}` | Full detail |

## Database

`public_works` table (per `26-public-works-list/04`).

## Edge Cases

- **No contractor**: shown as "—" or "Em licitação" based on status.
- **No progress reported**: bar hidden; dates only shown.

## Privacy / LGPD

Public data.

## Analytics

| Event                                 | When    | Props                       |
| ------------------------------------- | ------- | --------------------------- |
| `public_work_detail.summary_rendered` | Mounted | `progress_bucket`, `status` |

## Tests

- **Unit**: render variants; progress bar; budget visibility.
- **Snapshot**: each state.
- **A11y**: group announced.

## Definition of Done

- [ ] WorkSummaryCard component
- [ ] Backend detail endpoint
- [ ] Real-time updates
- [ ] Localized formatting
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-work-detail-ui-base.md`
- `CLAUDE.md`
