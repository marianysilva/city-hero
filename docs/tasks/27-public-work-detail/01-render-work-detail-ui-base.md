# Public Work Detail · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 27 · Public Work Detail
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

Reuses the shared **DetailShell** from `13-detail-in-progress/01` (hero, scroll container, sticky bottom CTA, overflow menu) with task-specific content. The status chips use construction-specific colors.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens a public work
**When** the screen renders
**Then** the shared DetailShell renders the hero, scroll area, and sticky bottom CTA
**And** the hero shows the latest construction photo or a category placeholder
**And** status chips at the bottom of the hero use construction-specific colors (per `26-public-works-list/04`)

### Scenario · Slot system

**Given** the screen exposes slots
**When** tasks plug in
**Then** named slots are: `hero`, `summary`, `timeline`, `gallery`, `documents-and-denunciar`

### Scenario · Back navigation

**Given** the user taps back
**When** the action runs
**Then** returns to SCREEN 26 (or the entry point)

### Scenario · Overflow menu

**Given** the user wants secondary actions
**When** they tap ⋯
**Then** a sheet shows: Compartilhar, Reportar problema, Salvar (future)

### Scenario · Accessibility

**Given** SR is on
**When** mounted
**Then** title and status announced

## Frontend

```
apps/city-hero/src/screens/PublicWorkDetail/
├── PublicWorkDetailScreen.tsx
├── PublicWorkDetailScreen.styles.ts
├── PublicWorkDetailScreen.test.tsx
└── components/
    └── (uses shared DetailShell)
```

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Work deleted** (rare): graceful empty state.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `public_work_detail.viewed`    | Screen mounts                              | `work_id`, `source`                  |
| `public_work_detail.back_pressed` | User taps back                          | —                                     |

## Tests

- **Unit**: slot rendering; overflow menu opens.
- **Snapshot**: light + dark.
- **A11y**: title labeled.

## Definition of Done

- [ ] PublicWorkDetailScreen reusing shared shell
- [ ] Status color mapping for construction
- [ ] Overflow menu wired
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Shared DetailShell: `13-detail-in-progress/01-render-detail-ui-base.md`
- Prototype: `design/index.html` (search `title: 'Detalhe da Obra'`)
- `CLAUDE.md`
