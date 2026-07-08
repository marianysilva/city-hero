# NPS Feedback · Reason tag grid

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 15 · NPS Feedback
> **Effort:** S (≤1 day)
> **Dependencies:** `15-nps-feedback/01-render-nps-ui-base.md`, `15-nps-feedback/03-rating-scale.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A wrap-flow grid of selectable reason chips inside a white card with the
label "O que mais pesou? (toque pra marcar)". The chips are split
between positive (⚡ Rápido, 🔧 Bem feito, 💬 Comunicação clara) and
negative (⏳ Demorou, 🧱 Solução provisória, 😕 Voltou a quebrar), plus
a few more available via a "+ Ver mais X" affordance.

The grid emphasis adapts to the user's rating: low ratings show negative
chips first; high ratings show positive chips first. This isn't biased
selection — both groups are always available, just visually weighted.

## User Story

**As a** Citizen rating a resolution,
**I want** quick tags to add nuance,
**In order to** explain my rating in 1-2 taps.

## Acceptance Criteria

### Scenario · Default render

**Given** the user picked the default rating ("Bom" / 4)
**When** the tag grid renders
**Then** the section label "O QUE MAIS PESOU?" appears with a small "(toque pra marcar)" hint
**And** a wrap grid of chips renders below
**And** 2-3 positive chips appear first (Rápido, Bem feito, Comunicação clara)
**And** 2-3 negative chips appear next (Demorou, Solução provisória, Voltou a quebrar)
**And** none are pre-selected (the user actively chooses)

### Scenario · Tap a chip

**Given** the user taps a chip
**When** the action runs
**Then** the chip toggles between selected (emerald-tinted bg + check badge) and unselected (slate bg)
**And** light haptic feedback fires
**And** the screen-level state tracks the selected set

### Scenario · Multi-select

**Given** the user selects multiple chips
**When** they pick more
**Then** all selected chips coexist
**And** there's no max (anti-spam limits at server level if needed)

### Scenario · Rating-driven emphasis

**Given** the user changed the rating to 1 or 2
**When** the tag grid re-renders
**Then** negative chips appear visually emphasized (first in the wrap order, slightly larger)
**And** positive chips remain available but de-emphasized
**And** if the user picks 5, positive chips become emphasized
**And** the reordering happens smoothly (no jarring flash)

### Scenario · "+ Ver mais X" tags

**Given** there's a longer catalog of NPS-specific tags
**When** the user taps "+ Ver mais 5 tags"
**Then** a bottom sheet opens with the full list
**And** picking any toggles selection the same way as the inline chips

### Scenario · Localization

**Given** the user's language is en-US
**When** chips render
**Then** labels are in English ("⚡ Fast", "🔧 Well done", "💬 Clear communication", "⏳ Slow", etc.)

### Scenario · Tag catalog is configurable

**Given** the prefecture wants to add or rename tags (per-city customization)
**When** the catalog config updates
**Then** the chips reflect the new catalog
**And** existing tag selections (from past submissions) remain associated with their original keys

### Scenario · Empty selection is fine

**Given** the user doesn't select any tags
**When** they continue to submit
**Then** the submit allows it (tags are optional)
**And** the rating + comment alone are sufficient

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the chips
**Then** each chip is announced as a button with its label and selection state
**And** the emphasis hint is conveyed via order, not via announcement (no separate "emphasized" label)

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/NpsFeedback/
├── components/
│   ├── ReasonTagGrid.tsx
│   ├── ReasonChip.tsx
│   └── MoreReasonsSheet.tsx
└── hooks/
    └── useNpsReasons.ts
```

### Component behavior

- `useNpsReasons` holds the selected set in screen-scoped state.
- `ReasonTagGrid` renders the chips based on the current rating (for emphasis ordering).
- `ReasonChip` is a presentational toggle.
- `MoreReasonsSheet` is the bottom sheet for the extended catalog.

### Catalog source

For MVP, the catalog is a static config in code (per-platform i18n keys + emoji). Future: a per-city configurable catalog server-side.

### Emphasis logic

A small sort function reorders the chips based on rating: negative-first for ratings ≤2, positive-first for ratings ≥4, neutral order for rating 3.

## Backend

This task doesn't introduce new endpoints; selected tags travel with the submit payload (task 06).

## Database

The NPS submission table (task 06) stores tag selections as an array of keys.

## Edge Cases

- **User changes rating after selecting tags**: the selections persist; only the visual order changes.
- **Catalog evolves over time**: old submissions keep their tag keys; new sessions see the new catalog.

## Privacy / LGPD

Tag selections are private until the submission, then aggregated for the prefecture's sentiment analysis.

## Analytics

| Event                  | When                            | Props                       |
| ---------------------- | ------------------------------- | --------------------------- |
| `nps.tag_selected`     | Tag toggled on                  | `tag_key`, `current_rating` |
| `nps.tag_unselected`   | Tag toggled off                 | `tag_key`                   |
| `nps.more_tags_opened` | User opened the more-tags sheet | —                           |

## Tests

- **Unit**: selection toggle; emphasis reorders based on rating; empty selection allowed.
- **Snapshot**: each rating's emphasis state.
- **A11y**: chips labeled and selection announced.

## Definition of Done

- [ ] ReasonTagGrid + ReasonChip components
- [ ] MoreReasonsSheet
- [ ] `useNpsReasons` hook
- [ ] Rating-driven emphasis logic
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Bottom Sheet: https://gorhom.dev/react-native-bottom-sheet

### Project context

- Render UI base: `01-render-nps-ui-base.md`
- Rating scale (drives emphasis): `03-rating-scale.md`
- `CLAUDE.md`
